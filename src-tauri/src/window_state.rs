use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{AppHandle, Manager, Position};

#[derive(Clone, Debug, Deserialize, Serialize)]
struct WindowPosition {
    x: i32,
    y: i32,
    // Optional logical client dimensions keep the old position-only file readable.
    #[serde(default)]
    width: Option<f64>,
    #[serde(default)]
    height: Option<f64>,
    #[serde(default)]
    maximized: bool,
}

#[derive(Default)]
pub struct WindowState(Mutex<Option<WindowPosition>>);

const STATE_FILE: &str = "window-position.json";

fn valid(position: &WindowPosition) -> bool {
    (-32_000..=32_000).contains(&position.x) && (-32_000..=32_000).contains(&position.y)
}

fn logical_size(position: &WindowPosition) -> (f64, f64) {
    match (position.width, position.height) {
        (Some(w), Some(h)) if w.is_finite() && h.is_finite() && (1.0..=16_000.0).contains(&w) && (1.0..=16_000.0).contains(&h) => (w.max(960.0), h.max(640.0)),
        _ => (1280.0, 800.0),
    }
}

fn fit_size(size: (f64, f64), available: (f64, f64)) -> (f64, f64) {
    (size.0.min(available.0.max(1.0)), size.1.min(available.1.max(1.0)))
}

fn fit_point(point: (i32, i32), origin: (i32, i32), screen: (u32, u32), outer: (u32, u32)) -> (i32, i32) {
    (point.0.max(origin.0).min((origin.0 as i64 + screen.0.saturating_sub(outer.0) as i64).min(i32::MAX as i64) as i32),
     point.1.max(origin.1).min((origin.1 as i64 + screen.1.saturating_sub(outer.1) as i64).min(i32::MAX as i64) as i32))
}

fn path(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    // Use the explicitly configured debug QA root, as document storage does.
    // The QA launcher is responsible for selecting a synthetic-only directory.
    if cfg!(debug_assertions) {
        if let Some(root) = std::env::var_os("BINSEN_QA_DATA") {
            return Ok(std::path::PathBuf::from(root).join(STATE_FILE));
        }
    }
    app.path().app_data_dir().map(|dir| dir.join(STATE_FILE)).map_err(|_| "ウィンドウ位置の保存先を確認できません。".into())
}

pub fn restore(app: &AppHandle) {
    let Ok(path) = path(app) else { return };
    let Ok(bytes) = std::fs::read(path) else { return };
    let Ok(position) = serde_json::from_slice::<WindowPosition>(&bytes) else { return };
    if !valid(&position) { return; }
    if let Some(window) = app.get_webview_window("main") {
        let monitors = window.available_monitors().unwrap_or_default();
        let target = monitors.iter().find(|monitor| {
            let area = monitor.work_area();
            position.x >= area.position.x && position.y >= area.position.y
                && (position.x as i64) < area.position.x as i64 + area.size.width as i64
                && (position.y as i64) < area.position.y as i64 + area.size.height as i64
        }).cloned().or_else(|| window.primary_monitor().ok().flatten());
        let mut point = (position.x, position.y);
        let mut available = (16_000.0, 16_000.0);
        let mut small_screen = false;
        if let Some(monitor) = target {
            let area = monitor.work_area();
            let scale = monitor.scale_factor();
            if scale.is_finite() && scale > 0.0 {
                // Reserve room for the native frame; avoid hiding the title bar.
                available = ((area.size.width as f64 / scale - 32.0).max(1.0), (area.size.height as f64 / scale - 64.0).max(1.0));
                small_screen = available.0 < 960.0 || available.1 < 640.0;
                let size = fit_size(logical_size(&position), available);
                point = fit_point(point, (area.position.x, area.position.y), (area.size.width, area.size.height), (((size.0 + 32.0) * scale).ceil() as u32, ((size.1 + 64.0) * scale).ceil() as u32));
            }
        }
        let _ = window.set_position(Position::Physical(tauri::PhysicalPosition::new(point.0, point.1)));
        let (width, height) = fit_size(logical_size(&position), available);
        if small_screen { let _ = window.set_min_size(Some(tauri::LogicalSize::new(width, height))); }
        let _ = window.set_size(tauri::LogicalSize::new(width, height));
        remember(app);
        if position.maximized || small_screen { let _ = window.maximize(); }
    }
}

