// Vice Panels render engine: draws a multi-panel GTA-style poster onto any
// canvas at any export size. Pure canvas 2D, no assets, no network. Every
// shape (sun disc, palm silhouettes, gutters, caption band) is drawn here
// from code, so the cover is original art made from the user's own photos.

export const LAYOUTS = {
  grid: { label: 'Vice Grid', panels: 3 },
  strip: { label: 'Neon Strip', panels: 3 },
  poster: { label: 'Poster Split', panels: 3 },
};

export const GRADES = {
  sunset: { label: 'Vice Sunset', tint: ['rgba(255,122,26,0.28)', 'rgba(214,32,122,0.42)'], filter: 'saturate(1.45) contrast(1.08) brightness(1.02)', sky: '#ff7a1a' },
  neon: { label: 'Neon Nights', tint: ['rgba(0,229,255,0.20)', 'rgba(255,0,153,0.40)'], filter: 'saturate(1.7) contrast(1.12) hue-rotate(-12deg)', sky: '#00e5ff' },
  midnight: { label: 'Midnight Palm', tint: ['rgba(40,60,220,0.30)', 'rgba(120,0,160,0.45)'], filter: 'saturate(1.25) contrast(1.15) brightness(0.92)', sky: '#7a5cff' },
  pastel: { label: 'Pastel Drive', tint: ['rgba(255,183,213,0.25)', 'rgba(255,214,120,0.30)'], filter: 'saturate(1.3) contrast(1.02) brightness(1.06)', sky: '#ffb7d5' },
};

export const SIZES = {
  square: { label: '1080 x 1080 · Square post', w: 1080, h: 1080 },
  portrait: { label: '1080 x 1350 · Portrait post', w: 1080, h: 1350 },
  wide: { label: '1920 x 1080 · Wide / story', w: 1920, h: 1080 },
};

// Panel rectangles for a layout, as fractions of the canvas. The caption
// band always sits across the bottom; panels fill everything above it.
export function panelRects(layout, w, h) {
  const band = h * 0.24;
  const top = h - band;
  if (layout === 'strip') {
    const cw = w / 3;
    return [
      { x: 0, y: 0, w: cw, h: top },
      { x: cw, y: 0, w: cw, h: top },
      { x: cw * 2, y: 0, w: cw, h: top },
    ];
  }
  if (layout === 'poster') {
    const lw = w * 0.62;
    return [
      { x: 0, y: 0, w: lw, h: top },
      { x: lw, y: 0, w: w - lw, h: top / 2 },
      { x: lw, y: top / 2, w: w - lw, h: top / 2 },
    ];
  }
  // grid: one wide hero on top, two side-by-side below it.
  return [
    { x: 0, y: 0, w, h: top * 0.58 },
    { x: 0, y: top * 0.58, w: w / 2, h: top * 0.42 },
    { x: w / 2, y: top * 0.58, w: w / 2, h: top * 0.42 },
  ];
}

export function panelAt(layout, w, h, px, py) {
  const rects = panelRects(layout, w, h);
  for (let i = rects.length - 1; i >= 0; i--) {
    const r = rects[i];
    if (px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h) return i;
  }
  return -1;
}

