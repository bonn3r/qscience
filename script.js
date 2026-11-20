/* =====================================================================
   Harmônicos esféricos e densidades radiais — Willian Bonner Melo
   FISI 711 — Teoria Quântica I · Lista 4, Problema 10

   Auto-contido: carrega o MathJax 3 dinamicamente e usa uma fila para
   garantir que qualquer fórmula inserida via innerHTML seja renderizada
   mesmo antes de o MathJax estar pronto.
   ===================================================================== */

/* -------------------- MathJax: carregamento + fila -------------------- */
(function initMathJax(){
  window.__mathQueue = [];
  window.__mathReady = false;

  window.MathJax = {
    tex: {
      inlineMath:  {'[+]': [['$', '$']]},
      displayMath: {'[+]': [['$$', '$$']]}
    },
    options: {
      skipHtmlTags: ['script','noscript','style','textarea','pre']
    },
    startup: {
      ready: () => {
        MathJax.startup.defaultReady();
        window.__mathReady = true;
        const q = window.__mathQueue.slice();
        window.__mathQueue.length = 0;
        q.forEach(el => {
          if (el && el.isConnected) {
            MathJax.typesetPromise([el]).catch(e => console.error('MathJax:', e));
          }
        });
      }
    }
  };

  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
  s.async = true;
  s.onerror = () => console.error('Falha ao carregar o MathJax.');
  document.head.appendChild(s);

  setTimeout(() => {
    if (!window.__mathReady)
      console.warn('MathJax não carregou; fórmulas LaTeX não serão renderizadas.');
  }, 10000);
})();

function renderMath(el){
  if (!el) return;
  if (window.__mathReady && window.MathJax && MathJax.typesetPromise){
    return MathJax.typesetPromise([el]).catch(e => console.error('MathJax:', e));
  }
  window.__mathQueue.push(el);
}

/* ======================= 1. MATEMÁTICA (sem DOM) ======================= */
const PI = Math.PI;
const fact = n => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };

function Plm(l, m, x){
  const s = Math.sqrt(Math.max(0, 1 - x*x));
  let pmm = 1, f = 1;
  for (let i = 1; i <= m; i++){ pmm *= f * s; f += 2; }
  if (l === m) return pmm;
  let p1 = x * (2*m + 1) * pmm;
  if (l === m + 1) return p1;
  let pl = 0;
  for (let ll = m + 2; ll <= l; ll++){
    pl = (x * (2*ll - 1) * p1 - (ll + m - 1) * pmm) / (ll - m);
    pmm = p1; p1 = pl;
  }
  return pl;
}

function Ytable(l, m, T){
  m = Math.abs(m);
  const nf = Math.sqrt((2*l + 1)/(4*PI) * fact(l - m)/fact(l + m));
  const sg = new Float64Array(T), ab = new Float64Array(T);
  let mx = 0;
  for (let i = 0; i < T; i++){
    sg[i] = nf * Plm(l, m, Math.cos(PI * i / (T - 1)));
    ab[i] = Math.abs(sg[i]);
    mx = Math.max(mx, ab[i]);
  }
  return { sg, ab, mx };
}

function Yzeros(sg){
  const z = [], T = sg.length;
  for (let i = 0; i < T - 1; i++)
    if (sg[i] * sg[i+1] < 0){
      const f = sg[i] / (sg[i] - sg[i+1]);
      z.push((i + f) * 180 / (T - 1));
    }
  return z;
}

function jl(l, x){
  if (x < 1e-9) return l === 0 ? 1 : 0;
  if (x < 0.8){
    let df = 1;
    for (let k = 1; k <= l; k++) df *= 2*k + 1;
    return Math.pow(x, l) / df *
      (1 - x*x/(2*(2*l + 3)) + Math.pow(x, 4)/(8*(2*l + 3)*(2*l + 5)));
  }
  const s = Math.sin(x), c = Math.cos(x);
  let j0 = s / x;
  if (l === 0) return j0;
  let j1 = s/(x*x) - c/x;
  for (let k = 1; k < l; k++){
    const j2 = (2*k + 1)/x * j1 - j0;
    j0 = j1; j1 = j2;
  }
  return j1;
}

