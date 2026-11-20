// Vice Panels entry point: build the editor, then either run a screenshot
// scene (?shot=...) or leave the live editor ready for the user.
import { buildEditor } from './editor.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const editor = buildEditor(canvas, {
  photos: document.getElementById('photos'),
  sampleBoulevard: document.getElementById('sample-boulevard'),
  samplePier: document.getElementById('sample-pier'),
  fillAll: document.getElementById('fill-all'),
  layoutBtns: document.getElementById('layout-btns'),
  gradeBtns: document.getElementById('grade-btns'),
  sizeBtns: document.getElementById('size-btns'),
  title: document.getElementById('title'),
  subtitle: document.getElementById('subtitle'),
  titleStyle: document.getElementById('title-style'),
  titleScale: document.getElementById('title-scale'),
  zoom: document.getElementById('zoom'),
  zoomOut: document.getElementById('zoom-out'),
  panX: document.getElementById('pan-x'),
  panY: document.getElementById('pan-y'),
  resetCrop: document.getElementById('reset-crop'),
  shuffle: document.getElementById('shuffle'),
  panelDots: document.getElementById('panel-dots'),
  panelLabel: document.getElementById('panel-label'),
  tray: document.getElementById('tray'),
  trayEmpty: document.getElementById('tray-empty'),
  exportBtn: document.getElementById('export'),
  status: document.getElementById('status'),
});

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), editor).catch(() => {
    window.__shotReady = true;
  });
} else {
  window.__shotReady = true;
}
