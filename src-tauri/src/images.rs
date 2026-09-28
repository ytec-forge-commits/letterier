use windows::{Graphics::Imaging::*,Storage::Streams::*,Win32::System::WinRT::*};
#[derive(serde::Serialize)]
pub struct DecodedImage{png:Vec<u8>,width:u32,height:u32}
struct Apartment;
impl Drop for Apartment{fn drop(&mut self){unsafe{RoUninitialize()}}}
fn decode(bytes:Vec<u8>)->Result<DecodedImage,String>{
 if bytes.len()>16*1024*1024||bytes.len()<16||&bytes[4..8]!=b"ftyp"{return Err("対応するHEIC/HEIF（16MB以下）を選んでください。".into());}
 unsafe{RoInitialize(RO_INIT_MULTITHREADED)}.map_err(|_|"画像変換の初期化に失敗しました。")?;let _apartment=Apartment;
 let convert=||->windows::core::Result<(Vec<u8>,u32,u32)>{
  let stream=InMemoryRandomAccessStream::new()?;let writer=DataWriter::CreateDataWriter(&stream)?;writer.WriteBytes(&bytes)?;writer.StoreAsync()?.get()?;writer.DetachStream()?;stream.Seek(0)?;
  let decoder=BitmapDecoder::CreateAsync(&stream)?.get()?;
  let width=decoder.OrientedPixelWidth()?;let height=decoder.OrientedPixelHeight()?;
  if width==0||height==0||width>16384||height>16384||u64::from(width)*u64::from(height)>16_000_000{return Err(windows::core::Error::new(windows::core::HRESULT(0x80070057u32 as i32),"画像は1600万画素・一辺16384画素までです。"));}
  let pixels=decoder.GetPixelDataTransformedAsync(BitmapPixelFormat::Rgba8,BitmapAlphaMode::Straight,&BitmapTransform::new()?,ExifOrientationMode::RespectExifOrientation,ColorManagementMode::ColorManageToSRgb)?.get()?.DetachPixelData()?;
  Ok((pixels.to_vec(),width,height))
 };
 let (pixels,width,height)=convert().map_err(|e|format!("HEIC/HEIFを変換できません。WindowsのHEIF/HEVCコーデックが未対応、画像サイズ超過、またはファイルの破損が考えられます。JPEG・PNGへの書き出しをお試しください。（{}）",e.code()))?;
 if pixels.len()!=width as usize*height as usize*4{return Err("変換画像のサイズが一致しません。".into());}
 let mut png=Vec::new();{
  let mut encoder=png::Encoder::new(&mut png,width,height);encoder.set_color(png::ColorType::Rgba);encoder.set_depth(png::BitDepth::Eight);
  let mut writer=encoder.write_header().map_err(|_|"画像の保存準備に失敗しました。")?;writer.write_image_data(&pixels).map_err(|_|"画像を変換できません。")?;
 }
 if png.len()>16*1024*1024{return Err("変換後の画像が16MBを超えます。画像を小さくしてください。".into());}
 Ok(DecodedImage{png,width,height})
}
#[tauri::command]
pub async fn decode_heif(bytes:Vec<u8>)->Result<DecodedImage,String>{tauri::async_runtime::spawn_blocking(move||decode(bytes)).await.map_err(|_|"画像変換が中断されました。".to_string())?}
#[cfg(test)]
mod tests{
 use super::*;
 #[test] fn rejects_bad_heif_without_decoding(){assert!(decode(b"not a heic".to_vec()).is_err());}
 #[test] fn synthetic_heif_preserves_size_and_pixels(){
  let raw=std::fs::read(concat!(env!("CARGO_MANIFEST_DIR"),"/../tests/fixtures/photo.heic")).unwrap();
  let result=decode(raw).expect("Windows HEIF/HEVC codec is required for this integration test");
  assert_eq!((result.width,result.height),(120,80));
  let mut decoder=png::Decoder::new(std::io::Cursor::new(result.png)).read_info().unwrap();let mut data=vec![0;decoder.output_buffer_size()];decoder.next_frame(&mut data).unwrap();
  let pink=(30*120+30)*4;assert!(data[pink]>170&&data[pink+1]<80&&data[pink+3]==255);
 }
}