const ZEROS = [];
for (let l = 0; l <= 4; l++){
  const z = [];
  let x = l === 0 ? 0.1 : l + 0.5, f0 = jl(l, x);
  while (z.length < 5 && x < 40){
    const x1 = x + 0.01, f1 = jl(l, x1);
    if (f0 * f1 < 0){
      let a = x, b = x1;
      for (let k = 0; k < 60; k++){
        const m = (a + b)/2;
        if (jl(l, a) * jl(l, m) <= 0) b = m; else a = m;
      }
      z.push((a + b)/2);
    }
    x = x1; f0 = f1;
  }
  ZEROS.push(z);
}

function lag(k, al, x){
  if (k === 0) return 1;
  let a = 1, b = 1 + al - x;
  for (let i = 1; i < k; i++){
    const c = ((2*i + 1 + al - x) * b - (i + al) * a) / (i + 1);
    a = b; b = c;
  }
  return b;
}

function normalize(xs, P){
  const N = xs.length, h = (xs[N-1] - xs[0]) / (N - 1);
  let s = P[0] + P[N-1];
  for (let i = 1; i < N - 1; i++) s += (i % 2 ? 4 : 2) * P[i];
  s *= h/3;
  for (let i = 0; i < N; i++) P[i] /= s;
}

const NG = 1201;

function wellData(n, l){
  const z = ZEROS[l], x = z[n-1];
  const xs = new Float64Array(NG), P = new Float64Array(NG);
  for (let i = 0; i < NG; i++){
    const r = i / (NG - 1), R = jl(l, x * r);
    xs[i] = r; P[i] = r*r * R*R;
  }
  normalize(xs, P);
  return { xs, P, nodes: z.slice(0, n-1).map(v => v/x),
           xlabel: 'r / a', x2: x*x, x, col: '#5ec8f8' };
}

function hydData(n, l){
  const rmax = 2.2*n*n + 8;
  const xs = new Float64Array(NG), P = new Float64Array(NG), R = new Float64Array(NG);
  for (let i = 0; i < NG; i++){
    const r = rmax * i / (NG - 1), rho = 2*r/n;
    R[i] = Math.exp(-rho/2) * Math.pow(rho, l) * lag(n - l - 1, 2*l + 1, rho);
    xs[i] = r; P[i] = r*r * R[i]*R[i];
  }
  normalize(xs, P);
  const nodes = [];
  for (let i = 2; i < NG; i++)
    if (R[i-1] * R[i] < 0){
      const f = R[i-1] / (R[i-1] - R[i]);
      nodes.push(xs[i-1] + f * (xs[i] - xs[i-1]));
    }
  return { xs, P, nodes, xlabel: 'r / a₀', col: '#f7b955' };
}

/* =========================== 2. INTERFACE =========================== */
const $ = id => document.getElementById(id);

/* Preenche um <select> com inteiros de min até max; desabilita se houver opção única */
function fillSelect(sel, min, max, val, singleMsg = null){
  const clamped = Math.max(min, Math.min(max, val));
  sel.innerHTML = '';

  if (min === max && singleMsg){
    const opt = document.createElement('option');
    opt.value = clamped;
    opt.textContent = singleMsg;
    opt.selected = true;
    sel.appendChild(opt);
    sel.disabled = true;
    return clamped;
  }

  sel.disabled = false;
  for (let v = min; v <= max; v++){
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    if (v === clamped) opt.selected = true;
    sel.appendChild(opt);
  }
  return clamped;
}

/* ---------- (a) esfera colorida ---------- */
const MAG = [[0,0,4],[28,16,68],[79,18,123],[129,37,129],[181,54,122],[229,80,100],[251,135,97],[254,194,135],[252,253,191]];
function magma(t){
  t = Math.min(1, Math.max(0, t)) * 8;
  const i = Math.min(7, Math.floor(t)), f = t - i;
  return MAG[i].map((c, k) => c + (MAG[i+1][k] - c) * f);
}
const LUT = Array.from({ length: 256 }, (_, i) => magma(i/255).map(Math.round));
$('cbgrad').style.background = 'linear-gradient(90deg,' +
  MAG.map(c => `rgb(${c})`).join(',') + ')';

