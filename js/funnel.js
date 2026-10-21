/* Funil de caminho único. Estágios (html[data-stage]):
     landing  só o hero com um botão          quiz     só o diagnóstico, uma pergunta por vez
     result   laudo salvo no topo + site liberado   explore  site completo (só com ?full=1, para QA)
   `initialStage` é puro (testável no Node); o resto é DOM. A mesma regra roda inline no <head> para não piscar o site inteiro. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(null);
  else root.MasterWangFunnel = factory(root);
})(typeof self !== 'undefined' ? self : this, function (win) {
  function initialStage(o) {
    var h = o.hash || '';
    if (/[?&]full=1(&|$)/.test(o.search || '')) return 'explore';   // modo completo (QA)
    if (o.hasDiagnosis) return 'result';                           // laudo salvo: mostra o laudo
    return h === '#wizard' ? 'quiz' : 'landing';                   // visitante novo: caminho único
  }
  var api = { initialStage: initialStage };
  if (!win) return api;

  var doc = win.document, de = doc.documentElement;
  var $ = function (s) { return doc.querySelector(s); };
  var stage = function () { return de.getAttribute('data-stage'); };
  function setStage(s) { de.setAttribute('data-stage', s); }
  function sound(n) { if (win.GRSound && win.GRSound.play) win.GRSound.play(n); }

  function labelCta() {
    var b = $('#startBtn'); if (!b) return;
    b.textContent = stage() === 'explore' ? '🎮 Refazer o Test Drive da Raquete' : '🎮 Iniciar Test Drive da Raquete Ideal';
  }
  function start(e) {
    if (e) e.preventDefault();
    var guided = $('[data-set-mode="guided"]'), body = doc.body;
    if (guided && body.getAttribute('data-mode') !== 'guided') guided.click();   // o diagnóstico mora no modo guiado
    sound('hit');
    var hero = $('#topo'); if (hero) hero.classList.add('hero-out');
    setTimeout(function () {
      if (hero) hero.classList.remove('hero-out');
      setStage('quiz'); win.scrollTo(0, 0);
      var q = $('#wizQ'); if (q) { q.tabIndex = -1; q.focus({ preventScroll: true }); }
    }, 300);
  }
  function banner() {
    var old = $('.unlock-banner'); if (old) old.remove();
    var b = doc.createElement('div'); b.className = 'unlock-banner'; b.setAttribute('role', 'status');
    b.innerHTML = '<span>🔓 <b>Laudo desbloqueado!</b><span class="ub-more"> Pro Lab, Oficina e Comparador liberados.</span></span><button type="button" class="btn-ghost">Explorar ↓</button>';
    b.querySelector('button').addEventListener('click', function () {
      b.remove(); de.classList.add('explored');   // no celular, menu e modos só aparecem aqui para não empurrar o pack recomendado
      var m = $('.modebar'); if (m) setTimeout(function () { m.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
    });
    doc.body.appendChild(b); setTimeout(function () { if (b.isConnected) b.classList.add('out'); setTimeout(function () { b.remove(); }, 500); }, 7000);
  }
  doc.addEventListener('mw:result', function () {
    if (stage() === 'result') return;   // laudo restaurado ou re-renderizado (troca de cabo/variante): sem celebração
    setStage('result'); win.scrollTo(0, 0);
    de.classList.add('just-unlocked'); setTimeout(function () { de.classList.remove('just-unlocked'); }, 3000);
    banner(); sound('ok');
  });
  doc.addEventListener('mw:redo', function () { de.classList.remove('explored'); setStage('quiz'); });
  // altura real do cabeçalho fixo: usada no scroll-padding das âncoras, na barra de comparação e no aviso de desbloqueio
  var hdr = $('header.top');
  if (hdr) {
    var setH = function () { de.style.setProperty('--hh', hdr.offsetHeight + 'px'); };
    setH(); if (win.ResizeObserver) new win.ResizeObserver(setH).observe(hdr); else win.addEventListener('resize', setH);
  }
  var btn = $('#startBtn'); if (btn) btn.addEventListener('click', start);
  labelCta();
  return api;
});
