use std::collections::BTreeSet;
use windows::Win32::{Foundation::LPARAM,Graphics::Gdi::*};
unsafe extern "system" fn collect(font:*const LOGFONTW,_metric:*const TEXTMETRICW,_kind:u32,param:LPARAM)->i32 {
    if font.is_null(){return 1;}
    let names=&mut *(param.0 as *mut BTreeSet<String>);
    let face=(*font).lfFaceName;
    let name=String::from_utf16_lossy(&face[..face.iter().position(|&c|c==0).unwrap_or(face.len())]);
    if !name.is_empty()&&!name.starts_with('@'){names.insert(name);}
    1
}
#[tauri::command]
pub async fn installed_fonts()->Result<Vec<String>,String>{
    tauri::async_runtime::spawn_blocking(||unsafe{
        let dc=GetDC(None);if dc.is_invalid(){return Err("Windowsのフォント一覧を取得できません。".into());}
        let mut names=BTreeSet::<String>::new();
        let mut query=LOGFONTW::default();query.lfCharSet=DEFAULT_CHARSET;
        EnumFontFamiliesExW(dc,&query,Some(collect),LPARAM(&mut names as *mut _ as isize),0);
        ReleaseDC(None,dc);
        if names.is_empty(){Err("利用可能なフォントが見つかりません。".into())}else{Ok(names.into_iter().collect())}
    }).await.map_err(|_|"フォント一覧の取得に失敗しました。".to_string())?
}
