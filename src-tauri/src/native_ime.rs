use std::{cell::RefCell, sync::mpsc, time::Duration};
use serde::{Deserialize, Serialize};
use tauri::{Emitter, Manager, WebviewWindow};
use webview2_com::Microsoft::Web::WebView2::Win32::COREWEBVIEW2_MOVE_FOCUS_REASON_PROGRAMMATIC;

#[repr(C)]
#[derive(Clone, Copy, Debug, Deserialize)]
pub struct Rect { x:f64,y:f64,width:f64,height:f64 }
impl Rect {
    fn validate(&self)->Result<(),String>{
        if [self.x,self.y,self.width,self.height].iter().any(|v|!v.is_finite()||v.abs()>10_000_000.)||self.width<0.||self.height<0.{return Err("入力位置の座標を確認してください。".into());}Ok(())
    }
}
#[derive(Deserialize)]
#[serde(tag="op",rename_all="camelCase")]
pub enum Request {
    Status,
    Start {session:u64,text:String,start:u32,end:u32},
    Sync {session:u64,text:String,start:u32,end:u32},
    Select {session:u64,start:u32,end:u32},
    Bounds {session:u64,control:Rect,selection:Rect,scale:f64},
    Characters {session:u64,revision:u32,start:u32,rects:Vec<Rect>},
    Focus {session:u64},
    Stop {session:u64},
}
#[repr(C)]
struct RawEvent {kind:u32,session:u64,sequence:u64,start:i32,end:i32,selection_start:i32,selection_end:i32,text:*const u16,length:u32,key:u32,modifiers:u32}
#[derive(Clone, Serialize)]
#[serde(rename_all="camelCase")]
struct Event {kind:u32,session:u64,sequence:u64,start:i32,end:i32,selection_start:i32,selection_end:i32,text:Vec<u16>,key:u32,modifiers:u32}
#[derive(Serialize)]
pub struct Reply {available:bool}
unsafe extern "C" {
    fn letterier_ime_start(parent:isize,session:u64,text:*const u16,length:u32,start:i32,end:i32,callback:extern "C" fn(*mut std::ffi::c_void,*const RawEvent),user:*mut std::ffi::c_void)->i32;
    fn letterier_ime_sync(session:u64,text:*const u16,length:u32,start:i32,end:i32)->i32;
    fn letterier_ime_selection(session:u64,start:i32,end:i32);
    fn letterier_ime_bounds(session:u64,control:Rect,selection:Rect,scale:f64);
    fn letterier_ime_characters(session:u64,revision:u32,start:i32,rects:*const Rect,length:u32);
    fn letterier_ime_focus(session:u64);
    fn letterier_ime_stop(session:u64)->i32;
}
thread_local! {static CALLBACK_APP:RefCell<Option<Box<tauri::AppHandle>>>=const {RefCell::new(None)};}
extern "C" fn native_event(user:*mut std::ffi::c_void,event:*const RawEvent){
    // Copy the temporary UTF-16 buffer before returning to the COM callback.
    let _=std::panic::catch_unwind(||unsafe {
        if user.is_null()||event.is_null(){return;}
        let event=&*event;if event.length>2_000_000||event.length>0&&event.text.is_null(){return;}
        let app=&*(user as *const tauri::AppHandle);
        let text=if event.length==0{Vec::new()}else{std::slice::from_raw_parts(event.text,event.length as usize).to_vec()};
        let payload=Event{kind:event.kind,session:event.session,sequence:event.sequence,start:event.start,end:event.end,selection_start:event.selection_start,selection_end:event.selection_end,text,key:event.key,modifiers:event.modifiers};
        let _=app.emit_to("main","native-ime",payload);
    });
}
fn validate_text(session:u64,text:&str,start:u32,end:u32)->Result<Vec<u16>,String>{
    if session==0{return Err("入力接続を確認してください。".into());}
    let units:Vec<_>=text.encode_utf16().collect();
    if units.len()>2_000_000||start>end||end as usize>units.len(){return Err("入力範囲を確認してください。".into());}
    for offset in [start as usize,end as usize]{
        if offset>0&&offset<units.len()&&(0xD800..=0xDBFF).contains(&units[offset-1])&&(0xDC00..=0xDFFF).contains(&units[offset]){return Err("文字の途中には入力位置を置けません。".into());}
    }
    Ok(units)
}
impl Request {
    fn validate(&self)->Result<(),String>{
        match self {
            Self::Status=>Ok(()),
            Self::Start{session,text,start,end}|Self::Sync{session,text,start,end}=>validate_text(*session,text,*start,*end).map(|_|()),
            Self::Bounds{session,control,selection,scale}=>{if *session==0||!scale.is_finite()||!(0.5..=8.).contains(scale){return Err("入力位置の倍率を確認してください。".into());}control.validate()?;selection.validate()},
            Self::Characters{session,start,rects,..}=>{if *session==0||rects.len()>512||*start as usize+rects.len()>2_000_000{return Err("入力文字の範囲を確認してください。".into());}for rect in rects{rect.validate()?;}Ok(())},
            Self::Focus{session}|Self::Stop{session}=>if *session==0{Err("入力接続を確認してください。".into())}else{Ok(())},
            Self::Select{session,start,end}=>if *session==0||start>end||*end>2_000_000{Err("入力範囲を確認してください。".into())}else{Ok(())},
        }
    }
}

