use serde::{Serialize,Deserialize};
use windows::{core::{PCWSTR,PWSTR,HSTRING},Win32::{Graphics::{Gdi::*,Printing::*},Storage::Xps::{DeviceCapabilitiesW,DC_PAPERS}}};
#[derive(Serialize)]
pub struct Printers {names:Vec<String>,default:Option<String>}
#[derive(Serialize,Deserialize,Clone)]
#[serde(rename_all="camelCase")]
pub struct PrinterArea {pub printer:String,pub width:f64,pub height:f64,pub left:f64,pub top:f64,pub printable_width:f64,pub printable_height:f64}
struct Printer(PRINTER_HANDLE);
impl Drop for Printer {fn drop(&mut self){unsafe{let _=ClosePrinter(self.0);}}}
struct Dc(HDC);
impl Drop for Dc {fn drop(&mut self){unsafe{let _=DeleteDC(self.0);}}}
pub fn paper_dimensions(paper:&str,landscape:bool)->Result<(u32,f64,f64),String>{
 let (id,w,h)=match paper {"A4"=>(DMPAPER_A4,210.,297.),"B5"=>(DMPAPER_B5,182.,257.),"POSTCARD"=>(DMPAPER_JAPANESE_POSTCARD,100.,148.),_=>return Err("用紙の種類を確認してください。".into())};Ok(if landscape{(id,h,w)}else{(id,w,h)})
}
#[tauri::command]
pub async fn list_printers()->Result<Printers,String>{tauri::async_runtime::spawn_blocking(||unsafe{
 let mut needed=0;let mut count=0;let flags=PRINTER_ENUM_LOCAL|PRINTER_ENUM_CONNECTIONS;
 let _=EnumPrintersW(flags,PCWSTR::null(),4,None,&mut needed,&mut count);
 if needed>4*1024*1024{return Err("プリンター一覧が大きすぎます。".into());}
 let mut names=Vec::new();
 if needed>0{let mut aligned=vec![0usize;(needed as usize+7)/8];let bytes=std::slice::from_raw_parts_mut(aligned.as_mut_ptr() as *mut u8,needed as usize);
 EnumPrintersW(flags,PCWSTR::null(),4,Some(bytes),&mut needed,&mut count).map_err(|_|"プリンター一覧を取得できません。")?;
 if count as usize*std::mem::size_of::<PRINTER_INFO_4W>()>bytes.len(){return Err("プリンター一覧の形式を確認できません。".into());}
 for info in std::slice::from_raw_parts(bytes.as_ptr() as *const PRINTER_INFO_4W,count as usize){let name=info.pPrinterName.to_string().map_err(|_|"プリンター名を読み取れません。")?;if !name.is_empty(){names.push(name);}}
 }names.sort();names.dedup();let mut length=0;let _=GetDefaultPrinterW(None,&mut length);let default=if length>0&&length<32768{let mut buffer=vec![0u16;length as usize];if GetDefaultPrinterW(Some(PWSTR(buffer.as_mut_ptr())),&mut length).as_bool(){Some(String::from_utf16_lossy(&buffer[..buffer.iter().position(|&v|v==0).unwrap_or(buffer.len())]))}else{None}}else{None};Ok(Printers{names,default})
}).await.map_err(|_|"プリンター一覧の取得に失敗しました。".to_string())?}
pub fn inspect(printer:&str,paper:&str,landscape:bool)->Result<PrinterArea,String>{unsafe{
 if printer.is_empty()||printer.len()>32767||printer.contains('\0'){return Err("プリンター名を確認してください。".into());}
 let (id,width,height)=paper_dimensions(paper,landscape)?;let name=HSTRING::from(printer);let mut handle=PRINTER_HANDLE::default();OpenPrinterW(&name,&mut handle,None).map_err(|_|"このプリンターを開けません。接続を確認してください。")?;let handle=Printer(handle);
 let count=DeviceCapabilitiesW(&name,PCWSTR::null(),DC_PAPERS,None,None);if count<=0||count>10000{return Err("このプリンターの用紙一覧を確認できません。".into());}
 let mut papers=vec![0u16;count as usize];if DeviceCapabilitiesW(&name,PCWSTR::null(),DC_PAPERS,Some(PWSTR(papers.as_mut_ptr())),None)!=count||!papers.contains(&(id as u16)){return Err("このプリンターは選択した用紙に対応していません。別のプリンターまたは用紙を選んでください。".into());}
 let size=DocumentPropertiesW(None,handle.0,&name,None,None,0);if size<std::mem::size_of::<DEVMODEW>() as i32||size>1024*1024{return Err("プリンター設定の大きさを確認できません。".into());}
 let mut aligned=vec![0u64;(size as usize+7)/8];let mode=aligned.as_mut_ptr() as *mut DEVMODEW;
 if DocumentPropertiesW(None,handle.0,&name,Some(mode),None,DM_OUT_BUFFER.0)!=1{return Err("プリンター設定を読み込めません。".into());}
 if (*mode).dmSize as usize>size as usize||((*mode).dmSize as usize)<std::mem::size_of::<DEVMODEW>(){return Err("プリンター設定の形式を確認できません。".into());}
 (*mode).dmFields=((*mode).dmFields & !(DM_PAPERWIDTH|DM_PAPERLENGTH))|DM_PAPERSIZE|DM_ORIENTATION;
 (*mode).Anonymous1.Anonymous1.dmPaperSize=id as i16;(*mode).Anonymous1.Anonymous1.dmOrientation=if landscape{DMORIENT_LANDSCAPE}else{DMORIENT_PORTRAIT} as i16;
 if DocumentPropertiesW(None,handle.0,&name,Some(mode),Some(mode),DM_IN_BUFFER.0|DM_OUT_BUFFER.0)!=1{return Err("用紙設定をプリンターへ反映できません。".into());}
 let dc=Dc(CreateDCW(PCWSTR::null(),&name,PCWSTR::null(),Some(mode)));if dc.0.is_invalid(){return Err("プリンターの印刷範囲を確認できません。".into());}
 let dpi_x=GetDeviceCaps(Some(dc.0),LOGPIXELSX) as f64;let dpi_y=GetDeviceCaps(Some(dc.0),LOGPIXELSY) as f64;
 if dpi_x<=0.||dpi_y<=0.{return Err("プリンターの解像度を確認できません。".into());}
 let x=|index|GetDeviceCaps(Some(dc.0),index) as f64*25.4/dpi_x;let y=|index|GetDeviceCaps(Some(dc.0),index) as f64*25.4/dpi_y;
 let actual_w=x(PHYSICALWIDTH);let actual_h=y(PHYSICALHEIGHT);let left=x(PHYSICALOFFSETX);let top=y(PHYSICALOFFSETY);let pw=x(HORZRES);let ph=y(VERTRES);
 if (actual_w-width).abs()>0.8||(actual_h-height).abs()>0.8{return Err(format!("プリンターが返した用紙は{actual_w:.1}×{actual_h:.1}mmで、文書の{width:.0}×{height:.0}mmと一致しません。印刷を中止しました。"));}
 if left<0.||top<0.||pw<=0.||ph<=0.||left+pw>actual_w+0.8||top+ph>actual_h+0.8{return Err("プリンターの印刷可能範囲が正しくありません。".into());}
 Ok(PrinterArea{printer:printer.into(),width,height,left,top,printable_width:pw,printable_height:ph})
}}
#[tauri::command]
pub async fn printer_area(printer:String,paper:String,landscape:bool)->Result<PrinterArea,String>{tauri::async_runtime::spawn_blocking(move||inspect(&printer,&paper,landscape)).await.map_err(|_|"印刷範囲の確認に失敗しました。".to_string())?}
