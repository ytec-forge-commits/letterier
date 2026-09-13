import {checkPixels} from './image-info';
export function inspectPsd(b:Uint8Array){
 if(b.length<26||String.fromCharCode(...b.subarray(0,4))!=='8BPS')throw Error('PSDの内容を確認できません。');
 const v=new DataView(b.buffer,b.byteOffset,b.byteLength);
 if(v.getUint16(4)!==1)throw Error('大容量PSBには対応していません。統合したPNGに書き出してください。');
 if(v.getUint16(22)!==8)throw Error('PSDは8bitの画像に対応しています。8bit RGBまたはPNGに書き出してください。');
 if(v.getUint16(24)!==3)throw Error('PSDはRGBに対応しています。CMYK・Lab等はRGBまたはPNGに変換してください。');
 const width=v.getUint32(18),height=v.getUint32(14);checkPixels(width,height);
 if(width*height>16_000_000)throw Error('PSDは1600万画素までです。統合した画像を小さくしてください。');
 return {width,height};
}
export function designFormat(b:Uint8Array,name:string):'psd'|'ai'|'pdf'|'heic'|'heif'|null{
 const text=new TextDecoder().decode(b.subarray(0,32)),ext=name.toLowerCase().split('.').at(-1);
 if(text.startsWith('8BPS'))return 'psd';
 if(text.startsWith('%PDF-'))return ext==='ai'?'ai':'pdf';
 if(ext==='ai')throw Error('このAIはPDF互換ではありません。Illustratorで「PDF互換ファイルを作成」を有効にして保存するか、PNG・SVGに書き出してください。');
 if(text.slice(4,8)==='ftyp'&&/heic|heix|hevc|hevx|mif1|msf1/.test(text.slice(8)))return ext==='heif'?'heif':'heic';
 if(ext==='heic'||ext==='heif')throw Error('HEIC/HEIFの内容を確認できません。破損や未対応の形式が考えられます。');
 if(ext==='psd')throw Error('このファイルは対応するPSDではありません。');
 return null;
}
