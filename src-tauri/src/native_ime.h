#pragma once
#include <stdint.h>

// All functions run on the owning window's UI thread. Strings are UTF-16.
struct LetterierImeRect {double x,y,width,height;};
struct LetterierImeEvent {
 uint32_t kind;uint64_t session,sequence;
 int32_t start,end,selection_start,selection_end;
 const uint16_t* text;uint32_t length,key,modifiers;
};
using LetterierImeCallback=void(*)(void*,const LetterierImeEvent*);
extern "C" {
 int32_t letterier_ime_start(intptr_t parent,uint64_t session,const uint16_t* text,uint32_t length,int32_t start,int32_t end,LetterierImeCallback callback,void* user);
 int32_t letterier_ime_sync(uint64_t session,const uint16_t* text,uint32_t length,int32_t start,int32_t end);
 void letterier_ime_selection(uint64_t session,int32_t start,int32_t end);
 void letterier_ime_bounds(uint64_t session,LetterierImeRect control,LetterierImeRect selection,double scale);
 void letterier_ime_characters(uint64_t session,uint32_t revision,int32_t start,const LetterierImeRect* rects,uint32_t length);
 void letterier_ime_focus(uint64_t session);
 int32_t letterier_ime_stop(uint64_t session);
}
