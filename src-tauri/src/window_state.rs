use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, Position};

#[derive(Debug, Deserialize, Serialize)]
struct WindowPosition { x: i32, y: i32 }

const STATE_FILE: &str = "window-position.json";

fn valid(position: &WindowPosition) -> bool {
    (-32_000..=32_000).contains(&position.x) && (-32_000..=32_000).contains(&position.y)
}

fn path(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    app.path().app_data_dir().map(|dir| dir.join(STATE_FILE)).map_err(|_| "ウィンドウ位置の保存先を確認できません。".into())
}

pub fn restore(app: &AppHandle) {
    let Ok(path) = path(app) else { return };
    let Ok(bytes) = std::fs::read(path) else { return };
    let Ok(position) = serde_json::from_slice::<WindowPosition>(&bytes) else { return };
    if !valid(&position) { return; }
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.set_position(Position::Physical(tauri::PhysicalPosition::new(position.x, position.y)));
    }
}

pub fn save(app: &AppHandle) {
    let Some(window) = app.get_webview_window("main") else { return };
    let Ok(position) = window.outer_position() else { return };
    let value = WindowPosition { x: position.x, y: position.y };
    if !valid(&value) { return; }
    let Ok(path) = path(app) else { return };
    let Some(parent) = path.parent() else { return };
    if std::fs::create_dir_all(parent).is_err() { return; }
    if let Ok(bytes) = serde_json::to_vec(&value) {
        let _ = std::fs::write(path, bytes);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn rejects_positions_outside_the_supported_windows_desktop_range() {
        assert!(valid(&WindowPosition { x: -32_000, y: 32_000 }));
        assert!(!valid(&WindowPosition { x: 32_001, y: 0 }));
    }
}
