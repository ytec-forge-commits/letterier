use std::{collections::HashMap,io::{Read,Write},path::{Path,PathBuf},sync::{Mutex,atomic::{AtomicU64,Ordering}}};
use serde::Serialize;
use sha2::{Digest,Sha256};
use tauri_plugin_dialog::DialogExt;
const MAX_BYTES:usize=256*1024*1024;
static NEXT_TOKEN:AtomicU64=AtomicU64::new(1);
struct Grant {path:PathBuf,hash:Option<String>}
pub struct StorageState {root:PathBuf,grants:Mutex<HashMap<String,Grant>>,local_gate:Mutex<()>}
impl StorageState {pub fn new(root:PathBuf)->Self{Self{root,grants:Mutex::new(HashMap::new()),local_gate:Mutex::new(())}}}
fn hash(bytes:&[u8])->String{format!("{:x}",Sha256::digest(bytes))}
fn read_bytes(path:&Path)->Result<Vec<u8>,String>{
    let metadata=std::fs::symlink_metadata(path).map_err(|_|"ファイルを読み取れません。場所とアクセス権を確認してください。")?;
    if(!metadata.is_file())||metadata.len()>MAX_BYTES as u64{return Err("ファイルが大きすぎるか、通常のファイルではありません。".into());}
    #[cfg(windows)] {use std::os::windows::fs::MetadataExt;if metadata.file_attributes()&0x400!=0{return Err("リンクされた保存先は使用できません。通常のファイルを選んでください。".into());}}
    let mut bytes=Vec::new();std::fs::File::open(path).map_err(|_|"ファイルを開けません。")?.take((MAX_BYTES+1) as u64).read_to_end(&mut bytes).map_err(|_|"ファイルの読み取りに失敗しました。")?;
    if bytes.len()>MAX_BYTES{return Err("ファイルが大きすぎます。".into());}Ok(bytes)
}
pub(crate) fn current_hash(path:&Path)->Result<Option<String>,String>{if path.try_exists().map_err(|_|"保存先を確認できません。")?{Ok(Some(hash(&read_bytes(path)?)))}else{Ok(None)}}
pub fn atomic_save(path:&Path,bytes:&[u8],expected:Option<&str>)->Result<String,String>{
    if bytes.len()>MAX_BYTES{return Err("保存するファイルが大きすぎます。".into());}
    let check=||->Result<(),String>{if current_hash(path)?.as_deref()!=expected{return Err("このファイルは別の操作で変更されています。上書きせず「名前を付けて保存」で別のファイルへ保存してください。".into());}Ok(())};
    check()?;
    let parent=path.parent().ok_or("保存先フォルダーが見つかりません。")?;
    let mut temp=tempfile::Builder::new().prefix(".binsen-save-").tempfile_in(parent).map_err(|_|"保存先に書き込めません。空き容量とアクセス権を確認してください。")?;
    temp.write_all(bytes).and_then(|_|temp.as_file().sync_all()).map_err(|_|"保存に失敗しました。元のファイルは変更していません。")?;
    check()?;
    temp.persist(path).map_err(|_|"ファイルを置き換えられません。他のアプリで開いていないか確認してください。")?;
    Ok(hash(bytes))
}
pub fn local_path(root:&Path,key:&str)->Result<PathBuf,String>{
    if key.is_empty()||key.len()>180||!key.bytes().all(|b|b.is_ascii_alphanumeric()||b==b'-'||b==b'_')||["CON","PRN","AUX","NUL","COM1","COM2","COM3","COM4","COM5","COM6","COM7","COM8","COM9","LPT1","LPT2","LPT3","LPT4","LPT5","LPT6","LPT7","LPT8","LPT9"].contains(&key.to_ascii_uppercase().as_str()) {return Err("保存項目の名前が正しくありません。".into());}
    Ok(root.join(format!("{key}.data")))
}
#[derive(Serialize)]
pub struct OpenedFile {token:String,name:String,bytes:Vec<u8>}
#[derive(Serialize)]
pub struct SavedFile {token:String,name:String}
#[tauri::command]
pub async fn open_document(app:tauri::AppHandle,state:tauri::State<'_,StorageState>)->Result<Option<OpenedFile>,String>{
    let selected=tauri::async_runtime::spawn_blocking(move||app.dialog().file().add_filter("便箋・履歴付きバックアップ",&["binsen","binsenbak"]).blocking_pick_file()).await.map_err(|_|"ファイル選択に失敗しました。")?;
    let Some(selected)=selected else{return Ok(None)};
    let path=selected.into_path().map_err(|_|"この保存場所は利用できません。")?;
    open_path(path,&state).map(Some)
}
pub(crate) fn open_path(path:PathBuf,state:&StorageState)->Result<OpenedFile,String>{
    let bytes=read_bytes(&path)?;
    let token=NEXT_TOKEN.fetch_add(1,Ordering::Relaxed).to_string();
    let name=path.file_name().unwrap_or_default().to_string_lossy().to_string();
    if path.extension().is_some_and(|e|e.eq_ignore_ascii_case("binsen")){
        state.grants.lock().map_err(|_|"保存状態を確認できません。")?.insert(token.clone(),Grant{path,hash:Some(hash(&bytes))});
    }
    Ok(OpenedFile{token,name,bytes})
}
#[tauri::command]
pub async fn save_document(app:tauri::AppHandle,state:tauri::State<'_,StorageState>,bytes:Vec<u8>,name:String,token:Option<String>,backup:bool)->Result<Option<SavedFile>,String>{
    if bytes.len()>MAX_BYTES{return Err("保存するファイルが大きすぎます。".into());}
    let token=if let Some(token)=token{token}else{
        let ext=if backup{"binsenbak"}else{"binsen"};
        let clean:String=name.chars().filter(|c|!"\\/:*?\"<>|".contains(*c)&&!c.is_control()).take(120).collect();
        let filename=format!("{}.{ext}",if clean.is_empty(){"手紙"}else{&clean});
        let selected=tauri::async_runtime::spawn_blocking(move||app.dialog().file().add_filter("レタリエ",&[ext]).set_file_name(filename).blocking_save_file()).await.map_err(|_|"保存先の選択に失敗しました。")?;
        let Some(selected)=selected else{return Ok(None)};
        let path=selected.into_path().map_err(|_|"この保存場所は利用できません。")?;
        if !path.extension().is_some_and(|e|e.eq_ignore_ascii_case(ext)){return Err(format!("拡張子 .{ext} を付けて保存してください。"));}
        let token=NEXT_TOKEN.fetch_add(1,Ordering::Relaxed).to_string();
        let digest=current_hash(&path)?;
        state.grants.lock().map_err(|_|"保存状態を確認できません。")?.insert(token.clone(),Grant{path,hash:digest});token
    };
    let mut grants=state.grants.lock().map_err(|_|"保存状態を確認できません。")?;
    let grant=grants.get_mut(&token).ok_or("ファイルを開き直すか、名前を付けて保存してください。")?;
    if backup!=grant.path.extension().is_some_and(|e|e.eq_ignore_ascii_case("binsenbak")){return Err("保存形式とファイルの種類が一致しません。".into());}
    grant.hash=Some(atomic_save(&grant.path,&bytes,grant.hash.as_deref())?);
    Ok(Some(SavedFile{token,name:grant.path.file_name().unwrap_or_default().to_string_lossy().to_string()}))
}
#[tauri::command]
pub fn local_read(state:tauri::State<'_,StorageState>,key:String)->Result<Option<Vec<u8>>,String>{
    let path=local_path(&state.root,&key)?;if !path.exists(){return Ok(None)};read_bytes(&path).map(Some)
}
#[tauri::command]
pub fn local_write(state:tauri::State<'_,StorageState>,key:String,bytes:Vec<u8>)->Result<(),String>{
    let _guard=state.local_gate.lock().map_err(|_|"保存処理を開始できません。")?;
    std::fs::create_dir_all(&state.root).map_err(|_|"このパソコンの保存領域を利用できません。")?;
    let path=local_path(&state.root,&key)?;let expected=current_hash(&path)?;
    atomic_save(&path,&bytes,expected.as_deref()).map(|_|())
}
#[tauri::command]
pub fn local_remove(state:tauri::State<'_,StorageState>,key:String)->Result<(),String>{
    // Removal is limited to snapshot/template blobs; indexes and recovery documents are preserved.
    if !key.starts_with("revision-")&&!key.starts_with("user-template-"){return Err("この保存項目は削除できません。".into());}
    let _guard=state.local_gate.lock().map_err(|_|"保存処理を開始できません。")?;
    let path=local_path(&state.root,&key)?;
    if path.exists(){std::fs::remove_file(path).map_err(|_|"古い履歴の整理に失敗しました。")?;}Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn save_replaces_only_the_version_we_opened() {
        let dir=tempfile::tempdir().unwrap(); let path=dir.path().join("synthetic.binsen");
        let first=atomic_save(&path,b"first",None).unwrap();
        let second=atomic_save(&path,b"second",Some(&first)).unwrap();
        assert_ne!(first,second);assert_eq!(std::fs::read(&path).unwrap(),b"second");
        assert!(atomic_save(&path,b"lost",Some(&first)).is_err());
        assert_eq!(std::fs::read(&path).unwrap(),b"second");
    }
    #[test]
    fn unapproved_existing_target_is_preserved() {
        let dir=tempfile::tempdir().unwrap();let path=dir.path().join("exists.binsen");std::fs::write(&path,b"original").unwrap();
        assert!(atomic_save(&path,b"replacement",None).is_err());assert_eq!(std::fs::read(path).unwrap(),b"original");
    }
    #[test]
    fn local_storage_cannot_escape_its_root() {
        let dir=tempfile::tempdir().unwrap();assert!(local_path(dir.path(),"draft-123").unwrap().starts_with(dir.path()));
        for key in ["../outside","C:\\secret","a/b","a\\b","CON","", "."] { assert!(local_path(dir.path(),key).is_err()); }
    }
}
