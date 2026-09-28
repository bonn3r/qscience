function typesetEl(el) {
  if (!el || !window.MathJax || !MathJax.typesetPromise) return;
  MathJax.typesetPromise([el]).catch(err => console.warn('MathJax:', err));
}

function setMath(span, latex) {
  span.innerHTML = '\\(\\displaystyle ' + latex + '\\)';
  typesetEl(span);
}

function eigenstatesOnGrid(x, nMax) {
  const N = x.length;
  const psi = new Array(nMax + 1);
  for (let n = 0; n <= nMax; n++) psi[n] = new Float64Array(N);
  const c0 = Math.pow(Math.PI, -0.25);
  for (let i = 0; i < N; i++) psi[0][i] = c0 * Math.exp(-0.5 * x[i] * x[i]);
  if (nMax >= 1) for (let i = 0; i < N; i++) psi[1][i] = Math.SQRT2 * x[i] * psi[0][i];
  for (let n = 2; n <= nMax; n++) {
    const a = Math.sqrt(2 / n), b = Math.sqrt((n - 1) / n);
    for (let i = 0; i < N; i++) psi[n][i] = a * x[i] * psi[n - 1][i] - b * psi[n - 2][i];
  }
  return psi;
}

function lnFactorialTable(nMax) {
  const t = new Float64Array(nMax + 1);
  for (let n = 1; n <= nMax; n++) t[n] = t[n - 1] + Math.log(n);
  return t;
}

let mode = 'a';
let nA = 0, n1 = 0, n2 = 1, nbar = 9, delta = 0, phi = 0;
let t = 0, playing = true, speed = 1;
const NG = 420;

function xmaxFor(nEff) { return Math.min(40, Math.max(5, Math.sqrt(2 * nEff + 1) + 4)); }

function buildState() {
  let nMax, xmax;
  if (mode === 'a') { nMax = nA; xmax = xmaxFor(nA); }
  else if (mode === 'b') { nMax = Math.max(n1, n2); xmax = xmaxFor(nMax); }
  else { nMax = Math.min(220, Math.ceil(nbar + 8 * Math.sqrt(nbar + 1) + 10)); xmax = xmaxFor(nMax); }

  const x = new Float64Array(NG);
  for (let i = 0; i < NG; i++) x[i] = -xmax + (2 * xmax * i) / (NG - 1);
  const psi = eigenstatesOnGrid(x, nMax);

  const c0 = new Array(nMax + 1).fill(0).map(() => ({ re: 0, im: 0 }));

  if (mode === 'a') {
    c0[nA] = { re: 1, im: 0 };
  } else if (mode === 'b') {
    const a = 1 / Math.SQRT2;
    c0[n1].re += a;
    c0[n2].re += a * Math.cos(delta);
    c0[n2].im += a * Math.sin(delta);
  } else {
    const lambda = Math.sqrt(nbar);
    const lnF = lnFactorialTable(nMax);
    for (let n = 0; n <= nMax; n++) {
      let lnAmp;
      if (lambda === 0) { lnAmp = (n === 0) ? 0 : -Infinity; }
      else { lnAmp = n * Math.log(lambda) - 0.5 * lnF[n] - 0.5 * lambda * lambda; }
      const ampVal = Math.exp(lnAmp);
      const ang = n * phi;
      c0[n] = { re: ampVal * Math.cos(ang), im: ampVal * Math.sin(ang) };
    }
  }

  let norm2 = 0;
  for (let n = 0; n <= nMax; n++) norm2 += c0[n].re * c0[n].re + c0[n].im * c0[n].im;
  if (norm2 > 1e-12) {
    const inv = 1 / Math.sqrt(norm2);
    for (let n = 0; n <= nMax; n++) { c0[n].re *= inv; c0[n].im *= inv; }
  }

  let maxAmp = 0;
  for (let i = 0; i < NG; i++) {
    let env = 0;
    for (let n = 0; n <= nMax; n++) {
      const modC = Math.hypot(c0[n].re, c0[n].im);
      if (modC > 1e-12) env += modC * Math.abs(psi[n][i]);
    }
    if (env > maxAmp) maxAmp = env;
  }
  const amp = Math.max(maxAmp, 1e-6) * 1.15;

  let maxRho = 0;
  for (let i = 0; i < NG; i++) {
    let rhoEnv = 0;
    for (let n = 0; n <= nMax; n++) {
      const modC = Math.hypot(c0[n].re, c0[n].im);
      if (modC > 1e-12) rhoEnv += modC * Math.abs(psi[n][i]);
    }
    if (rhoEnv * rhoEnv > maxRho) maxRho = rhoEnv * rhoEnv;
  }
  const rmax = Math.max(maxRho, 1e-6) * 1.15;

  return { x, psi, c0, nMax, xmax, amp, rmax };
}

let state = buildState();
function rebuild() { state = buildState(); t = 0; }

function computeWave() {
  const { psi, c0, nMax } = state;
  const re = new Float64Array(NG), im = new Float64Array(NG), rho = new Float64Array(NG);
  const cosE = new Float64Array(nMax + 1), sinE = new Float64Array(nMax + 1);
  for (let n = 0; n <= nMax; n++) {
    const ang = -(n + 0.5) * t;
    cosE[n] = Math.cos(ang); sinE[n] = Math.sin(ang);
  }
  for (let n = 0; n <= nMax; n++) {
    const a = c0[n].re, b = c0[n].im;
    if (a === 0 && b === 0) continue;
    const cr = a * cosE[n] - b * sinE[n];
    const ci = a * sinE[n] + b * cosE[n];
    const pn = psi[n];
    for (let i = 0; i < NG; i++) {
      re[i] += cr * pn[i];
      im[i] += ci * pn[i];
    }
  }
  for (let i = 0; i < NG; i++) rho[i] = re[i] * re[i] + im[i] * im[i];
  return { re, im, rho };
}

