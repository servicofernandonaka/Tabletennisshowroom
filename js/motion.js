/* Animações de interface: revelação ao rolar (IntersectionObserver) e transição de modo. Sem bibliotecas.
   Sem IntersectionObserver ou com "reduzir movimento", não faz nada (o conteúdo aparece direto). */
(function () {
  var root = document.documentElement, doc = document;
  var sysReduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var KEY = 'mw-motion', pref = null;
  try { pref = localStorage.getItem(KEY); } catch (e) { /* sem armazenamento */ }
  // O sistema pede menos movimento: respeitamos por padrão, mas o usuário pode ligar as animações no botão do topo.
  var reduce = sysReduce && pref !== 'on';
  if (sysReduce) addToggle(pref === 'on');
  if (reduce || !('IntersectionObserver' in window)) return;
  if (sysReduce) root.setAttribute('data-motion', 'on');
  root.classList.add('mw-anim');

  function addToggle(on) {
    var host = doc.querySelector('.sound'); if (!host) return;
    var b = doc.createElement('button'); b.type = 'button'; b.id = 'motionBtn'; b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.textContent = '✨ Animações: ' + (on ? 'on' : 'off'); b.title = 'Seu sistema pede menos movimento. Clique para ligar ou desligar as animações do site.';
    b.addEventListener('click', function () { try { localStorage.setItem(KEY, on ? 'off' : 'on'); } catch (e) { /* ignora */ } location.reload(); });
    host.appendChild(b);
  }

  // Alvos da revelação. Cards aninhados dentro de outro alvo não são animados separadamente.
  var SEL = 'main .card, .pillar, .stats li, .viz-fig, .lf-pick, .of-head, #glossList > *, #guideList > *, section > h2';
  var seen = typeof WeakSet === 'function' ? new WeakSet() : { has: function () { return false; }, add: function () {} };
  var io = new IntersectionObserver(function (entries) {
    var vis = entries.filter(function (e) { return e.isIntersecting; }).sort(function (a, b) {
      return a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left; });
    vis.forEach(function (e, i) {
      var el = e.target; io.unobserve(el);
      el.style.setProperty('--d', Math.min(i * 80, 400) + 'ms');
      el.classList.add('in');
      setTimeout(function () { el.classList.remove('mw-rv', 'in'); el.classList.add('mw-done'); el.style.removeProperty('--d'); }, 1300);   // libera o hover/transform normais
    });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });   // threshold 0: cards muito altos não esperam 12% da própria altura para aparecer

  function scan(scope) {
    var list = (scope.matches && scope.matches(SEL) ? [scope] : []).concat([].slice.call(scope.querySelectorAll ? scope.querySelectorAll(SEL) : []));
    list.forEach(function (el) {
      if (seen.has(el) || el.closest('.mw-rv') && el.closest('.mw-rv') !== el || el.parentElement && el.parentElement.closest('.card')) return;
      seen.add(el); el.classList.add('mw-rv'); io.observe(el);
    });
  }
  scan(doc);

  // conteúdo gerado depois (vitrine, wizard, catálogo, oficina): observa só nós novos
  var queued = false, pending = [];
  new MutationObserver(function (muts) {
    muts.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1) pending.push(n); }); });
    if (queued || !pending.length) return; queued = true;
    requestAnimationFrame(function () { queued = false; var p = pending; pending = []; p.forEach(function (n) { if (n.isConnected) scan(n); }); });
  }).observe(doc.querySelector('main') || doc.body, { childList: true, subtree: true });

  // transição ao trocar de modo: fade + subida de 10px nas seções que acabaram de aparecer
  var mode = doc.body.getAttribute('data-mode');
  new MutationObserver(function () {
    var now = doc.body.getAttribute('data-mode'); if (now === mode) return; mode = now;
    [].forEach.call(doc.querySelectorAll('section[data-mode="' + now + '"]'), function (s) {
      s.classList.remove('mw-swap'); void s.offsetWidth; s.classList.add('mw-swap');
      setTimeout(function () { s.classList.remove('mw-swap'); }, 350);
    });
  }).observe(doc.body, { attributes: true, attributeFilter: ['data-mode'] });

  /* ---------- Efeitos extras ---------- */
  // fundo vivo: duas luzes que derivam devagar + bola de pingue-pongue quicando no hero
  var bg = doc.createElement('div'); bg.className = 'mw-aurora'; bg.setAttribute('aria-hidden', 'true'); bg.innerHTML = '<i></i><i></i><i></i>'; doc.body.insertBefore(bg, doc.body.firstChild);
  var hero = doc.getElementById('topo');
  if (hero) { var ball = doc.createElement('span'); ball.className = 'mw-ball'; ball.setAttribute('aria-hidden', 'true'); ball.innerHTML = '<b><i></i></b>'; hero.insertBefore(ball, hero.firstChild); }

  // barra de progresso de rolagem
  var bar = doc.createElement('div'); bar.className = 'mw-progress'; bar.setAttribute('aria-hidden', 'true'); doc.body.appendChild(bar);
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; var h = doc.documentElement.scrollHeight - innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')'; });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // números do hero contam até o valor
  var stats = doc.getElementById('heroStats');
  function countUp() {
    [].forEach.call(stats.querySelectorAll('b'), function (b) {
      var end = parseInt(b.textContent, 10); if (!isFinite(end) || b.dataset.cu) return; b.dataset.cu = '1';
      var t0 = performance.now(), dur = 1100;
      (function step(t) { var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); b.textContent = Math.round(end * e); if (k < 1) requestAnimationFrame(step); })(t0);
    });
  }
  if (stats) new MutationObserver(function () { countUp(); }).observe(stats, { childList: true });
  if (stats && stats.children.length) countUp();

  // inclinação 3D leve + foco de luz que segue o mouse (só mouse/caneta)
  if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var TILT = '.pack-grid .card, .geo-cards .card, .lf-pick, .pillar, .viz-fig', cur = null, raf = 0, ev = null;
    doc.addEventListener('pointermove', function (e) {
      var c = e.target.closest && e.target.closest(TILT), o;
      while (c && c.parentElement && (o = c.parentElement.closest(TILT))) c = o;   // alvo mais externo: evita alternar com figuras dentro do card
      if (cur && cur !== c) reset(cur);
      cur = c; if (!c) return; ev = e;
      if (!raf) raf = requestAnimationFrame(function () {
        raf = 0; if (!cur) return; var r = cur.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
        cur.style.setProperty('--ry', ((x - 0.5) * 6).toFixed(2) + 'deg'); cur.style.setProperty('--rx', ((0.5 - y) * 5).toFixed(2) + 'deg');
        cur.style.setProperty('--mx', (ev.clientX - r.left) + 'px'); cur.style.setProperty('--my', (ev.clientY - r.top) + 'px');
      });
    }, { passive: true });
    doc.addEventListener('pointerout', function (e) { if (!e.relatedTarget && cur) { reset(cur); cur = null; } });   // mouse saiu da janela
    function reset(el) { ['--rx', '--ry', '--mx', '--my'].forEach(function (k) { el.style.removeProperty(k); }); }
  }
})();
