use std::{path::PathBuf, sync::{atomic::{AtomicBool, Ordering}, Arc}, time::Duration};
use tauri::WebviewWindow;
use tauri_plugin_dialog::DialogExt;
use webview2_com::{PrintToPdfCompletedHandler, PrintCompletedHandler, Microsoft::Web::WebView2::Win32::*};
use windows::core::{HSTRING, Interface};

#[derive(Default)]
pub struct OutputState(pub Arc<AtomicBool>);

pub fn page_inches(width: f64, height: f64) -> Result<(f64, f64), String> {
    if !width.is_finite() || !height.is_finite() || !(50.0..=500.0).contains(&width) || !(50.0..=500.0).contains(&height) {
        return Err("用紙サイズを確認してください。".into());
    }
    Ok((width / 25.4, height / 25.4))
}

pub async fn write_pdf(window: WebviewWindow, target: PathBuf, width: f64, height: f64, busy: Arc<AtomicBool>) -> Result<String, String> {
    let (width, height) = page_inches(width, height)?;
    if busy.swap(true, Ordering::SeqCst) { return Err("前の出力が終わるまでお待ちください。".into()); }
    let result = write_pdf_inner(window, target, width, height).await;
    if !result.as_ref().err().is_some_and(|e|e.contains("再起動")){busy.store(false, Ordering::SeqCst);}
    result
}