#[tauri::command]
pub async fn native_ime(window:WebviewWindow,request:Request)->Result<Reply,String>{
    if window.label()!="main"{return Err("編集ウィンドウに接続できません。".into());}
    request.validate()?;
    if matches!(request,Request::Status){return Ok(Reply{available:true});}
    let parent=window.hwnd().map_err(|_|"入力ウィンドウを確認できません。")?.0 as isize;
    let app=window.app_handle().clone();
    let(tx,rx)=mpsc::channel();
    window.with_webview(move |view|{
        let result=(||->Result<Reply,String>{unsafe{
            match request {
                Request::Status=>{},
                Request::Start{session,text,start,end}=>{
                    let units=validate_text(session,&text,start,end)?;
                    let user=CALLBACK_APP.with(|cell|{let mut app_slot=cell.borrow_mut();let saved=app_slot.get_or_insert_with(||Box::new(app.clone()));&mut **saved as *mut tauri::AppHandle as *mut std::ffi::c_void});
                    let status=letterier_ime_start(parent,session,units.as_ptr(),units.len() as u32,start as i32,end as i32,native_event,user);
                    if status<0{return Err(format!("Windowsの縦書き入力に接続できませんでした。(0x{:08X})",status as u32));}
                },
                Request::Sync{session,text,start,end}=>{
                    let units=validate_text(session,&text,start,end)?;
                    let status=letterier_ime_sync(session,units.as_ptr(),units.len() as u32,start as i32,end as i32);
                    if status<0{return Err("Windowsの入力状態を同期できませんでした。".into());}
                },
                Request::Bounds{session,control,selection,scale}=>letterier_ime_bounds(session,control,selection,scale),
                Request::Characters{session,revision,start,rects}=>letterier_ime_characters(session,revision,start as i32,rects.as_ptr(),rects.len() as u32),
                Request::Select{session,start,end}=>letterier_ime_selection(session,start as i32,end as i32),
                Request::Focus{session}=>letterier_ime_focus(session),
                Request::Stop{session}=>{if letterier_ime_stop(session)!=0{let _=view.controller().MoveFocus(COREWEBVIEW2_MOVE_FOCUS_REASON_PROGRAMMATIC);}},
            }
            Ok(Reply{available:true})
        }})();let _=tx.send(result);
    }).map_err(|_|"Windowsの入力処理を開始できませんでした。")?;
    tauri::async_runtime::spawn_blocking(move||rx.recv_timeout(Duration::from_secs(5))).await.map_err(|_|"入力処理の待機に失敗しました。")?.map_err(|_|"入力処理の応答を確認できませんでした。")?
}

// Tauri delivers Exit on the owning event-loop thread, after close confirmation.
pub fn shutdown(){unsafe{letterier_ime_stop(0);}}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]fn preserves_utf16_selection_around_emoji(){assert_eq!(validate_text(1,"前😀後",1,3).unwrap(),[0x524D,0xD83D,0xDE00,0x5F8C]);assert!(validate_text(1,"前😀後",2,3).is_err());}
    #[test]fn rejects_stale_or_invalid_input_ranges(){assert!(validate_text(0,"本文",0,0).is_err());assert!(validate_text(1,"本文",2,1).is_err());assert!(validate_text(1,"本文",0,3).is_err());}
    #[test]fn rejects_nonfinite_native_coordinates(){let rect=Rect{x:f64::NAN,y:0.,width:1.,height:1.};assert!(rect.validate().is_err());let rect=Rect{x:-20.,y:0.,width:0.,height:30.};assert!(rect.validate().is_ok());assert!(Request::Bounds{session:1,control:rect,selection:rect,scale:f64::INFINITY}.validate().is_err());}
}