const mul = (A, B) => A.map(r => [0,1,2].map(j =>
  r[0]*B[0][j] + r[1]*B[1][j] + r[2]*B[2][j]));
const rotX = b => [[1,0,0],[0,Math.cos(b),-Math.sin(b)],[0,Math.sin(b),Math.cos(b)]];
const rotY = a => [[Math.cos(a),0,Math.sin(a)],[0,1,0],[-Math.sin(a),0,Math.cos(a)]];
const rotZ = p => [[Math.cos(p),-Math.sin(p),0],[Math.sin(p),Math.cos(p),0],[0,0,1]];

let Rm, L = +$('lA').value || 0, M = 1, Y = null;
const resetView = () => { Rm = mul(rotX(-65*PI/180), rotZ(-30*PI/180)); };
resetView();

const sph = $('sph'), sc = sph.getContext('2d'), S = 352;
const off = document.createElement('canvas');
off.width = off.height = S;
const oc = off.getContext('2d'), img = oc.createImageData(S, S);

function axes(front){
  const cx = 220, cy = 220, len = 206;
  const cols = ['#ff6b6b', '#6bd36b', '#6b9bff'];
  const names = ['x', 'y', 'z'];
  for (let i = 0; i < 3; i++){
    const a = [Rm[0][i], Rm[1][i], Rm[2][i]];
    if ((a[2] >= 0) !== front) continue;
    sc.globalAlpha = front ? 1 : .35;
    sc.strokeStyle = sc.fillStyle = cols[i];
    sc.lineWidth = 2;
    sc.beginPath(); sc.moveTo(cx, cy);
    sc.lineTo(cx + len*a[0], cy - len*a[1]); sc.stroke();
    sc.font = 'bold 14px Georgia'; sc.textAlign = 'center';
    sc.fillText(names[i], cx + (len + 10)*a[0], cy - (len + 10)*a[1] + 5);
  }
  sc.globalAlpha = 1;
}

function drawSphere(){
  const d = img.data, T = Y.ab.length;
  for (let j = 0; j < S; j++){
    const v = 1 - 2*(j + .5)/S;
    for (let i = 0; i < S; i++){
      const u = 2*(i + .5)/S - 1, r2 = u*u + v*v, p = 4*(j*S + i);
      if (r2 > 1){ d[p+3] = 0; continue; }
      const w = Math.sqrt(1 - r2);
      const bz = Rm[0][2]*u + Rm[1][2]*v + Rm[2][2]*w;
      const k = Math.round(Math.acos(Math.max(-1, Math.min(1, bz)))/PI * (T - 1));
      const c = LUT[Math.round(Y.ab[k]/Y.mx * 255)];
      d[p] = c[0]; d[p+1] = c[1]; d[p+2] = c[2]; d[p+3] = 255;
    }
  }
  oc.putImageData(img, 0, 0);
  sc.clearRect(0, 0, 440, 440);
  axes(false); sc.drawImage(off, 55, 55, 330, 330); axes(true);
}

let pend = false;
const redraw = () => {
  if (!pend){
    pend = true;
    requestAnimationFrame(() => { pend = false; drawSphere(); });
  }
};

