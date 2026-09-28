#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod output;
mod storage;
mod fonts;
mod printers;
mod images;
mod activation;
mod window_state;
use tauri::Manager;
#[tauri::command]
async fn close_app(app:tauri::AppHandle)->Result<(),String>{window_state::save(&app);app.exit(0);Ok(())}
fn main() {
    tauri::Builder::default()
        .manage(activation::Requests::default())
        .plugin(tauri_plugin_single_instance::init(|app,args,cwd|{
            activation::enqueue(app,args.into_iter().skip(1),std::path::Path::new(&cwd));
            if let Some(window)=app.get_webview_window("main"){let _=window.unminimize();let _=window.show();let _=window.set_focus();}
        }))
        .plugin(tauri_plugin_dialog::init())
        .manage(output::OutputState::default())
        .setup(|app|{
            let root=if cfg!(debug_assertions){std::env::var_os("BINSEN_QA_DATA").map(std::path::PathBuf::from).unwrap_or(app.path().app_data_dir()?.join("store"))}else{app.path().app_data_dir()?.join("store")};
            app.manage(storage::StorageState::new(root));
            activation::enqueue(app.handle(),std::env::args().skip(1),&std::env::current_dir()?);
            window_state::restore(app.handle());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![close_app,activation::take_launch_document,images::decode_heif,fonts::installed_fonts,printers::list_printers,printers::printer_area,output::export_pdf, output::print_document, output::qa_export_pdf, storage::open_document,storage::save_document,storage::local_read,storage::local_write,storage::local_remove])
        .build(tauri::generate_context!())
        .expect("レタリエを起動できませんでした。")
        .run(|app,event|{
            if matches!(event,tauri::RunEvent::ExitRequested { .. }) { window_state::save(app); }
        })
        ;
}
