// Deterministic scenes for screenshots. Each mode loads the sample photos
// into the editor, picks a layout/grade/caption, and raises
// window.__shotReady once the cover has painted twice.
//   ?shot=cover&photo=pier&layout=grid&grade=sunset&caption=...  — cover only
//   ?shot=editor&photo=boulevard&layout=poster&grade=neon         — editor UI
//   ?shot=square / ?shot=portrait                                — cover only
// `photo` may name one sample or two joined by ',', e.g. pier,boulevard:
// the first fills panel 1, the second fills panels 2 and 3. (A '+' would
// decode to a space inside a query string, so the separator is a comma.)

export async function runShot(shot, query, editor) {
  const layout = query.get('layout') || (shot === 'editor' ? 'poster' : 'grid');
  const grade = query.get('grade') || 'sunset';
  const caption = query.get('caption') || 'Vice City';
  const sub = query.get('sub') || 'Sunset Heist';
  const size = shot === 'portrait' ? 'portrait' : shot === 'square' ? 'square' : 'wide';
  const names = (query.get('photo') || 'pier').split(',').filter(Boolean);

  if (shot === 'cover' || shot === 'square' || shot === 'portrait') {
    document.body.classList.add('shot-cover');
  } else {
    document.body.classList.add('shot-editor');
  }

  // Apply the scene through the editor's own controls so the shot shows
  // exactly what a user gets from the same clicks.
  const pick = (groupId, value) => {
    document.querySelectorAll(`#${groupId} button`).forEach((b) => {
      const on = b.dataset.layout === value || b.dataset.grade === value || b.dataset.size === value;
      b.classList.toggle('on', on);
      if (on) b.click();
    });
  };
  pick('layout-btns', layout);
  pick('grade-btns', grade);
  pick('size-btns', size);

  const titleEl = document.getElementById('title');
  const subEl = document.getElementById('subtitle');
  titleEl.value = caption;
  subEl.value = sub;
  titleEl.dispatchEvent(new Event('input', { bubbles: true }));
  subEl.dispatchEvent(new Event('input', { bubbles: true }));

  // Load each named sample, then spread them across the three panels.
  const loaded = [];
  for (const name of names) {
    await editor.loadSample(name);
    loaded.push(editor.tray[editor.tray.length - 1]);
  }
  if (loaded[0]) editor.state.panels[0].photo = loaded[0].img;
  if (loaded[1]) {
    editor.state.panels[1].photo = loaded[1].img;
    editor.state.panels[2].photo = loaded[1].img;
  } else if (loaded[0]) {
    // One photo, three different crops: zoom the lower panels in a little
    // and shift them apart, so the same photo reads differently per panel.
    editor.state.panels[1].photo = loaded[0].img;
    editor.state.panels[1].zoom = 1.3;
    editor.state.panels[1].ox = -0.5;
    editor.state.panels[2].photo = loaded[0].img;
    editor.state.panels[2].zoom = 1.3;
    editor.state.panels[2].ox = 0.5;
  }
  // A neon title treatment for the neon grade, block otherwise.
  editor.state.titleStyle = grade === 'neon' ? 'neon' : 'block';
  const styleEl = document.getElementById('title-style');
  styleEl.value = editor.state.titleStyle;
  editor.draw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