function updateA(){
  Y = Ytable(L, M, 2048);
  $('cb1').textContent = Y.mx.toFixed(3);
  const z = Yzeros(Y.sg), am = Math.abs(M);

  $('infoA').innerHTML =
    `<div>Numericamente, o valor máximo $\\big|\\mathrm{Y}_{${L}}^{${M}}(\\theta,\\phi)\\big|$ = <b>${Y.mx.toFixed(3)}</b>. Eles são representados pelas faixas mais claras.</div>` +
    `<div><br></div>` +
    `<div>Os mínimos de $\\big|\\mathrm{Y}_{${L}}^{${M}}(\\theta,\\phi)\\big|$ estão nas faixas mais escuras.</div>` +
    `<div><br></div>` +
    `<div>$\\big|\\mathrm{Y}_{\\ell}^{m}(\\theta,\\phi)\\big|$ possui simetria axial, ou seja, só depende de $\\theta$.</div>` +
    `<div><br></div>` +
    `<div>Para os zeros em $0<\\theta<\\pi$, temos $\\ell-|m| = ${L - am}$${
      z.length
        ? ', $\\Rightarrow \\theta = ' + z.map(v => v.toFixed(1) + '^\\circ').join(',\\, ') + '$'
        : ''
    }.</div>` +
    `<div><br></div>` +
    `<div>Polos ($\\theta=0,\\pi$): ${
      am > 0
        ? '<b>são zeros</b> (fator $\\mathrm{sen}^{|m|}\\theta$)'
        : '<b>não</b> são zeros ($m=0$)'
    }.</div>` +
    `<div><br></div>` +
    `<div>Equador ($\\theta=\\pi/2$): ${
      (L - am) % 2 === 1
        ? '<b>é zero</b> ($\\ell-|m|$ ímpar)'
        : '<b>não</b> é zero ($\\ell-|m|$ par)'
    }.</div>` +
    `<div><br></div>` +
    `<div>${
      am === 0
        ? 'Não há planos nodais meridionais ($m = 0$; $\\mathrm{Y}_{\\ell}^{0}$ é real e independe de $\\phi$).'
        : `${am === 1 ? 'O' : 'Os'} $|m| = ${am}$ ${am === 1 ? 'plano nodal meridional' : 'planos nodais meridionais'} ($${2 * am}$ meridianos em $\\phi$) só ${am === 1 ? 'aparece' : 'aparecem'} em $\\mathrm{Re}\\,\\mathrm{Y}$ e $\\mathrm{Im}\\,\\mathrm{Y}$, não em $|\\mathrm{Y}|$.`
    }</div>`;

  renderMath($('infoA'));
  redraw();
}

function syncMSelect(){
  M = fillSelect(
    $('mA'),
    -L,
    L,
    M,
    'Não há opções disponíveis.'
  );
}

$('lA').onchange = e => {
  L = +e.target.value;
  if ($('lAv')) $('lAv').textContent = L;
  syncMSelect();
  if ($('mAv')) $('mAv').textContent = M;
  updateA();
};

$('mA').onchange = e => {
  M = +e.target.value;
  if ($('mAv')) $('mAv').textContent = M;
  updateA();
};

$('resetView').onclick = () => { resetView(); redraw(); };

let drag = false, lx = 0, ly = 0;
sph.onpointerdown = e => {
  drag = true; lx = e.clientX; ly = e.clientY;
  sph.setPointerCapture(e.pointerId);
};
sph.onpointerup = sph.onpointercancel = () => { drag = false; };
sph.onpointermove = e => {
  if (!drag) return;
  Rm = mul(rotX((e.clientY - ly) * 0.01), mul(rotY((e.clientX - lx) * 0.01), Rm));
  lx = e.clientX; ly = e.clientY; redraw();
};

/* ---------- (b) densidades radiais ---------- */
let cmpActive = false;

function niceStep(max){
  const raw = max / 5;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / mag;
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * mag;
}

