"""Read-only inspection of dedicated synthetic WebView2 PDF artifacts.

This does not attest to a native save-dialog success or a physical print job.
"""
import hashlib
import json
from pathlib import Path
import argparse
import unicodedata

from pypdf import PdfReader

if not __debug__:
    raise RuntimeError('PDF verification requires assertions; do not use -O or PYTHONOPTIMIZE')

project = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('--root', choices=['native-output-qa-20261002', 'native-output-wrap-qa-20261002'], default='native-output-wrap-qa-20261002')
args = parser.parse_args()
root = (project / '.local' / args.root / 'pdf').resolve(strict=True)
assert root.is_relative_to((project / '.local').resolve()), 'Dedicated QA root required'
results = []
cases = [(paper, orientation, mode, '')
         for paper in ('A4', 'B5', 'POSTCARD')
         for orientation in ('portrait', 'landscape')
         for mode in ('horizontal', 'vertical')]
cases.append(('A4', 'portrait', 'vertical', '2'))
for paper, orientation, mode, page_range in cases:
    name = f'ui-{paper.lower()}-{orientation}-{mode}' + ('-range2' if page_range else '')
    path = (root / (name + '.pdf')).resolve(strict=True)
    assert path.is_relative_to(root), 'PDF escaped QA root'
    data = path.read_bytes()
    assert data.startswith(b'%PDF-'), name + ': invalid PDF'
    pdf = PdfReader(path)
    assert len(pdf.pages) == (1 if page_range else 2), name + ': wrong page count'
    size = {'A4': (210, 297), 'B5': (182, 257), 'POSTCARD': (100, 148)}[paper]
    if orientation == 'landscape':
        size = size[::-1]
    pages = []
    for index, page in enumerate(pdf.pages):
        measured = (float(page.mediabox.width) * 25.4 / 72,
                    float(page.mediabox.height) * 25.4 / 72)
        assert all(abs(a-b) < .25 for a, b in zip(measured, size)), name + ': wrong media size'
        assert int(page.get('/Rotate', 0)) == 0, name + ': unexpected rotation'
        # Skia emits some Japanese characters as CJK radical compatibility forms;
        # normalize those and extraction-only whitespace, not the actual document.
        text = ''.join(unicodedata.normalize('NFKC', page.extract_text()).split())
        expected = 2 if page_range else index + 1
        assert ('合成PDF試験第' + ('一' if expected == 1 else '二') + '頁。') in text, name + ': missing body'
        assert ('第一頁' if expected == 2 else '第二頁') not in text, name + ': page range leaked'
        assert ('「ありがとう」123。' if expected == 1 else 'Dearfriend456.') in text, name + ': missing second line'
        assert len(page.images) == 2, name + ': missing original artwork pair'
        assert page['/Resources'].get('/Font'), name + ': page flattened or fonts missing'
        pages.append({'millimetres': measured, 'images': len(page.images), 'text': text})
    results.append({'name': name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(), 'pages': pages})
print(json.dumps({'pdfFiles': len(results), 'results': results,
                  'scope': 'PDF files only; runtime and UI evidence must be checked separately'}, ensure_ascii=False))
