const noStart = new Set(Array.from('、。，．・：；？！‼⁇⁈⁉ー〜～…‥）〕］｝〉》」』】〙〗〟’”»ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ々ヽヾゝゞ'));
const noEnd = new Set(Array.from('（〔［｛〈《「『【〘〖〝‘“«'));
export const graphemes = (text: string) => Array.from(new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(text), s => s.segment);

export function lineEnd<T extends { text: string; advance: number }>(units: T[], start: number, extent: number, preferWordBoundary=false): number {
  let end = start;
  let used = 0;
  while (end < units.length && !['\n', '\f'].includes(units[end].text) && used + units[end].advance <= extent + 0.001) {
    used += units[end++].advance;
  }
  if (end === start && end < units.length && !['\n', '\f'].includes(units[end].text)) return end + 1;
  const original = end;
  if(preferWordBoundary && end<units.length && /[A-Za-z0-9'’]/.test(units[end-1]?.text??'') && /[A-Za-z0-9'’]/.test(units[end].text)) {
    for(let index=end-1;index>start;index--)if(/^\s+$/.test(units[index].text)){end=index+1;break;}
  }
  while (end > start && (noEnd.has(units[end - 1].text) || (end < units.length && noStart.has(units[end].text)))) end--;
  return end > start ? end : original;
}

export function layoutText(text: string, options: { vertical: boolean; columns: number; rows: number }): { pages: string[][] } {
  if (options.columns < 1 || options.rows < 1) throw new Error('用紙の本文領域がありません。');
  const units = graphemes(text).map(text => ({ text, advance: 1 }));
  const pages: string[][] = [[]];
  let start = 0;
  while (start < units.length) {
    if (units[start].text === '\f') { pages.push([]); start++; continue; }
    if (pages.at(-1)!.length === options.rows) pages.push([]);
    const end = lineEnd(units, start, options.columns,!options.vertical);
    pages.at(-1)!.push(units.slice(start, end).map(t => t.text).join(''));
    start = end;
    if (units[start]?.text === '\n') start++;
  }
  return { pages };
}