function plot(cv, d){
  const dpr = window.devicePixelRatio || 1;
  const W = cv.clientWidth, H = cv.clientHeight;
  if (!W || !H) return;
  cv.width = W * dpr; cv.height = H * dpr;
  const c = cv.getContext('2d');
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, W, H);

  if (d.msg){
    c.fillStyle = '#8ea0b3'; c.font = '14px Georgia'; c.textAlign = 'center';
    c.fillText(d.msg, W/2, H/2);
    return;
  }

  const Lm = 54, Rr = 14, Tp = 14, Bt = 38, pw = W - Lm - Rr, ph = H - Tp - Bt;
  const xmax = d.xs[d.xs.length - 1];
  let ymax = 0;
  for (const v of d.P) ymax = Math.max(ymax, v);
  ymax *= 1.12;

  const X = x => Lm + x/xmax * pw, Yp = y => Tp + ph - y/ymax * ph;
  c.font = '11px Menlo,Consolas,monospace'; c.lineWidth = 1;

  const sy = niceStep(ymax), dy = Math.max(0, -Math.floor(Math.log10(sy)));
  c.textAlign = 'right';
  for (let y = 0; y <= ymax; y += sy){
    c.strokeStyle = '#1c2733';
    c.beginPath(); c.moveTo(Lm, Yp(y)); c.lineTo(Lm + pw, Yp(y)); c.stroke();
    c.fillStyle = '#8ea0b3'; c.fillText(y.toFixed(dy), Lm - 6, Yp(y) + 4);
  }
  const sx = niceStep(xmax), dx = Math.max(0, -Math.floor(Math.log10(sx)));
  c.textAlign = 'center';
  for (let x = 0; x <= xmax + 1e-9; x += sx){
    c.strokeStyle = '#1c2733';
    c.beginPath(); c.moveTo(X(x), Tp); c.lineTo(X(x), Tp + ph); c.stroke();
    c.fillStyle = '#8ea0b3'; c.fillText(x.toFixed(dx), X(x), Tp + ph + 15);
  }
  c.fillStyle = '#8ea0b3'; c.font = '12px Georgia';
  c.fillText(d.xlabel, Lm + pw/2, H - 6);

  c.setLineDash([4, 4]); c.strokeStyle = '#ff7a90';
  for (const nd of d.nodes){
    c.beginPath(); c.moveTo(X(nd), Tp); c.lineTo(X(nd), Tp + ph); c.stroke();
  }
  c.setLineDash([]); c.fillStyle = '#ff7a90';
  for (const nd of d.nodes){
    c.beginPath(); c.arc(X(nd), Yp(0), 3.5, 0, 2*PI); c.fill();
  }

  c.beginPath(); c.moveTo(X(d.xs[0]), Yp(0));
  for (let i = 0; i < d.xs.length; i++) c.lineTo(X(d.xs[i]), Yp(d.P[i]));
  c.lineTo(X(xmax), Yp(0));
  c.globalAlpha = .22; c.fillStyle = d.col; c.fill(); c.globalAlpha = 1;
  c.beginPath();
  for (let i = 0; i < d.xs.length; i++){
    const px = X(d.xs[i]), py = Yp(d.P[i]);
    i ? c.lineTo(px, py) : c.moveTo(px, py);
  }
  c.strokeStyle = d.col; c.lineWidth = 2; c.stroke();
}

function infoB(d, sys, n, l){
  const mx = [];
  for (let i = 1; i < d.P.length - 1; i++)
    if (d.P[i] > d.P[i-1] && d.P[i] >= d.P[i+1]) mx.push([d.xs[i], d.P[i]]);
  const sp = [];
  for (let i = 1; i < d.nodes.length; i++) sp.push(d.nodes[i] - d.nodes[i-1]);

  const E = sys === 'well'
    ? `$E = \\dfrac{x_{nl}^2\\hbar^2}{2ma^2} = ${d.x2.toFixed(3)}\\,\\dfrac{\\hbar^2}{2ma^2}$ ` +
      `&nbsp;( $x_{nl} = ${d.x.toFixed(4)}$; $= ${(d.x2/PI/PI).toFixed(3)}\\,E_{1,0}$ )`
    : `$E_n = -\\dfrac{13{,}606\\,\\text{eV}}{n^2}\\approx ${(-13.6057/(n*n)).toFixed(3)}\\,\\text{eV}$ `;

  return `<div>${E}</div>` +
    `<div>Nós radiais: <b>${d.nodes.length}</b> ${
      sys === 'well' ? '( $n-1$ )' : '( $n-\\ell-1$ )'
    }${
      d.nodes.length ? ' em ' + d.nodes.map(v => v.toFixed(3)).join(', ') : ''
    }</div>` +
    `<div>Máximos (posição, altura): ${
      mx.map(m => `(${m[0].toFixed(2)}, ${m[1].toFixed(3)})`).join(', ')
    }</div>` +
    (sp.length
      ? `<div>Espaçamento entre nós: ${sp.map(v => v.toFixed(3)).join(', ')}</div>`
      : '');
}

