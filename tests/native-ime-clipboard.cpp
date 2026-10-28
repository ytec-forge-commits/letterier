// Regression: a failed clipboard-open operation must leave Ctrl+X text intact.
// OS key-state and clipboard-open failure are substituted to protect the user's
// clipboard. All cut/copy branches and the TextStore are production code.
#define UNICODE
#define _UNICODE
#define NOMINMAX
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <string>
#include <cstdio>
static SHORT clipboardTestKeyState(int key){return key==VK_CONTROL?SHORT(-32768):0;}
static BOOL clipboardTestOpen(HWND){SetLastError(ERROR_ACCESS_DENIED);return FALSE;}
#define GetKeyState clipboardTestKeyState
#define OpenClipboard clipboardTestOpen
#include "../src-tauri/src/native_ime.cpp"
#undef OpenClipboard
#undef GetKeyState

int main(){
 store=new TextStore;store->text=L"消えてはいけない合成本文";store->selection.acpStart=0;store->selection.acpEnd=LONG(store->text.size());inputProc(nullptr,WM_KEYDOWN,'X',0);
 const bool preserved=store->text==L"消えてはいけない合成本文";
 std::printf("clipboardFailurePreservesSelection=%s\n",preserved?"PASS":"FAIL");
 store->text.clear();store->selection.acpStart=store->selection.acpEnd=0;inputProc(nullptr,WM_CHAR,0x7f,0);
 const bool noControlText=store->text.empty();std::printf("controlCharacterExcluded=%s\n",noControlText?"PASS":"FAIL");
 store->Release();store=nullptr;return preserved&&noControlText?0:2;
}
