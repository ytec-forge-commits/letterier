import { describe, expect, it } from 'vitest';
import { backgroundImageStyle } from '../src/ui/Paper';

describe('背景画像の位置指定', () => {
  it('横位置0/100を画像の左右移動としてCSSへ反映する', () => {
    const left = backgroundImageStyle({ fit: 'contain', x: 0, y: 50, scale: 0.63, opacity: 1 });
    const right = backgroundImageStyle({ fit: 'contain', x: 100, y: 50, scale: 0.63, opacity: 1 });
    expect(left.transform).toBe('translate(-18.5%, 0%) scale(0.63)');
    expect(right.transform).toBe('translate(18.5%, 0%) scale(0.63)');
    expect(left.objectPosition).toBe('0% 50%');
  });
});
