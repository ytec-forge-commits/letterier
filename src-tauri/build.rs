fn main() {
    if std::env::var("CARGO_CFG_TARGET_OS").as_deref() == Ok("windows") {
        cc::Build::new().cpp(true).std("c++17").static_crt(true)
            .flag_if_supported("/utf-8").warnings(true)
            .file("src/native_ime.cpp").compile("letterier_native_ime");
        for library in ["user32", "gdi32", "ole32", "oleaut32", "uuid", "dwrite", "d2d1"] {
            println!("cargo:rustc-link-lib={library}");
        }
        println!("cargo:rerun-if-changed=src/native_ime.cpp");
        println!("cargo:rerun-if-changed=src/native_ime.h");
        println!("cargo:rerun-if-changed=src/native_ime_candidates.h");
    }
    tauri_build::build();
}
