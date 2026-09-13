import { useState } from 'react';
import './probe.css';

export function Probe() {
  const [vertical, setVertical] = useState(false);
  return <><header><strong>レタリエ · 技術検証</strong><button onClick={() => setVertical(!vertical)}>横書き / 縦書き</button><button onClick={() => window.print()}>PDF・印刷試験</button></header>
    <main><article className={vertical ? 'paper vertical' : 'paper'}>
      <div className="body" contentEditable suppressContentEditableWarning role="textbox" aria-label="手紙の本文" lang="ja">
        九月の風が、少しずつ秋の気配を運んできます。<br />お元気でお過ごしでしょうか。<br />「ありがとう」の気持ちを、一枚の手紙に。<br />12月・2026年・コーヒー・きゃく・句読点。、<br />この便箋の上へ直接入力できます。
      </div>
    </article></main></>;
}
