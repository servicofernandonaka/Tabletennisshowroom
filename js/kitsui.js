/* Vitrine "Kits Prontos de Fábrica" (#kits-prontos). Dados e regras em js/kits.js. */
(function () {
  var KT = window.MasterWangKits, grid = document.getElementById('kitsGrid');
  if (!KT || !grid) return;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  document.getElementById('kitsPros').innerHTML = KT.BENEFITS.map(function (b) { return '<li><span aria-hidden="true">' + b[0] + '</span> <b>' + esc(b[1]) + '</b><br><small>' + esc(b[2]) + '</small></li>'; }).join('');
  grid.innerHTML = KT.KITS.map(function (k) {
    var href = KT.buyUrl(window.MW_CONFIG, k, KT.buyText(k));
    return '<article class="card kit" data-kit="' + k.id + '"><p class="kit-brand">' + esc(k.brand) + '</p><h3>' + esc(k.nome) + '</h3><span class="mw-seal">' + esc(k.badge) + '</span>' +
      '<p class="kit-for">Para: <b>' + esc(k.perfil) + '</b></p><p>' + esc(k.destaque) + '</p>' +
      '<table><tr><th>Lâmina</th><td>' + esc(k.lamina) + '</td></tr><tr><th>Borracha</th><td>' + esc(k.borracha) + '</td></tr><tr><th>Cabo</th><td>' + esc(k.cabo) + '</td></tr>' +
      '<tr><th>Peso</th><td>' + (k.peso ? '≈ ' + k.peso + ' g <span class="note">(' + esc(k.pesoNota) + ')</span>' : 'confira a ficha do vendedor') + '</td></tr></table>' +
      '<ul class="kit-chips"><li>✅ Pronta para uso imediato</li><li>🧴 Sem custo de colagem</li></ul>' +
      '<p class="note">' + (k.refPreco ? 'Preço de referência: ' + esc(k.refPreco) + '.' : 'Preço: confira o valor atual na loja.') + '</p>' +
      '<a class="btn-cyan kit-buy" target="_blank" rel="noopener noreferrer" data-kit-buy="' + k.id + '" href="' + esc(href) + '">🛒 Quero este kit</a>' +
      '<details class="verif"><summary>Fontes e ressalvas</summary><ul>' + k.ressalvas.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') +
      '<li>Fontes: ' + k.fontes.map(function (f) { return '<a href="' + esc(f.u) + '" target="_blank" rel="noopener noreferrer">' + esc(f.t) + '</a>'; }).join(' · ') + '</li></ul></details></article>';
  }).join('');
  document.getElementById('kitsNote').textContent = 'Dados de fabricante e lojas, não verificados de forma independente. ' + KT.META.homologacao;
  grid.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('[data-kit-buy]'); if (a) document.dispatchEvent(new CustomEvent('mw:cta', { detail: { kit: a.getAttribute('data-kit-buy'), via: 'vitrine' } })); });
})();