async fn write_pdf_inner(window: WebviewWindow, target: PathBuf, width: f64, height: f64) -> Result<String, String> {
    let expected=crate::storage::current_hash(&target)?;
    let parent = target.parent().ok_or("保存先を確認してください。")?;
    let temp = tempfile::Builder::new().prefix(".binsen-pdf-").tempdir_in(parent).map_err(|_| "保存先に書き込めません。")?;
    let temporary = temp.path().join("document.pdf");
    let print_path = temporary.clone();
    let (tx, rx) = std::sync::mpsc::channel();
    window.with_webview(move |view| {
        let tx_immediate = tx.clone();
        let result = (|| -> windows::core::Result<()> {
            unsafe {
                let env: ICoreWebView2Environment6 = view.environment().cast()?;
                let settings = env.CreatePrintSettings()?;
                settings.SetPageWidth(width)?;
                settings.SetPageHeight(height)?;
                settings.SetMarginTop(0.0)?;
                settings.SetMarginBottom(0.0)?;
                settings.SetMarginLeft(0.0)?;
                settings.SetMarginRight(0.0)?;
                settings.SetShouldPrintBackgrounds(true)?;
                settings.SetShouldPrintHeaderAndFooter(false)?;
                let core: ICoreWebView2_7 = view.controller().CoreWebView2()?.cast()?;
                let completed = PrintToPdfCompletedHandler::create(Box::new(move |result, success| {
                    let message = if result.is_ok() && success { Ok(()) } else { Err("PDFの作成に失敗しました。元のファイルは変更していません。".to_string()) };
                    let _ = tx.send(message);
                    Ok(())
                }));
                core.PrintToPdf(&HSTRING::from(print_path.as_os_str()), &settings, &completed)?;
            }
            Ok(())
        })();
        if result.is_err() { let _ = tx_immediate.send(Err("この環境ではPDF出力を開始できません。WebView2を確認してください。".into())); }
    }).map_err(|_| "出力ウィンドウに接続できません。")?;
    let done = tauri::async_runtime::spawn_blocking(move || rx.recv_timeout(Duration::from_secs(120))).await.map_err(|_| "PDF出力の待機に失敗しました。")?;
    match done {
        Ok(result) => result?,
        Err(_) => { let _retained = temp.keep(); return Err("PDF出力の完了を確認できませんでした。再出力の前にアプリを再起動してください。".into()); }
    }
    let data = std::fs::read(&temporary).map_err(|_| "作成したPDFを読み取れません。")?;
    if !data.starts_with(b"%PDF-") { return Err("PDFの内容を確認できません。".into()); }
    crate::storage::atomic_save(&target,&data,expected.as_deref())?;
    Ok(target.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn export_pdf(window: WebviewWindow, app: tauri::AppHandle, state: tauri::State<'_, OutputState>, width: f64, height: f64) -> Result<Option<String>, String> {
    let selected = tauri::async_runtime::spawn_blocking(move || app.dialog().file().add_filter("PDF", &["pdf"]).set_file_name("手紙.pdf").blocking_save_file()).await.map_err(|_| "保存先の選択に失敗しました。")?;
    let Some(selected) = selected else { return Ok(None); };
    let path = selected.into_path().map_err(|_| "保存先を確認してください。")?;
    if !path.extension().is_some_and(|e|e.eq_ignore_ascii_case("pdf")){return Err("拡張子 .pdf を付けて保存してください。".into());}
    write_pdf(window, path, width, height, state.0.clone()).await.map(Some)
}

#[tauri::command]
pub async fn print_document(window:WebviewWindow,state:tauri::State<'_,OutputState>,printer:String,paper:String,landscape:bool,copies:i32,expected:crate::printers::PrinterArea)->Result<(),String>{
    if !(1..=99).contains(&copies){return Err("部数は1〜99で指定してください。".into());}
    if state.0.swap(true,Ordering::SeqCst){return Err("前の出力が終わるまでお待ちください。".into());}
    let result=print_inner(window,printer,paper,landscape,copies,expected).await;
    if !result.as_ref().err().is_some_and(|e|e.contains("再起動")){state.0.store(false,Ordering::SeqCst);}result
}
async fn print_inner(window:WebviewWindow,printer:String,paper:String,landscape:bool,copies:i32,expected:crate::printers::PrinterArea)->Result<(),String>{
    let inspect_name=printer.clone();let inspect_paper=paper.clone();
    let area=tauri::async_runtime::spawn_blocking(move||crate::printers::inspect(&inspect_name,&inspect_paper,landscape)).await.map_err(|_|"印刷範囲の再確認に失敗しました。")??;
    if area.printer!=expected.printer||[(area.left,expected.left),(area.top,expected.top),(area.printable_width,expected.printable_width),(area.printable_height,expected.printable_height),(area.width,expected.width),(area.height,expected.height)].iter().any(|(a,b)|!b.is_finite()||(a-b).abs()>0.2){return Err("プリンターの設定が変わりました。印刷範囲を確認し直してください。".into());}
    let (_,w,h)=crate::printers::paper_dimensions(&paper,false)?;
    let (tx,rx)=std::sync::mpsc::channel();
    window.with_webview(move|view|{
        let immediate=tx.clone();let result=(||->windows::core::Result<()>{unsafe{
            let env:ICoreWebView2Environment6=view.environment().cast()?;let settings=env.CreatePrintSettings()?;
            settings.SetPageWidth(w/25.4)?;settings.SetPageHeight(h/25.4)?;
            settings.SetOrientation(if landscape{COREWEBVIEW2_PRINT_ORIENTATION_LANDSCAPE}else{COREWEBVIEW2_PRINT_ORIENTATION_PORTRAIT})?;
            settings.SetScaleFactor(1.0)?;settings.SetMarginTop(0.)?;settings.SetMarginBottom(0.)?;settings.SetMarginLeft(0.)?;settings.SetMarginRight(0.)?;settings.SetShouldPrintBackgrounds(true)?;settings.SetShouldPrintHeaderAndFooter(false)?;
            let extra:ICoreWebView2PrintSettings2=settings.cast()?;extra.SetPrinterName(&HSTRING::from(printer))?;extra.SetCopies(copies)?;extra.SetPagesPerSide(1)?;extra.SetMediaSize(COREWEBVIEW2_PRINT_MEDIA_SIZE_CUSTOM)?;
            let core:ICoreWebView2_16=view.controller().CoreWebView2()?.cast()?;
            let callback=PrintCompletedHandler::create(Box::new(move|result,status|{let done=if result.is_ok()&&status==COREWEBVIEW2_PRINT_STATUS_SUCCEEDED{Ok(())}else{Err("プリンターへの送信が完了しませんでした。接続・用紙・プリンター側の表示を確認してください。".to_string())};let _=tx.send(done);Ok(())}));core.Print(&settings,&callback)?;
        }Ok(())})();if result.is_err(){let _=immediate.send(Err("印刷を開始できません。このプリンターで用紙設定が利用できるか確認してください。".into()));}
    }).map_err(|_|"印刷ウィンドウに接続できません。")?;
    tauri::async_runtime::spawn_blocking(move||rx.recv_timeout(Duration::from_secs(120))).await.map_err(|_|"印刷の完了待機に失敗しました。")?.map_err(|_|"印刷の完了を確認できません。プリンターのジョブを確認してからアプリを再起動してください。")?
}

#[tauri::command]
pub async fn qa_export_pdf(window: WebviewWindow, state: tauri::State<'_, OutputState>,width:Option<f64>,height:Option<f64>,name:Option<String>) -> Result<String, String> {
    if !cfg!(debug_assertions) { return Err("診断は開発版だけで利用できます。".into()); }
    let folder = std::env::var_os("BINSEN_QA_OUTPUT").ok_or("診断出力先が指定されていません。")?;
    let name=name.unwrap_or("native-probe".into());if name.is_empty()||name.len()>80||!name.bytes().all(|b|b.is_ascii_alphanumeric()||b==b'-'){return Err("診断ファイル名を確認してください。".into());}
    write_pdf(window, PathBuf::from(folder).join(format!("{name}.pdf")), width.unwrap_or(210.0), height.unwrap_or(297.0), state.0.clone()).await
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn paper_dimensions_are_not_scaled_or_swapped() {
        for (w, h) in [(210.0, 297.0), (182.0, 257.0), (100.0, 148.0), (297.0, 210.0)] {
            let (x, y) = page_inches(w, h).unwrap();
            assert!((x * 25.4 - w).abs() < 0.00001);
            assert!((y * 25.4 - h).abs() < 0.00001);
        }
    }
    #[test]
    fn reject_invalid_paper() {
        assert!(page_inches(f64::NAN, 297.0).is_err());
        assert!(page_inches(-1.0, 297.0).is_err());
        assert!(page_inches(210.0, 9999.0).is_err());
    }
}
