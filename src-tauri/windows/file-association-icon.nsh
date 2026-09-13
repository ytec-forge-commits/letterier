; Keep the document icon distinct from the application executable icon.
; The standard Tauri association uses the association name as the ProgID.
!macro NSIS_HOOK_POSTINSTALL
  WriteRegStr SHCTX "Software\Classes\レタリエの手紙\DefaultIcon" "" "$\"$INSTDIR\resources\icons\binsen-document.ico$\""
  System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0, p 0, p 0)'
!macroend