// Keep the normal rectangle; maximized/minimized dimensions must not replace it.
pub fn remember(app: &AppHandle) {
    let Some(window) = app.get_webview_window("main") else { return };
    if window.is_minimized().unwrap_or(true) { return; }
    let Ok(maximized) = window.is_maximized() else { return };
    if maximized {
        if let Ok(mut state) = app.state::<WindowState>().0.lock() {
            if let Some(value) = state.as_mut() { value.maximized = true; }
        }
        return;
    }
    let Ok(position) = window.outer_position() else { return };
    let Ok(size) = window.inner_size() else { return };
    let Ok(scale) = window.scale_factor() else { return };
    if !scale.is_finite() || scale <= 0.0 || size.width == 0 || size.height == 0 { return; }
    let value = WindowPosition { x: position.x, y: position.y, width: Some(size.width as f64 / scale), height: Some(size.height as f64 / scale), maximized: false };
    if !valid(&value) { return; }
    if let Ok(mut state) = app.state::<WindowState>().0.lock() { *state = Some(value); }
}

pub fn save(app: &AppHandle) {
    remember(app);
    let Some(window) = app.get_webview_window("main") else { return };
    let minimized = window.is_minimized().unwrap_or(true);
    let maximized = window.is_maximized().ok();
    let state = app.state::<WindowState>();
    // Do not hold the cache lock across native queries or filesystem writes.
    let value = { let Ok(state) = state.0.lock() else { return }; state.clone() };
    let Some(mut value) = value else { return };
    if !minimized { value.maximized = maximized.unwrap_or(value.maximized); }
    let Ok(path) = path(app) else { return };
    let Some(parent) = path.parent() else { return };
    if std::fs::create_dir_all(parent).is_err() { return; }
    if let Ok(bytes) = serde_json::to_vec(&value) {
        if let Ok(expected) = crate::storage::current_hash(&path) {
            let _ = crate::storage::atomic_save(&path, &bytes, expected.as_deref());
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn round_trip_retains_window_size_and_maximized_state() {
        let state: WindowPosition = serde_json::from_str(r#"{"x":40,"y":60,"width":1100.0,"height":720.0,"maximized":true}"#).unwrap();
        let saved = serde_json::to_value(state).unwrap();
        assert_eq!(saved["width"], 1100.0);
        assert_eq!(saved["height"], 720.0);
        assert_eq!(saved["maximized"], true);
    }
    #[test]
    fn too_small_saved_dimensions_are_clamped_instead_of_losing_the_other_dimension() {
        let state = serde_json::from_str(r#"{"x":40,"y":60,"width":900.0,"height":740.0}"#).unwrap();
        assert_eq!(logical_size(&state), (960.0, 740.0));
    }
    #[test]
    fn legacy_position_file_uses_the_default_size() {
        let state = serde_json::from_str(r#"{"x":40,"y":60}"#).unwrap();
        assert_eq!(logical_size(&state), (1280.0, 800.0));
    }
    #[test]
    fn smaller_screen_limits_restore_size_without_changing_a_fitting_dimension() {
        assert_eq!(fit_size((1440.0, 700.0), (1200.0, 740.0)), (1200.0, 700.0));
    }
    #[test]
    fn invalid_dimensions_fall_back_without_restoring_a_zero_or_unbounded_window() {
        for width in [0.0, -1.0, 16_001.0, f64::NAN, f64::INFINITY] {
            let state = WindowPosition { x: 40, y: 60, width: Some(width), height: Some(740.0), maximized: false };
            assert_eq!(logical_size(&state), (1280.0, 800.0));
        }
    }
    #[test]
    fn settings_payload_is_atomically_replaced_and_can_be_read_back() {
        let dir = tempfile::tempdir().unwrap();
        let file = dir.path().join(STATE_FILE);
        std::fs::write(&file, br#"{"x":40,"y":60}"#).unwrap();
        let expected = crate::storage::current_hash(&file).unwrap();
        let state: WindowPosition = serde_json::from_str(r#"{"x":40,"y":60,"width":1100.0,"height":740.0,"maximized":true}"#).unwrap();
        crate::storage::atomic_save(&file, &serde_json::to_vec(&state).unwrap(), expected.as_deref()).unwrap();
        let restored: WindowPosition = serde_json::from_slice(&std::fs::read(file).unwrap()).unwrap();
        assert_eq!(logical_size(&restored), (1100.0, 740.0));
        assert!(restored.maximized);
    }
    #[test]
    fn right_bottom_restore_keeps_the_whole_window_on_screen() {
        assert_eq!(fit_point((1880, 1000), (0, 0), (1920, 1080), (1100, 740)), (820, 340));
    }
    #[test]
    fn removed_monitor_restore_handles_negative_coordinates() {
        assert_eq!(fit_point((2500, 1500), (-1920, 0), (1920, 1080), (1100, 740)), (-1100, 340));
    }
    #[test]
    fn rejects_positions_outside_the_supported_windows_desktop_range() {
        assert!(valid(&WindowPosition { x: -32_000, y: 32_000, width: None, height: None, maximized: false }));
        assert!(!valid(&WindowPosition { x: 32_001, y: 0, width: None, height: None, maximized: false }));
    }
}