function tableHTML(sys, n, l){
  const title = sys === 'well'
    ? 'Poço: $E_{nl}$ em unidades de $\\hbar^2/(2ma^2)$'
    : 'Hidrogênio: $E_n$ (eV)';

  let h = `<div><div class="ptitle">${title}</div><table><tr><th>n \\ l</th>`;
  for (let k = 0; k <= 4; k++) h += `<th>${k}</th>`;
  h += '</tr>';
  for (let i = 1; i <= 5; i++){
    h += `<tr><th>${i}</th>`;
    for (let k = 0; k <= 4; k++){
      const sel = (i === n && k === l) ? ' class="sel"' : '';
      h += sys === 'well'
        ? `<td${sel}>${(ZEROS[k][i-1]**2).toFixed(2)}</td>`
        : `<td${sel}>${k < i ? (-13.6057/(i*i)).toFixed(2) : '—'}</td>`;
    }
    h += '</tr>';
  }
  return h + '</table></div>';
}

const NAMES = { well: 'Poço esférico infinito', hyd: 'Átomo de hidrogênio' };

function panel(idx, sys, n, l){
  let d;
  if (sys === 'hyd' && l > n - 1){
    d = { msg: `Não existe: hidrogênio exige l ≤ n - 1 (aqui n = ${n}, l = ${l})`, nodes: [] };
  } else {
    d = sys === 'well' ? wellData(n, l) : hydData(n, l);
  }

  $('t' + idx).innerHTML =
    `${NAMES[sys]} — $n = ${n}$, $\\ell = ${l}$ &nbsp;·&nbsp; ` +
    `$P\\,${sys === 'well' ? 'a' : 'a_0'}$ normalizada ($\\int P\\,dr = 1$)`;
  $('i' + idx).innerHTML = d.msg ? '' : infoB(d, sys, n, l);
  plot($('c' + idx), d);

  renderMath($('t' + idx));
  renderMath($('i' + idx));
}

function updateB(){
  const sys = $('sys').value;
  const n = +$('nB').value;
  const maxL = sys === 'hyd' ? n - 1 : 4;
  const l = fillSelect(
    $('lB'),
    0,
    maxL,
    +$('lB').value || 0,
    'Não há opções disponíveis.'
  );

  if ($('nBv')) $('nBv').textContent = n;
  if ($('lBv')) $('lBv').textContent = l;

  const other = sys === 'well' ? 'hyd' : 'well';
  $('p2').style.display = cmpActive ? 'block' : 'none';
  $('panels').classList.toggle('two', cmpActive);

  panel(1, sys, n, l);
  if (cmpActive) panel(2, other, n, l);

  $('tables').innerHTML = tableHTML('well', n, l) + tableHTML('hyd', n, l);
  renderMath($('tables'));
}

$('cmpBtn').onclick = () => {
  cmpActive = !cmpActive;
  $('cmpBtn').classList.toggle('active', cmpActive);
  $('cmpBtn').setAttribute('aria-pressed', String(cmpActive));
  updateB();
};

['sys', 'nB', 'lB'].forEach(id => $(id).onchange = updateB);

window.addEventListener('resize', () => {
  if ($('itemB').classList.contains('active')) updateB();
});

/* ---------- seleção de exercício (abas) ---------- */
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;

    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    $(targetId).classList.add('active');

    // Redesenha os gráficos do item (b) ao exibi-lo
    if (targetId === 'itemB') updateB();
  });
});

/* Remove o foco de qualquer <select> logo após escolher uma opção */
document.querySelectorAll('select').forEach(sel => {
  sel.addEventListener('change', () => sel.blur());
});

/* ---------- inicialização ---------- */
syncMSelect();
updateA();
updateB();