const waveCv = document.getElementById('waveCanvas');
const densCv = document.getElementById('densCanvas');
const CSS_HEIGHTS = { waveCanvas: 260, densCanvas: 220 };

function resizeCanvases() {
  [waveCv, densCv].forEach(cv => {
    const cssH = CSS_HEIGHTS[cv.id];
    const cssW = Math.max(100, cv.parentElement.clientWidth - 2);
    cv.style.width = cssW + 'px';
    cv.style.height = cssH + 'px';
    cv.width = Math.round(cssW * devicePixelRatio);
    cv.height = Math.round(cssH * devicePixelRatio);
  });
}
window.addEventListener('resize', resizeCanvases);

function drawAxes(ctx, w, h, ymax, ymin) {
  ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border-color').trim() || '#d2d7d9';
  ctx.lineWidth = 1;
  const y0 = h * (ymax / (ymax - ymin));
  ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(w, y0); ctx.stroke();
  const x0 = w / 2;
  ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0, h); ctx.stroke();
}

function plotLine(ctx, arr, x, w, h, xmax, ymax, ymin, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2 * devicePixelRatio;
  ctx.beginPath();
  for (let i = 0; i < arr.length; i++) {
    const px = ((x[i] + xmax) / (2 * xmax)) * w;
    const py = h - ((arr[i] - ymin) / (ymax - ymin)) * h;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();
}

function plotFill(ctx, arr, x, w, h, xmax, ymax, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let i = 0; i < arr.length; i++) {
    const px = ((x[i] + xmax) / (2 * xmax)) * w;
    const py = h - (arr[i] / ymax) * h;
    ctx.lineTo(px, py);
  }
  ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
}

function render() {
  const { x, xmax, amp, rmax } = state;
  const { re, im, rho } = computeWave();

  const wctx = waveCv.getContext('2d');
  const W = waveCv.width, H = waveCv.height;
  wctx.clearRect(0, 0, W, H);
  drawAxes(wctx, W, H, amp, -amp);
  plotLine(wctx, re, x, W, H, xmax, amp, -amp, '#5ec8f8');
  plotLine(wctx, im, x, W, H, xmax, amp, -amp, '#f7b955');

  const dctx = densCv.getContext('2d');
  const W2 = densCv.width, H2 = densCv.height;
  dctx.clearRect(0, 0, W2, H2);
  drawAxes(dctx, W2, H2, rmax, 0);
  plotFill(dctx, rho, x, W2, H2, xmax, rmax, 'rgba(127,224,176,0.35)');
  plotLine(dctx, rho, x, W2, H2, xmax, rmax, 0, '#7fe0b0');

  setMath(
    document.getElementById('timeLabel'),
    't = ' + t.toFixed(2) + '\\;[1/\\omega]'
  );
}

let lastTs = null;
function loop(ts) {
  if (lastTs === null) lastTs = ts;
  const dt = (ts - lastTs) / 1000;
  lastTs = ts;
  if (playing) t += dt * speed;
  render();
  requestAnimationFrame(loop);
}

function showBlock() {
  document.getElementById('blockA').classList.toggle('active', mode === 'a');
  document.getElementById('blockB').classList.toggle('active', mode === 'b');
  document.getElementById('blockC').classList.toggle('active', mode === 'c');
}

document.getElementById('mode').addEventListener('change', e => {
  mode = e.target.value; showBlock(); rebuild();
});

document.getElementById('nA').addEventListener('input', e => {
  nA = +e.target.value;
  setMath(document.getElementById('nAval'), String(nA));
  rebuild();
});

document.getElementById('n1').addEventListener('input', e => {
  n1 = +e.target.value;
  setMath(document.getElementById('n1val'), String(n1));
  rebuild();
});

document.getElementById('n2').addEventListener('input', e => {
  n2 = +e.target.value;
  setMath(document.getElementById('n2val'), String(n2));
  rebuild();
});

document.getElementById('delta').addEventListener('input', e => {
  delta = +e.target.value;
  setMath(document.getElementById('dval'), delta.toFixed(2));
  rebuild();
});

document.getElementById('nbar').addEventListener('input', e => {
  nbar = Math.max(0, +e.target.value || 0);
  rebuild();
});

document.getElementById('phi').addEventListener('input', e => {
  phi = +e.target.value;
  setMath(document.getElementById('phival'), phi.toFixed(2));
  rebuild();
});

document.getElementById('speed').addEventListener('input', e => { speed = +e.target.value; });

document.getElementById('playBtn').addEventListener('click', e => {
  playing = !playing;
  e.target.textContent = playing ? 'Pausar' : 'Reproduzir';
});

document.getElementById('resetBtn').addEventListener('click', () => { t = 0; });

showBlock();
resizeCanvases();

if (window.MathJax && MathJax.startup && MathJax.startup.promise) {
  MathJax.startup.promise.then(() => requestAnimationFrame(loop));
} else {
  window.addEventListener('load', () => requestAnimationFrame(loop));
}