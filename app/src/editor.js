// Vice Panels editor: photo tray, per-panel crop/position, caption and
// grade controls, layout + size switching, and PNG export. All photos are
// read with FileReader on this machine and never uploaded anywhere.

import { GRADES, LAYOUTS, SIZES, panelAt, panelRects, renderCover } from './render.js';

export function blankState() {
  return {
    layout: 'grid',
    grade: 'sunset',
    size: 'wide',
    title: 'VICE CITY',
    subtitle: 'Sunset Heist',
    titleStyle: 'block',
    titleScale: 1,
    selected: 0,
    panels: [
      { photo: null, zoom: 1, ox: 0, oy: 0 },
      { photo: null, zoom: 1, ox: 0, oy: 0 },
      { photo: null, zoom: 1, ox: 0, oy: 0 },
    ],
  };
}

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('could not load image'));
    img.src = url;
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('could not read file'));
    reader.readAsDataURL(file);
  });
}

export function buildEditor(canvas, els) {
  const state = blankState();
  const tray = []; // { img, name, url } — every photo the user added.
  let statusTimer = 0;

  function say(msg) {
    els.status.textContent = msg;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { els.status.textContent = ''; }, 4000);
  }

  function draw() {
    const size = SIZES[state.size];
    if (canvas.width !== size.w || canvas.height !== size.h) {
      canvas.width = size.w;
      canvas.height = size.h;
    }
    renderCover(canvas, state);
    syncPanelControls();
    markSelectedPanel();
  }

  function syncPanelControls() {
    const p = state.panels[state.selected];
    els.zoom.value = p.zoom;
    els.panX.value = p.ox;
    els.panY.value = p.oy;
    els.zoomOut.textContent = `${Math.round(p.zoom * 100)}%`;
    els.panelLabel.textContent = `Panel ${state.selected + 1} of 3`;
  }

  function markSelectedPanel() {
    els.panelDots.querySelectorAll('button').forEach((b, i) => {
      b.classList.toggle('on', i === state.selected);
      b.setAttribute('aria-pressed', String(i === state.selected));
    });
  }

  function rebuildTray() {
    els.tray.innerHTML = '';
    tray.forEach((item, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'thumb';
      btn.title = `${item.name} — click to put it in panel ${state.selected + 1}`;
      const thumb = document.createElement('img');
      thumb.src = item.url;
      thumb.alt = item.name;
      btn.appendChild(thumb);
      btn.addEventListener('click', () => {
        state.panels[state.selected].photo = item.img;
        draw();
        say(`${item.name} → panel ${state.selected + 1}`);
      });
      els.tray.appendChild(btn);
    });
    els.trayEmpty.style.display = tray.length ? 'none' : 'block';
  }

  async function addFiles(files) {
    let added = 0;
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const url = await readFileAsDataUrl(file);
        const img = await loadImage(url);
        tray.push({ img, name: file.name, url });
        added++;
      } catch { /* skip unreadable files, keep the rest */ }
    }
    if (!added) { say('No photos added — pick an image file.'); return; }
    rebuildTray();
    // First photo fills every empty panel, so one photo already makes a cover.
    const first = tray[tray.length - added].img;
    state.panels.forEach((p) => { if (!p.photo) p.photo = first; });
    draw();
    say(`${added} photo${added > 1 ? 's' : ''} added — click a thumbnail, then a panel.`);
  }

  async function loadSample(name) {
    try {
      const img = await loadImage(`samples/${name}.jpg`);
      tray.push({ img, name: `${name}.jpg`, url: `samples/${name}.jpg` });
      rebuildTray();
      state.panels.forEach((p) => { if (!p.photo) p.photo = img; });
      draw();
      say(`Sample ${name} loaded into the empty panels.`);
    } catch { say('Sample photo did not load.'); }
  }

  function fillAllWithSelected() {
    const p = state.panels[state.selected];
    if (!p.photo) { say('Put a photo in this panel first.'); return; }
    state.panels.forEach((q) => { q.photo = p.photo; });
    draw();
    say('Same photo in all three panels — crop each one differently.');
  }

  // --- wiring -------------------------------------------------------------
  els.photos.addEventListener('change', (e) => { addFiles([...e.target.files]); e.target.value = ''; });
  els.sampleBoulevard.addEventListener('click', () => loadSample('boulevard'));
  els.samplePier.addEventListener('click', () => loadSample('pier'));
  els.fillAll.addEventListener('click', fillAllWithSelected);

  els.layoutBtns.querySelectorAll('button').forEach((b) => {
    b.addEventListener('click', () => {
      state.layout = b.dataset.layout;
      els.layoutBtns.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
      draw();
    });
  });
  els.gradeBtns.querySelectorAll('button').forEach((b) => {
    b.addEventListener('click', () => {
      state.grade = b.dataset.grade;
      els.gradeBtns.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
      draw();
    });
  });
  els.sizeBtns.querySelectorAll('button').forEach((b) => {
    b.addEventListener('click', () => {
      state.size = b.dataset.size;
      els.sizeBtns.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
      draw();
      say(`${SIZES[state.size].label} — export matches the preview.`);
    });
  });
  els.title.addEventListener('input', () => { state.title = els.title.value; draw(); });
  els.subtitle.addEventListener('input', () => { state.subtitle = els.subtitle.value; draw(); });
  els.titleStyle.addEventListener('change', () => { state.titleStyle = els.titleStyle.value; draw(); });
  els.titleScale.addEventListener('input', () => { state.titleScale = Number(els.titleScale.value); draw(); });
  els.zoom.addEventListener('input', () => { state.panels[state.selected].zoom = Number(els.zoom.value); draw(); });
  els.panX.addEventListener('input', () => { state.panels[state.selected].ox = Number(els.panX.value); draw(); });
  els.panY.addEventListener('input', () => { state.panels[state.selected].oy = Number(els.panY.value); draw(); });
  els.shuffle.addEventListener('click', () => {
    const keys = Object.keys(GRADES);
    state.grade = keys[Math.floor(Math.random() * keys.length)];
    els.gradeBtns.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x.dataset.grade === state.grade));
    draw();
    say(`Grade: ${GRADES[state.grade].label}`);
  });
  els.resetCrop.addEventListener('click', () => {
    const p = state.panels[state.selected];
    p.zoom = 1; p.ox = 0; p.oy = 0;
    draw();
  });

  els.panelDots.querySelectorAll('button').forEach((b, i) => {
    b.addEventListener('click', () => { state.selected = i; draw(); });
  });

  canvas.addEventListener('click', (e) => {
    const r = canvas.getBoundingClientRect();
    const px = (e.clientX - r.left) * (canvas.width / r.width);
    const py = (e.clientY - r.top) * (canvas.height / r.height);
    const hit = panelAt(state.layout, canvas.width, canvas.height, px, py);
    if (hit >= 0) { state.selected = hit; draw(); say(`Panel ${hit + 1} selected — adjust its crop below.`); }
  });

  els.exportBtn.addEventListener('click', () => {
    const size = SIZES[state.size];
    const off = document.createElement('canvas');
    off.width = size.w;
    off.height = size.h;
    renderCover(off, state);
    off.toBlob((blob) => {
      if (!blob) { say('Export failed — try again.'); return; }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `vice-panels-${size.w}x${size.h}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      say(`Saved vice-panels-${size.w}x${size.h}.png`);
    }, 'image/png');
  });

  // Drag-and-drop photos straight onto the preview.
  canvas.addEventListener('dragover', (e) => e.preventDefault());
  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) addFiles([...e.dataTransfer.files]);
  });

  draw();
  return { state, draw, addFiles, loadSample, say, tray };
}
