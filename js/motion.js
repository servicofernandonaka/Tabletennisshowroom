/* Animações de interface: revelação ao rolar (IntersectionObserver) e transição de modo. Sem bibliotecas.
   Sem IntersectionObserver ou com "reduzir movimento", não faz nada (o conteúdo aparece direto). */
(function () {
  var root = document.documentElement, doc = document;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  root.classList.add('mw-anim');

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
      setTimeout(function () { el.classList.remove('mw-rv', 'in'); el.style.removeProperty('--d'); }, 1300);   // libera o hover/transform normais
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

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
})();
