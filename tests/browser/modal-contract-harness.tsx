// Test-only host: real Modal, no App, document store, native commands or network API.
import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Modal} from '../../src/ui/Modal';
import '../../src/ui/app.css';

function Harness() {
  const [kind, setKind] = useState<'dismissible'|'mandatory'|'busy'|null>(null);
  const [busy, setBusy] = useState(false);
  const close = () => setKind(null);
  return <main style={{padding:32}}>
    <h1>合成データ専用 Modal 部品試験</h1>
    <button onClick={() => setKind('dismissible')}>通常の画面を開く</button>
    <button onClick={() => setKind('mandatory')}>必須確認を開く</button>
    <button onClick={() => {setBusy(true); setKind('busy');}}>処理中画面を開く</button>
    {kind && <Modal title={kind === 'mandatory' ? '合成必須確認' : kind === 'busy' ? '合成処理中' : '合成通常画面'}
      onClose={kind === 'mandatory' || busy && kind === 'busy' ? undefined : close}>
      <p>この部品試験はWindowsの終了操作・印刷・保存処理を実行しません。</p>
      <input aria-label="合成入力" defaultValue="入力は保持されます"/>
      {kind === 'mandatory' && <button onClick={close}>明示的に続行する</button>}
      {kind === 'busy' && <button onClick={() => setBusy(false)}>合成処理を完了する</button>}
    </Modal>}
  </main>;
}
createRoot(document.getElementById('root')!).render(<Harness/>);
