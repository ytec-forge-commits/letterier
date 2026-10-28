async page=>{
 const browser=page.context().browser(),results=[];
 for(const name of ['confirm','cancel','external-change','emoji','native-focus-transfer','character-geometry','clause-format']){
  const context=await browser.newContext();const test=await context.newPage();const errors=[];test.on('pageerror',e=>errors.push(e.message));
  try{await test.goto('http://127.0.0.1:1420/tests/browser/native-ime-contract.html');await test.waitForFunction(()=>window.harness?.session());
   const result=await test.evaluate(async name=>{
    const h=window.harness,session=h.session();let sequence=0;const emit=(kind,start=0,end=0,text='',selectionStart=1,selectionEnd=selectionStart)=>h.emit({kind,session,sequence:++sequence,start,end,text:Array.from({length:text.length},(_,i)=>text.charCodeAt(i)),selectionStart,selectionEnd,key:0,modifiers:0});
    if(name==='native-focus-transfer'){
     const count=()=>h.calls.filter(c=>c.args?.request?.op==='stop').length;
     const before=count();h.host.dispatchEvent(new FocusEvent('blur'));await new Promise(r=>setTimeout(r,0));
     if(count()!==before)throw Error('Native HWND focus transfer retired the active document connection');
     const button=document.createElement('button');document.body.append(button);button.focus();await new Promise(r=>setTimeout(r,0));
     if(count()!==before+1)throw Error('Moving to a toolbar did not release the native connection');
     h.binding.dispose();return {name,changes:0};
    }
    if(name==='character-geometry'){
     h.emit({kind:6,session,sequence:++sequence,start:0,end:2,selectionStart:1,selectionEnd:1,text:[],key:42,modifiers:0});await new Promise(r=>setTimeout(r,0));
     const request=h.calls.filter(c=>c.args?.request?.op==='characters').at(-1)?.args.request;
     if(!request||request.start!==0||request.revision!==42||request.rects.length!==2||request.rects.some(r=>!Number.isFinite(r.x)))throw Error('TSF did not receive actual DOM character geometry');
     emit(0,0,0,'前後');emit(1,1,1,'日本',3);
     const suffix=h.host.querySelector('[data-ime-preedit]').nextSibling,range=document.createRange();range.setStart(suffix,0);range.setEnd(suffix,1);const expected=range.getBoundingClientRect();
     h.emit({kind:6,session,sequence:++sequence,start:3,end:4,selectionStart:3,selectionEnd:3,text:[],key:43,modifiers:0});await new Promise(r=>setTimeout(r,0));
     const after=h.calls.filter(c=>c.args?.request?.op==='characters').at(-1)?.args.request?.rects[0];
     if(!after||Math.abs(after.x-expected.x)>.1||Math.abs(after.width-expected.width)>.1)throw Error('Character after preedit has the wrong geometry');
     h.binding.dispose();return {name,rectangles:request.rects.length,afterPreedit:true};
    }
    emit(0,0,0,'前後');const value=name==='emoji'?'😀':'日本';emit(1,1,1,value,3);
    if(h.text()!=='前後'||h.changes.length)throw Error('Preedit entered Project before confirmation');
    if(h.host.querySelector('[data-ime-preedit]')?.textContent!==value)throw Error('Native preedit was not rendered');
    if(name==='clause-format'){
     const format=(key,start=0,end=0)=>h.emit({kind:7,session,sequence:++sequence,start,end,selectionStart:3,selectionEnd:3,text:[],key,modifiers:0});format(0);format(1,1,2);format(2);
     const mark=CSS.highlights.get('letterier-ime-target');if(!mark||[...mark].map(r=>r.toString()).join('')!=='日')throw Error('Native conversion clause is not highlighted');
     emit(3,0,0,'',3);if(CSS.highlights.has('letterier-ime-target'))throw Error('Conversion highlight survived confirmation');h.binding.dispose();return {name,clause:'日'};
    }
    if(name==='cancel'){emit(1,1,3,'',1);emit(3,0,0,'',1);if(h.text()!=='前後')throw Error('Cancellation lost source text');}
    else if(name==='external-change'){h.host.dispatchEvent(new Event('letterier-before-document-change'));emit(1,1,3,'遅延',3);emit(3,0,0,'',3);if(h.text()!=='前後'||h.host.querySelector('[data-ime-preedit]')||!h.aborts.length)throw Error('Retired native events changed Project');}
    else {emit(3,0,0,'',3);if(h.text()!==`前${value}後`)throw Error('Native confirmation did not preserve Unicode and source');}
    if(!h.host.contains(h.token)||h.token.textContent!=='前後')throw Error('Preview did not restore browser-owned DOM');
    h.binding.dispose();emit(1,0,0,'終了後',3);return {name,text:h.text(),changes:h.changes.length,aborts:h.aborts.length};
   },name);if(errors.length)throw Error(errors.join(';'));results.push({...result,status:'PASS'});
  }finally{await context.close();}
 }return results;
}
