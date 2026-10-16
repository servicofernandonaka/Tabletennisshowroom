/* Tradutor do Mestre Wang: troca jargão por explicação cotidiana (badge + tooltip) em toda a página, sem recarregar.
   Funciona sobre conteúdo dinâmico via MutationObserver. UMD: GLOSSARY e buildPattern são testáveis no Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(null);
  else root.MasterWangTranslator = factory(root);
})(typeof self !== 'undefined' ? self : this, function (win) {
  // termo → [rótulo curto (badge), explicação (tooltip)]
  var GLOSSARY = {
    'Dwell Time': ['tempo de abraço da bola', 'Quanto tempo a bola fica "grudada" na borracha no impacto. Mais tempo = mais controle para direcionar o golpe.'],
    'Throw Angle': ['altura da janela sobre a rede', 'O ângulo com que a bola sai da raquete. Arco alto passa com folga sobre a rede; arco baixo sai mais reto e rápido.'],
    'Sweet Spot': ['zona que perdoa erros', 'A área da raquete onde a bola sai melhor mesmo se você não acertar o centro exato.'],
    'ALC': ['fibra de carbono entre as madeiras', 'Arylate-Carbon: fibra colocada entre camadas de madeira para dar mais velocidade e firmeza à lâmina.'],
    'ZLC': ['fibra Zylon-Carbon', 'Zylon-Carbon: fibra leve e rígida entre camadas de madeira, com resposta rápida e direta.'],
    'ESN': ['escala alemã de dureza da esponja', 'Medida da dureza da esponja. Quanto maior o número, mais dura a esponja. Escalas de marcas diferentes (Butterfly, DHS) não são convertíveis com exatidão.'],
    'bottom-out': ['esponja afunda até a madeira', 'Em batida forte, a esponja macia comprime por inteiro e a bola "sente" a madeira dura: perde arco e controle de repente.'],
    'Balance point': ['onde está o peso', 'Ponto de equilíbrio da raquete: peso mais na cabeça (potência) ou mais no cabo (rapidez).'],
    'Head-Heavy': ['peso na ponta', 'Mais peso na cabeça da raquete: ajuda a dar potência no topspin, mas cansa mais o braço.'],
    'Head-Light': ['peso no cabo', 'Mais peso perto da mão: a raquete gira rápido e poupa as articulações.'],
    'Tacky': ['borracha pegajosa', 'Superfície aderente que "agarra" a bola e gera muito efeito.'],
    'Tensor': ['esponja com tensão', 'Esponja tratada para dar efeito catapulta: bola mais rápida e com mais rotação.'],
    'OFF+': ['lâmina ultra-rápida', 'Categoria de lâmina muito veloz e rígida, com pouca margem de erro.'],
    'RPB': ['bater de backhand com o verso', 'Reverse Penhold Backhand: no estilo caneta, usar o verso da raquete para atacar de backhand.'],
    'LARC': ['lista de borrachas aprovadas', 'List of Authorised Racket Coverings: borrachas aprovadas pela ITTF para jogos oficiais.'],
    'Topspin': ['bola com rotação para frente', 'Golpe que gira a bola para frente, fazendo-a mergulhar na mesa depois de passar a rede.'],
    'Topsheet': ['camada de borracha da superfície', 'A camada de borracha que fica por cima da esponja, em contato direto com a bola.'],
    'VOC': ['vapores de solventes nocivos', 'Compostos orgânicos voláteis: vapores de solventes presentes em colas tradicionais. As colas à base d\'água não os têm.'],
    'Edge Tape': ['fita de proteção da borda', 'Fita que protege a lateral da lâmina contra batidas e trincas.']
  };

  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  /** Regex de todos os termos, mais longos primeiro; sem casar dentro de palavras. */
  // Siglas só casam em MAIÚSCULAS ("VOC" não pode casar dentro de "você").
  var ACRONYMS = ['ALC', 'ZLC', 'ESN', 'VOC', 'RPB', 'LARC', 'OFF+'];
  /** Regex de todos os termos, mais longos primeiro; limites de palavra com suporte a Unicode (letras acentuadas bloqueiam). */
  function buildPattern(terms) {
    var list = (terms || Object.keys(GLOSSARY)).slice().sort(function (a, b) { return b.length - a.length; });
    return new RegExp('(?<![\\p{L}\\p{N}-])(' + list.map(esc).join('|') + ')(?![\\p{L}\\p{N}-])', 'giu');
  }
  function keyOf(term) {
    for (var k in GLOSSARY) if (k.toLowerCase() === term.toLowerCase()) return k;
    return null;
  }
  function lookup(term) { var k = keyOf(term); return k ? GLOSSARY[k] : null; }
  /** Termos do glossário presentes no texto: [{index, text, key}] (já aplicada a regra de siglas em maiúsculas). */
  function findTerms(text) {
    var re = buildPattern(), out = [], m;
    while ((m = re.exec(text))) {
      var key = keyOf(m[1]); if (!key) continue;
      if (ACRONYMS.indexOf(key) >= 0 && m[1] !== key) continue;
      out.push({ index: m.index, text: m[1], key: key });
    }
    return out;
  }
  var api = { GLOSSARY: GLOSSARY, ACRONYMS: ACRONYMS, buildPattern: buildPattern, lookup: lookup, findTerms: findTerms };
  if (!win) return api;

  var doc = win.document, enabled = false, observer = null, scope = null, queued = false;
  var SKIP = 'script,style,select,option,textarea,input,button,svg,.tw,[data-no-tw],summary,h1,h2,h3';

  function decorateNode(textNode) {
    var parent = textNode.parentElement;
    if (!parent || parent.closest(SKIP)) return;
    var text = textNode.nodeValue, hits = findTerms(text);
    if (!hits.length) return;
    var compact = !!parent.closest('table'), frag = doc.createDocumentFragment(), last = 0;
    hits.forEach(function (h) {
      var g = GLOSSARY[h.key];
      if (h.index > last) frag.appendChild(doc.createTextNode(text.slice(last, h.index)));
      var span = doc.createElement('span');
      span.className = 'tw' + (compact ? ' tw-compact' : ''); span.tabIndex = 0; span.setAttribute('data-tip', g[1]);
      var t = doc.createElement('span'); t.className = 'tw-t'; t.textContent = h.text; span.appendChild(t);
      if (!compact) { span.appendChild(doc.createTextNode(' ')); var b = doc.createElement('span'); b.className = 'tw-b'; b.textContent = g[0]; span.appendChild(b); }
      frag.appendChild(span); last = h.index + h.text.length;
    });
    if (last < text.length) frag.appendChild(doc.createTextNode(text.slice(last)));
    parent.replaceChild(frag, textNode);
  }
  function decorate(rootEl) {
    var walker = doc.createTreeWalker(rootEl, 4, null), nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(decorateNode);
  }
  function run(fn) { if (observer) observer.disconnect(); try { fn(); } finally { if (enabled && observer && scope) observer.observe(scope, { childList: true, subtree: true }); } }
  function undecorate() {
    var els = doc.querySelectorAll('.tw'), parents = [];
    [].forEach.call(els, function (el) { var p = el.parentNode; el.replaceWith(doc.createTextNode(el.querySelector('.tw-t').textContent)); if (parents.indexOf(p) < 0) parents.push(p); });
    parents.forEach(function (p) { p.normalize(); });
  }
  var tip = null, activeEl = null;
  function showTip(el) {
    activeEl = el;
    if (!tip) { tip = doc.createElement('div'); tip.id = 'twTip'; tip.setAttribute('role', 'tooltip'); doc.body.appendChild(tip); }
    tip.textContent = el.getAttribute('data-tip'); tip.style.display = 'block';
    var r = el.getBoundingClientRect(), vw = doc.documentElement.clientWidth, tw = tip.offsetWidth, th = tip.offsetHeight;
    var left = Math.max(8, Math.min(r.left + r.width / 2 - tw / 2, vw - tw - 8));
    var top = r.top - th - 8; if (top < 8) top = r.bottom + 8;
    tip.style.left = left + 'px'; tip.style.top = top + 'px'; el.setAttribute('aria-describedby', 'twTip');
  }
  function hideTip(el) { activeEl = null; if (tip) tip.style.display = 'none'; if (el && el.removeAttribute) el.removeAttribute('aria-describedby'); }
  api.init = function (el) {
    scope = el;
    var tgt = function (e) { return e.target && e.target.closest ? e.target.closest('.tw') : null; };
    ['mouseover', 'focusin'].forEach(function (t) { el.addEventListener(t, function (e) { var x = tgt(e); if (x) showTip(x); }); });
    ['mouseout', 'focusout'].forEach(function (t) { el.addEventListener(t, function (e) { var x = tgt(e); if (x) hideTip(x); }); });
    el.addEventListener('click', function (e) { var x = tgt(e); if (x) showTip(x); });
    win.addEventListener('scroll', function () { if (activeEl && activeEl.isConnected) showTip(activeEl); else hideTip(); }, { passive: true });
    win.addEventListener('keydown', function (e) { if (e.key === 'Escape') hideTip(); });
    observer = new win.MutationObserver(function () {
      if (!enabled || queued) return; queued = true;
      win.requestAnimationFrame(function () { queued = false; if (enabled) run(function () { decorate(scope); }); });
    });
  };
  api.setEnabled = function (on) {
    on = !!on; if (on === enabled) return enabled; enabled = on;
    if (on) run(function () { decorate(scope); }); else { if (observer) observer.disconnect(); undecorate(); doc.body.removeAttribute('data-tw'); }
    if (on) doc.body.setAttribute('data-tw', 'on');
    return enabled;
  };
  api.isEnabled = function () { return enabled; };
  return api;
});
