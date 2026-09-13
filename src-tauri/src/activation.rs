use std::{collections::VecDeque,path::{Path,PathBuf},sync::Mutex};
use tauri::{Manager,Emitter};
#[derive(Default)]
pub struct Requests(Mutex<VecDeque<PathBuf>>);
fn selected_path(argument:&str,cwd:&Path)->Option<PathBuf>{
 if argument.starts_with('-')||argument.starts_with("\\\\")||argument.starts_with("//")||argument.contains("://")||argument.len()>32760{return None;}
 let path=PathBuf::from(argument);
 if !path.extension().is_some_and(|e|e.eq_ignore_ascii_case("binsen")||e.eq_ignore_ascii_case("binsenbak")){return None;}
 Some(if path.is_absolute(){path}else{cwd.join(path)})
}
pub fn enqueue(app:&tauri::AppHandle,args:impl Iterator<Item=String>,cwd:&Path){
 let state=app.state::<Requests>();if let Ok(mut queue)=state.0.lock(){for arg in args.take(20){if let Some(path)=selected_path(&arg,cwd){if queue.len()<20&&!queue.contains(&path){queue.push_back(path);}}}}
 let _=app.emit("open-requested",());
}
#[tauri::command]
pub fn take_launch_document(app:tauri::AppHandle,state:tauri::State<'_,Requests>)->Result<Option<crate::storage::OpenedFile>,String>{
 let path=state.0.lock().map_err(|_|"起動時のファイルを確認できません。")?.pop_front();
 path.map(|path|crate::storage::open_path(path,&app.state::<crate::storage::StorageState>())).transpose()
}
#[cfg(test)]
mod tests{
 use super::*;
 #[test]fn launch_only_accepts_local_document_paths(){let root=Path::new("C:\\letters");assert_eq!(selected_path("手紙.binsen",root),Some(root.join("手紙.binsen")));for s in ["https://example.com/a.binsen","\\\\server\\share\\a.binsen","//server/a.binsen","-bad.binsen","picture.png"]{assert!(selected_path(s,root).is_none(),"{s}");}}
}
