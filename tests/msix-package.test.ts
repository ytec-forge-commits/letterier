import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = resolve(import.meta.dirname, '..');

describe('Microsoft Store package script', () => {
  it('packages and assigns the distinct .binsen document icon', () => {
    const script = readFileSync(resolve(projectRoot, 'scripts/package-msix.ps1'), 'utf8');

    expect(script).toContain('binsen-document.png');
    expect(script).toContain('<uap:Logo>Assets\\binsen-document.png</uap:Logo>');
  });
});
