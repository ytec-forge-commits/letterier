import { describe, expect, it } from 'vitest';
import { backgroundImageStyle } from '../src/ui/Paper';
import {newProject} from '../src/core/model';
import {packProject,unpackProject,validateProject} from '../src/core/archive';

describe('背景画像の位置指定', () => {
  it('用紙実寸の移動は縦横とも倍率に依存せず反映する', () => {
    const bg={fit:'contain' as const,x:50,y:50,scale:1,opacity:.4,offsetXmm:12,offsetYmm:-7};
    expect(backgroundImageStyle(bg).transform).toBe('translate(12mm, -7mm) scale(1)');
    expect(backgroundImageStyle({...bg,scale:2}).transform).toBe('translate(12mm, -7mm) scale(2)');
  });
  it('横位置0/100を画像の左右移動としてCSSへ反映する', () => {
    const left = backgroundImageStyle({ fit: 'contain', x: 0, y: 50, scale: 0.63, opacity: 1 });
    const right = backgroundImageStyle({ fit: 'contain', x: 100, y: 50, scale: 0.63, opacity: 1 });
    expect(left.transform).toBe('translate(-18.5%, 0%) scale(0.63)');
    expect(right.transform).toBe('translate(18.5%, 0%) scale(0.63)');
    expect(left.objectPosition).toBe('0% 50%');
  });
  it('直接操作の位置は保存して再読込できる',()=>{
    const p=newProject();Object.assign(p.pages[0].background,{offsetXmm:12,offsetYmm:-7});
    const reopened=unpackProject(packProject(p));
    expect(reopened.pages[0].background).toHaveProperty('offsetXmm',12);
    expect(reopened.pages[0].background).toHaveProperty('offsetYmm',-7);
  });
  it.each([NaN,Infinity,1001,-1001])('破損した直接操作位置を保存しない: %s',value=>{
    const p=newProject();Object.assign(p.pages[0].background,{offsetXmm:value});
    expect(()=>validateProject(p)).toThrow();
  });
});
