/*==========================================================================
Criado em 24/09/2026
Atualizado em 06/10/2026
Autor: Jimi
Coautor: Gemini
Código: animation.js - Simulação e Visualização Gráfica de Pacotes de Onda Quânticos
Projeto: Q-Science
==========================================================================*/

(function() {
  'use strict';

  /* --------------------------------------------------------------------------
   1. AUXILIARES MATEMÁTICOS E RENDERIZAÇÃO LATEX
   -------------------------------------------------------------------------- */
  function typesetEl(el) {
    if (!el || !window.MathJax || !window.MathJax.typesetPromise) return;
    window.MathJax.typesetPromise([el]).catch(function(err) {
      console.warn('MathJax:', err);
    });
  }

  function setMath(span, latex) {
    if (!span) return;
    span.innerHTML = '\\(\\displaystyle ' + latex + '\\)';
    typesetEl(span);
  }

  function eigenstatesOnGrid(x, nMax) {
    var N = x.length;
    var psi = new Array(nMax + 1);
    for (var n = 0; n <= nMax; n++) {
      psi[n] = new Float64Array(N);
    }
    var c0 = Math.pow(Math.PI, -0.25);
    for (var i = 0; i < N; i++) {
      psi[0][i] = c0 * Math.exp(-0.5 * x[i] * x[i]);
    }
    if (nMax >= 1) {
      for (var i = 0; i < N; i++) {
        psi[1][i] = Math.SQRT2 * x[i] * psi[0][i];
      }
    }
    for (var n = 2; n <= nMax; n++) {
      var a = Math.sqrt(2 / n);
      var b = Math.sqrt((n - 1) / n);
      for (var i = 0; i < N; i++) {
        psi[n][i] = a * x[i] * psi[n - 1][i] - b * psi[n - 2][i];
      }
    }
    return psi;
  }

  function lnFactorialTable(nMax) {
    var t = new Float64Array(nMax + 1);
    for (var n = 1; n <= nMax; n++) {
      t[n] = t[n - 1] + Math.log(n);
    }
    return t;
  }

  /* --------------------------------------------------------------------------
   2. ESTADO DA SIMULAÇÃO E CONSTRUÇÃO DO PACOTE DE ONDA
   -------------------------------------------------------------------------- */
  var mode = 'a';
  var nA = 0, n1 = 0, n2 = 1, nbar = 9, delta = 0, phi = 0;
  var t = 0, playing = true, speed = 1;
  var NG = 420;

  function xmaxFor(nEff) {
    return Math.min(40, Math.max(5, Math.sqrt(2 * nEff + 1) + 4));
  }

  function buildState() {
    var nMax, xmax;
    if (mode === 'a') {
      nMax = nA;
      xmax = xmaxFor(nA);
    } else if (mode === 'b') {
      nMax = Math.max(n1, n2);
      xmax = xmaxFor(nMax);
    } else {
      nMax = Math.min(220, Math.ceil(nbar + 8 * Math.sqrt(nbar + 1) + 10));
      xmax = xmaxFor(nMax);
    }

    var x = new Float64Array(NG);
    for (var i = 0; i < NG; i++) {
      x[i] = -xmax + (2 * xmax * i) / (NG - 1);
    }
    var psi = eigenstatesOnGrid(x, nMax);

    var c0 = new Array(nMax + 1).fill(0).map(function() {
      return { re: 0, im: 0 };
    });

    if (mode === 'a') {
      c0[nA] = { re: 1, im: 0 };
    } else if (mode === 'b') {
      var a = 1 / Math.SQRT2;
      c0[n1].re += a;
      c0[n2].re += a * Math.cos(delta);
      c0[n2].im += a * Math.sin(delta);
    } else {
      var lambda = Math.sqrt(nbar);
      var lnF = lnFactorialTable(nMax);
      for (var n = 0; n <= nMax; n++) {
        var lnAmp;
        if (lambda === 0) {
          lnAmp = (n === 0) ? 0 : -Infinity;
        } else {
          lnAmp = n * Math.log(lambda) - 0.5 * lnF[n] - 0.5 * lambda * lambda;
        }
        var ampVal = Math.exp(lnAmp);
        var ang = n * phi;
        c0[n] = { re: ampVal * Math.cos(ang), im: ampVal * Math.sin(ang) };
      }
    }

    var norm2 = 0;
    for (var n = 0; n <= nMax; n++) {
      norm2 += c0[n].re * c0[n].re + c0[n].im * c0[n].im;
    }
    if (norm2 > 1e-12) {
      var inv = 1 / Math.sqrt(norm2);
      for (var n = 0; n <= nMax; n++) {
        c0[n].re *= inv;
        c0[n].im *= inv;
      }
    }

    var maxAmp = 0;
    for (var i = 0; i < NG; i++) {
      var env = 0;
      for (var n = 0; n <= nMax; n++) {
        var modC = Math.hypot(c0[n].re, c0[n].im);
        if (modC > 1e-12) env += modC * Math.abs(psi[n][i]);
      }
      if (env > maxAmp) maxAmp = env;
    }
    var amp = Math.max(maxAmp, 1e-6) * 1.15;

    var maxRho = 0;
    for (var i = 0; i < NG; i++) {
      var rhoEnv = 0;
      for (var n = 0; n <= nMax; n++) {
        var modC = Math.hypot(c0[n].re, c0[n].im);
        if (modC > 1e-12) rhoEnv += modC * Math.abs(psi[n][i]);
      }
      if (rhoEnv * rhoEnv > maxRho) maxRho = rhoEnv * rhoEnv;
    }
    var rmax = Math.max(maxRho, 1e-6) * 1.15;

    return { x: x, psi: psi, c0: c0, nMax: nMax, xmax: xmax, amp: amp, rmax: rmax };
  }

  var state = buildState();

  function rebuild() {
    state = buildState();
    t = 0;
  }

  function computeWave() {
    var psi = state.psi,
        c0 = state.c0,
        nMax = state.nMax;

    var re = new Float64Array(NG),
        im = new Float64Array(NG),
        rho = new Float64Array(NG);

    var cosE = new Float64Array(nMax + 1),
        sinE = new Float64Array(nMax + 1);

    for (var n = 0; n <= nMax; n++) {
      var ang = -(n + 0.5) * t;
      cosE[n] = Math.cos(ang);
      sinE[n] = Math.sin(ang);
    }

    for (var n = 0; n <= nMax; n++) {
      var a = c0[n].re,
          b = c0[n].im;
      if (a === 0 && b === 0) continue;
      var cr = a * cosE[n] - b * sinE[n];
      var ci = a * sinE[n] + b * cosE[n];
      var pn = psi[n];
      for (var i = 0; i < NG; i++) {
        re[i] += cr * pn[i];
        im[i] += ci * pn[i];
      }
    }

    for (var i = 0; i < NG; i++) {
      rho[i] = re[i] * re[i] + im[i] * im[i];
    }

    return { re: re, im: im, rho: rho };
  }

  /* --------------------------------------------------------------------------
   3. GESTÃO DOS TELAS (CANVAS) E RENDERIZAÇÃO 2D
   -------------------------------------------------------------------------- */
  var waveCv = document.getElementById('waveCanvas');
  var densCv = document.getElementById('densCanvas');

  // Se os elementos canvas não existirem na página atual, interrompe a execução
  if (!waveCv || !densCv) {
    return;
  }

  var CSS_HEIGHTS = { waveCanvas: 260, densCanvas: 220 };

  function resizeCanvases() {
    [waveCv, densCv].forEach(function(cv) {
      var cssH = CSS_HEIGHTS[cv.id];
      var cssW = Math.max(100, cv.parentElement.clientWidth - 2);
      cv.style.width = cssW + 'px';
      cv.style.height = cssH + 'px';
      cv.width = Math.round(cssW * window.devicePixelRatio);
      cv.height = Math.round(cssH * window.devicePixelRatio);
    });
  }
  window.addEventListener('resize', resizeCanvases);

  function drawAxes(ctx, w, h, ymax, ymin) {
    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border-color').trim() || '#d2d7d9';
    ctx.lineWidth = 1;
    var y0 = h * (ymax / (ymax - ymin));
    ctx.beginPath();
    ctx.moveTo(0, y0);
    ctx.lineTo(w, y0);
    ctx.stroke();

    var x0 = w / 2;
    ctx.beginPath();
    ctx.moveTo(x0, 0);
    ctx.lineTo(x0, h);
    ctx.stroke();
  }

  function plotLine(ctx, arr, x, w, h, xmax, ymax, ymin, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 * window.devicePixelRatio;
    ctx.beginPath();
    for (var i = 0; i < arr.length; i++) {
      var px = ((x[i] + xmax) / (2 * xmax)) * w;
      var py = h - ((arr[i] - ymin) / (ymax - ymin)) * h;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  function plotFill(ctx, arr, x, w, h, xmax, ymax, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (var i = 0; i < arr.length; i++) {
      var px = ((x[i] + xmax) / (2 * xmax)) * w;
      var py = h - (arr[i] / ymax) * h;
      ctx.lineTo(px, py);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }

  function render() {
    var x = state.x,
        xmax = state.xmax,
        amp = state.amp,
        rmax = state.rmax;

    var wave = computeWave();

    var wctx = waveCv.getContext('2d');
    var W = waveCv.width, H = waveCv.height;
    wctx.clearRect(0, 0, W, H);
    drawAxes(wctx, W, H, amp, -amp);
    plotLine(wctx, wave.re, x, W, H, xmax, amp, -amp, '#5ec8f8');
    plotLine(wctx, wave.im, x, W, H, xmax, amp, -amp, '#f7b955');

    var dctx = densCv.getContext('2d');
    var W2 = densCv.width, H2 = densCv.height;
    dctx.clearRect(0, 0, W2, H2);
    drawAxes(dctx, W2, H2, rmax, 0);
    plotFill(dctx, wave.rho, x, W2, H2, xmax, rmax, 'rgba(127,224,176,0.35)');
    plotLine(dctx, wave.rho, x, W2, H2, xmax, rmax, 0, '#7fe0b0');

    setMath(
      document.getElementById('timeLabel'),
      't = ' + t.toFixed(2) + '\\;[1/\\omega]'
    );
  }

  var lastTs = null;
  function loop(ts) {
    if (lastTs === null) lastTs = ts;
    var dt = (ts - lastTs) / 1000;
    lastTs = ts;
    if (playing) t += dt * speed;
    render();
    requestAnimationFrame(loop);
  }

  /* --------------------------------------------------------------------------
   4. EVENTOS DE CONTROLOS INTERATIVOS
   -------------------------------------------------------------------------- */
  function showBlock() {
    var bA = document.getElementById('blockA');
    var bB = document.getElementById('blockB');
    var bC = document.getElementById('blockC');
    if (bA) bA.classList.toggle('active', mode === 'a');
    if (bB) bB.classList.toggle('active', mode === 'b');
    if (bC) bC.classList.toggle('active', mode === 'c');
  }

  var modeEl = document.getElementById('mode');
  if (modeEl) {
    modeEl.addEventListener('change', function(e) {
      mode = e.target.value;
      showBlock();
      rebuild();
    });
  }

  var nAEl = document.getElementById('nA');
  if (nAEl) {
    nAEl.addEventListener('input', function(e) {
      nA = +e.target.value;
      setMath(document.getElementById('nAval'), String(nA));
      rebuild();
    });
  }

  var n1El = document.getElementById('n1');
  if (n1El) {
    n1El.addEventListener('input', function(e) {
      n1 = +e.target.value;
      setMath(document.getElementById('n1val'), String(n1));
      rebuild();
    });
  }

  var n2El = document.getElementById('n2');
  if (n2El) {
    n2El.addEventListener('input', function(e) {
      n2 = +e.target.value;
      setMath(document.getElementById('n2val'), String(n2));
      rebuild();
    });
  }

  var deltaEl = document.getElementById('delta');
  if (deltaEl) {
    deltaEl.addEventListener('input', function(e) {
      delta = +e.target.value;
      setMath(document.getElementById('dval'), delta.toFixed(2));
      rebuild();
    });
  }

  var nbarEl = document.getElementById('nbar');
  if (nbarEl) {
    nbarEl.addEventListener('input', function(e) {
      nbar = Math.max(0, +e.target.value || 0);
      rebuild();
    });
  }

  var phiEl = document.getElementById('phi');
  if (phiEl) {
    phiEl.addEventListener('input', function(e) {
      phi = +e.target.value;
      setMath(document.getElementById('phival'), phi.toFixed(2));
      rebuild();
    });
  }

  var speedEl = document.getElementById('speed');
  if (speedEl) {
    speedEl.addEventListener('input', function(e) {
      speed = +e.target.value;
    });
  }

  var playBtnEl = document.getElementById('playBtn');
  if (playBtnEl) {
    playBtnEl.addEventListener('click', function(e) {
      playing = !playing;
      e.target.textContent = playing ? 'Pausar' : 'Reproduzir';
    });
  }

  var resetBtnEl = document.getElementById('resetBtn');
  if (resetBtnEl) {
    resetBtnEl.addEventListener('click', function() {
      t = 0;
    });
  }

  /* --------------------------------------------------------------------------
   5. INICIALIZAÇÃO
   -------------------------------------------------------------------------- */
  showBlock();
  resizeCanvases();

  if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
    window.MathJax.startup.promise.then(function() {
      requestAnimationFrame(loop);
    });
  } else {
    window.addEventListener('load', function() {
      requestAnimationFrame(loop);
    });
  }

})();