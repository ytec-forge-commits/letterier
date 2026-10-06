import {expect, test} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {newProject} from '../src/core/model';
import {EditorRibbon} from '../src/ui/EditorRibbon';

test('quick save shows a drawn disk without relying on the installed symbol font', () => {
  const project = newProject();
  const markup = renderToStaticMarkup(<EditorRibbon project={project} style={project.baseStyle}
    fonts={[]} recent={[]} status="" canUndo={false} canRedo={false} hasSelection={false}
    context={null} zoom={1} thumbnails onFormat={()=>{}} onSettings={()=>{}}
    onStandardFont={()=>{}} onStandardSize={()=>{}} onZoom={()=>{}} onThumbnails={()=>{}} onUndo={()=>{}}
    onClipboard={()=>{}} onAction={()=>{}}/>);
  const quickSave = markup.split('class="quick-actions"')[1].split('</button>')[0];
  expect(quickSave).toContain('aria-label="保存"');
  expect(quickSave).toContain('<svg');
  expect(quickSave).toContain('aria-hidden="true"');
  expect(quickSave).toMatch(/<(path|rect)\b/);
});