function drawPhotoInto(ctx, photo, rect, zoom, ox, oy, grade) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  if (!photo) {
    const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    g.addColorStop(0, '#3d1c5c');
    g.addColorStop(1, '#12081f');
    ctx.fillStyle = g;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `700 ${Math.round(rect.h * 0.09)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ADD A PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
    ctx.restore();
    return;
  }
  const base = Math.max(rect.w / photo.naturalWidth, rect.h / photo.naturalHeight);
  const scale = base * (zoom || 1);
  const pw = photo.naturalWidth * scale;
  const ph = photo.naturalHeight * scale;
  const cx = rect.x + rect.w / 2 + (ox || 0) * rect.w * 0.4;
  const cy = rect.y + rect.h / 2 + (oy || 0) * rect.h * 0.4;
  ctx.filter = grade.filter;
  ctx.drawImage(photo, cx - pw / 2, cy - ph / 2, pw, ph);
  ctx.filter = 'none';
  const tint = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  tint.addColorStop(0, grade.tint[0]);
  tint.addColorStop(1, grade.tint[1]);
  ctx.fillStyle = tint;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

// One palm silhouette: a curved trunk plus seven drooping fronds, drawn
// with quadratic curves so it reads as a palm at any size.
function drawPalm(ctx, x, y, s, lean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.scale(s, s);
  ctx.strokeStyle = '#14081f';
  ctx.fillStyle = '#14081f';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(14, -70, 4, -140);
  ctx.stroke();
  for (let i = 0; i < 7; i++) {
    const a = (-150 + i * 50) * Math.PI / 180;
    const tx = 4 + Math.cos(a) * 95;
    const ty = -140 + Math.sin(a) * 52;
    ctx.beginPath();
    ctx.moveTo(4, -140);
    ctx.quadraticCurveTo(4 + Math.cos(a) * 55, -140 + Math.sin(a) * 30 - 26, tx, ty);
    ctx.lineWidth = 7;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(4, -140, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSun(ctx, x, y, r, colour) {
  const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
  g.addColorStop(0, '#fff3c4');
  g.addColorStop(0.55, colour);
  g.addColorStop(1, 'rgba(255,90,60,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  // Retro slats cut across the lower half of the disc.
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r * 0.92, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = 'rgba(20,8,31,0.55)';
  for (let i = 0; i < 4; i++) {
    const sy = y + r * (0.08 + i * 0.22);
    ctx.fillRect(x - r, sy, r * 2, r * (0.05 + i * 0.02));
  }
  ctx.restore();
}

function fitTitle(ctx, text, maxW, startSize) {
  let size = startSize;
  ctx.font = `900 ${size}px "Arial Black", Impact, system-ui, sans-serif`;
  while (size > 18 && ctx.measureText(text).width > maxW) {
    size -= 4;
    ctx.font = `900 ${size}px "Arial Black", Impact, system-ui, sans-serif`;
  }
  return size;
}

// style: 'block' | 'outline' | 'neon' — three original lettering treatments.
function drawCaption(ctx, state, w, h) {
  const bandY = h * 0.76;
  const band = ctx.createLinearGradient(0, bandY - h * 0.06, 0, h);
  band.addColorStop(0, 'rgba(16,6,28,0)');
  band.addColorStop(0.35, 'rgba(16,6,28,0.82)');
  band.addColorStop(1, '#10061c');
  ctx.fillStyle = band;
  ctx.fillRect(0, bandY - h * 0.06, w, h - bandY + h * 0.06);

  const title = (state.title || '').trim().toUpperCase();
  const sub = (state.subtitle || '').trim();
  const grade = GRADES[state.grade] || GRADES.sunset;
  const cx = w / 2;
  const titleSize = fitTitle(ctx, title || 'VICE CITY', w * 0.88, h * 0.105 * (state.titleScale || 1));
  const ty = h - h * 0.085;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  if (title) {
    if (state.titleStyle === 'outline') {
      ctx.lineWidth = Math.max(3, titleSize * 0.09);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeText(title, cx, ty);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillText(title, cx, ty);
    } else if (state.titleStyle === 'neon') {
      ctx.shadowColor = grade.sky;
      ctx.shadowBlur = titleSize * 0.45;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(title, cx, ty);
      ctx.shadowBlur = titleSize * 0.18;
      ctx.fillStyle = grade.sky;
      ctx.fillText(title, cx, ty);
      ctx.shadowBlur = 0;
    } else {
      const fill = ctx.createLinearGradient(0, ty - titleSize, 0, ty);
      fill.addColorStop(0, '#ffffff');
      fill.addColorStop(0.55, '#ffe9a8');
      fill.addColorStop(1, grade.sky);
      ctx.lineWidth = Math.max(4, titleSize * 0.11);
      ctx.strokeStyle = '#14081f';
      ctx.strokeText(title, cx, ty);
      ctx.fillStyle = fill;
      ctx.fillText(title, cx, ty);
    }
  }
  if (sub) {
    const subSize = Math.max(16, h * 0.028);
    ctx.font = `700 ${subSize}px system-ui, sans-serif`;
    ctx.fillStyle = '#ffd9ec';
    // Letter-spaced subtitle, drawn one character at a time.
    const gap = subSize * 0.28;
    const widths = [...sub].map((ch) => ctx.measureText(ch).width + gap);
    const total = widths.reduce((a, b) => a + b, 0) - gap;
    let sx = cx - total / 2;
    ctx.textAlign = 'left';
    [...sub].forEach((ch, i) => {
      ctx.fillText(ch, sx, ty - titleSize * 1.12);
      sx += widths[i];
    });
    ctx.textAlign = 'center';
  }
}

export function renderCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = GRADES[state.grade] || GRADES.sunset;
  ctx.fillStyle = '#10061c';
  ctx.fillRect(0, 0, w, h);
  const rects = panelRects(state.layout, w, h);
  rects.forEach((rect, i) => {
    const p = state.panels[i] || {};
    drawPhotoInto(ctx, p.photo || null, rect, p.zoom, p.ox, p.oy, grade);
  });
  // White gutters between panels + a frame, the poster-grid look. (Stroke
  // style, not fill: strokeRect draws with the stroke colour.)
  const gut = Math.max(4, w * 0.005);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = gut;
  rects.forEach((r) => ctx.strokeRect(r.x, r.y, r.w, r.h));
  ctx.lineWidth = Math.max(6, w * 0.007);
  ctx.strokeRect(0, 0, w, h);
  // Sun disc + palms peeking over the caption band.
  drawSun(ctx, w * 0.86, h * 0.74, h * 0.075, grade.sky);
  const palmS = h * 0.0011;
  drawPalm(ctx, w * 0.06, h * 0.79, palmS, -0.12);
  drawPalm(ctx, w * 0.13, h * 0.80, palmS * 0.7, 0.18);
  // Soft vignette so the panels feel printed, not pasted.
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(10,4,20,0.38)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
  drawCaption(ctx, state, w, h);
}
