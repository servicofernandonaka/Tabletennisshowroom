/* Dados fornecidos pelo dono do site (lâminas e borrachas): pesos médios, dureza, preço em US$ e métricas editoriais 0-10.
   NÃO verificados de forma independente e mantidos SEPARADOS do catálogo Revspin (js/products.js). Servem de referência cruzada:
   `notesForPack` aponta divergências com os valores usados nos packs; nenhum número do motor é alterado em silêncio.
   Nas lâminas, `id` é o informado e `catalogId` é o item equivalente em products.js (null = fora do catálogo). Vários ids informados
   não batem com o nome (ex.: "xiom-vegas-hx" = Xiom Vega Pro): o NOME é a referência. UMD, sem DOM. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MasterWangUserData = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var META = { fonte: 'Dados do usuário (dono do site)', verificado: false, coletado_em: '2026-10' };
  var AREA_STD = 0.685;   // fator de área padrão do motor (cortado / folha crua)

  // id|catalogId|nome|ESN|Butterfly|DHS|vel|spin|ctrl|peso cru g|peso cortado g|US$   (todas aprovadas ITTF segundo o informado)
  var RUBBER_ROWS = [
    'tenergy-05|butterfly-tenergy-05|Butterfly Tenergy 05|48|36||9.5|9.8|8.5|68|48|79.99',
    'dignics-05|butterfly-dignics-05|Butterfly Dignics 05|50|40||9.8|10|8.8|72|51|99.99',
    'rozena|butterfly-rozena|Butterfly Rozena|45|30||8.6|9.0|9.2|64|45|59.99',
    'rakza-7|yasaka-rakza-7|Yasaka Rakza 7|45|||8.8|9.3|9.0|65|46|52.00',
    'rakza-7-soft|yasaka-rakza-7-soft|Yasaka Rakza 7 Soft|40|||8.4|9.1|9.4|60|42|52.00',
    'hurricane-3-neo|dhs-neo-hurricane-3|DHS Hurricane 3 Neo|52||39|8.5|10|8.5|74|52|35.00',
    'vega-intro||Xiom Vega Intro|47.5|||8.0|8.5|9.6|63|44|32.00',
    'vega-europe|xiom-vega-europe|Xiom Vega Europe|42.5|||8.5|9.0|9.3|62|43|38.00',
    'vega-pro|xiom-vega-pro|Xiom Vega Pro|47.5|||9.0|9.4|8.8|67|47|38.00',
    'evolution-mx-p|tibhar-evolution-mx-p|Tibhar Evolution MX-P|47.5|||9.4|9.6|8.6|69|49|56.00',
    'evolution-el-p|tibhar-evolution-el-p|Tibhar Evolution EL-P|42.4|||9.0|9.3|9.0|66|46|56.00',
    'genius-sound||Genius Sound|38|||8.3|8.9|9.5|58|40|50.00',
    'acuda-s3||Donic Acuda S3|37.5|||8.2|8.8|9.5|59|41|52.00',
    'fastarc-g1|nittaku-fastarc-g-1|Nittaku Fastarc G-1|47.5|||9.3|9.7|8.8|68|48|62.00',
    'rasanter-r47|andro-rasanter-r47|Andro Rasanter R47|47|||9.5|9.6|8.7|65|45|58.00',
    'omega-vii-pro||Xiom Omega VII Pro|47.5|||9.6|9.6|8.6|67|47|54.00',
    'dignics-09c|butterfly-dignics-09c|Butterfly Dignics 09C|44|44||9.4|10|8.9|73|51.5|105.00',
    'spectol-s1|victas-spectol-s1-ex-tsp-spectol|Victas Spectol S1 (pino curto)|40|||9.0|6.5|9.2|52|35|48.00',
    'feint-long-iii|butterfly-feint-long-iii|Butterfly Feint Long III (pino longo)|30|25||5.0|8.0|9.5|45|28|55.00',
    'bluestorm-z1||Donic Bluestorm Z1|47.5|||9.5|9.5|8.7|66|46.5|54.00'];
  var RUBBER_EXTRA = { 'hurricane-3-neo': { throwAngle: 'Low-Medium', dwell: 'Very High' }, 'spectol-s1': { throwAngle: 'Low' } };
  var RUBBER_ID_FIX = { 'bluestorm-z1': 'bluesstorm-z1' };   // o id informado tinha erro de digitação

  // id|catalogId|nome|categoria|camadas|composição|vel|ctrl|flexibilidade|peso g|US$
  var BLADE_ROWS = [
    'butterfly-petr-korbel|butterfly-petr-korbel|Butterfly Petr Korbel|All-Wood / Offensive Classic|5|Limba - Limba - Ayous - Limba - Limba|8.4|8.8|Medium-High|86|79.99',
    'stiga-allround-classic|stiga-allround-classic|Stiga Allround Classic|All-Wood / Allround Legend|5|Select Allround Veneers (Ayous core)|6.5|9.8|High|80|54.99',
    'butterfly-viscaria|butterfly-viscaria|Butterfly Viscaria|Outer Carbon / ALC Pro Standard|7|Koto - Arylate Carbon - Limba - Ayous core - Limba - Arylate Carbon - Koto|9.4|8.6|Medium-Stiff|87|199.99',
    'stiga-cybershape-carbon||Stiga Cybershape Carbon|Outer Carbon / Hexagonal Geometrical|7|CCF (Close Core Fibre) Carbon - Wood veneers|9.6|8.4|Stiff|85|239.99',
    'tibhar-stratus-power-wood|tibhar-stratus-power-wood|Tibhar Stratus Power Wood|All-Wood / European Offensive|5|Limba - Ayous - Ayous core - Ayous - Limba|8.2|9.0|Medium-High|84|52.00',
    'donic-applegren-allplay|donic-appelgren-allplay|Donic Appelgren Allplay|All-Wood / Classic Control|5|Sweden Allround Veneers|6.8|9.7|High|81|49.00',
    'butterfly-innerforce-layer-alc|butterfly-innerforce-layer-alc|Butterfly Innerforce Layer ALC|Inner Carbon / Controlled Power|7|Limba - Arylate Carbon (Inner) - Ayous - Kiri core - Ayous - Arylate Carbon (Inner) - Limba|9.1|9.0|Medium|86|179.99',
    'xiom-offensive-s|xiom-offensive-s|Xiom Offensive S|All-Wood / European Feel Offensive|5|Selected Offensive Wood Veneers|8.3|9.1|Medium|84|58.00',
    'nittaku-acoustic|nittaku-acoustic|Nittaku Acoustic|All-Wood / Violin Instrument Glue Tech|5|Special string-instrument acoustic glued veneers|8.6|9.3|Medium|83|189.99',
    'yasaka-ma-lin-extra-offensive|yasaka-ma-lin-extra-offensive|Yasaka Ma Lin Extra Offensive (YEO)|7-Ply All-Wood / Power Offensive|7|Walnut outer - Medium veneers - Ayous core|8.9|8.7|Stiff|85|75.00',
    'yasaka-sweden-extra|yasaka-sweden-extra|Yasaka Sweden Extra|All-Wood / Classic European Off-|5|Scandinavian Pine & Ayous veneers|7.5|9.5|Medium-High|82|48.00',
    'butterfly-zhang-jike-alc|butterfly-zhang-jike-alc|Butterfly Zhang Jike ALC|Outer Carbon / Crisp ALC|7|Koto - Arylate Carbon - Limba - Kiri core - Limba - Arylate Carbon - Koto|9.5|8.5|Stiff|87|199.99',
    'tibhar-carbon-pro|tibhar-samsonov-force-pro-black-edition|Tibhar Samsonov Force Pro Black Edition|7-Ply Offensive Wood|7|Hard outer plies - Medium inner - Ayous core|9.0|8.5|Stiff|88|72.00',
    'donic-waldner-senso-v1||Donic Waldner Senso V1|All-Wood / Hollow Handle Feedback|5|Swedish Offensive Wood with Senso Hollow Handle|8.4|8.9|Medium-High|82|64.00',
    'andro-treiber-ci||Andro Treiber CI OFF|Inner Carbon / Spin-Oriented|7|Koto outer - Control Carbon (Inner) - Ayous core|9.2|8.8|Medium|86|139.99',
    'xiom-vegas-hx||Xiom Vega Pro (lâmina)|Outer Carbon / High Energy|7|Selected Wood Veneers + High Energy Carbon|9.3|8.5|Stiff|88|115.00',
    'butterfly-primorac|butterfly-primorac|Butterfly Primorac OFF-|All-Wood / Legendary European Touch|5|Klimba - Ayous - Kiri core - Ayous - Klimba|7.8|9.3|Medium|83|69.99',
    'stiga-clipwood||Stiga Clipper Wood|7-Ply Legend / Fast Attack|7|Limba outer - Medium veneers - Ayous core|9.2|8.3|Stiff|90|89.99',
    'dhs-hurricane-long-5|dhs-hurricane-long-5|DHS Hurricane Long 5|Inner Arylate Carbon / National Team Choice|7|Limba outer - Arylate Carbon (Inner) - Ayous - Kiri core - Ayous - Arylate Carbon (Inner) - Limba|9.5|8.7|Medium-Stiff|88|175.00',
    'nittaku-fastarc-sriver||Nittaku Septear|Multi-Ply Hinoki Wood|7|7 Plies of Japanese Hinoki Cypress Wood|8.5|9.1|Medium-High|85|135.00',
    'butterfly-ma-long-alc||Butterfly Harimoto Tomokazu ALC|Inner Carbon / Extended Sweet Spot|7|Limba - Arylate Carbon (Inner) - Ayous - Kiri core - Ayous - Arylate Carbon (Inner) - Limba|9.3|8.8|Medium|87|199.99',
    'tibhar-stratus-carbon||Tibhar Stratus Carbon|Outer Carbon / Lightweight|7|Wood veneers with embedded Carbon layers|9.0|8.6|Stiff|82|78.00',
    'donic-persson-powerplay||Donic Persson Powerplay|All-Wood / Swedish Offensive Power|7|7 selected Swedish wood veneers|8.9|8.6|Stiff|86|62.00',
    'andro-wanqi-zlc||Andro Treiber ZCO|Outer Zylon-Carbon / Explosive Speed|7|Koto - Zylon Carbon - Kiri core|9.7|8.2|Stiff|88|169.99',
    'xiom-vegas-hx-pro||Xiom Hayabusa ZXI|Internal Zylon Carbon / Feel & Power|7|Hinoki outer - Zylon Carbon (Inner) - Kiri core|9.4|8.7|Medium-Stiff|86|149.99',
    'butterfly-maze-magic||Butterfly Michael Maze|Outer Arylate-Carbon / Classic Touch|7|Limba - Arylate Carbon - Limba - Ayous core|9.1|8.9|Medium|85|159.99',
    'stiga-offering-classic|stiga-offensive-classic|Stiga Offensive Classic|All-Wood / Swedish Offensive Heritage|5|Selected Swedish Offensive Veneers|8.1|9.0|Medium-High|82|65.00',
    'dhs-wind-series-w3||DHS Power G7|7-Ply Wood / Chinese Attack|7|7-ply pure wood construction optimized for loop|8.7|8.8|Medium-Stiff|87|42.00',
    'joola-rosskopf-emotion||Joola Rosskopf Emotion|Hinoki-Carbon / Touch & Speed|7|Hinoki outer - Carbon - Ayous core|9.0|8.8|Medium|85|99.99',
    'victas-koji-matsushita||Victas Koji Matsushita|Defensive Wood / Modern Defender|5|5-ply defensive oversized head construction|6.2|9.9|High|85|115.00'];
  // ids informados que não correspondem ao nome do item (o nome vale)
  var BLADE_ID_MISMATCH = ['donic-applegren-allplay', 'tibhar-carbon-pro', 'xiom-vegas-hx', 'stiga-clipwood', 'nittaku-fastarc-sriver', 'butterfly-ma-long-alc',
    'andro-wanqi-zlc', 'xiom-vegas-hx-pro', 'butterfly-maze-magic', 'stiga-offering-classic', 'dhs-wind-series-w3'];

  var num = function (s) { return s === '' || s == null ? null : +s; };
  var rubbers = RUBBER_ROWS.map(function (row) {
    var c = row.split('|'), id = c[0], x = RUBBER_EXTRA[id] || {};
    return { id: id, idOriginal: RUBBER_ID_FIX[id] || id, catalogId: c[1] || null, name: c[2], esn: num(c[3]), butterfly: num(c[4]), dhs: num(c[5]),
      speed: +c[6], spin: +c[7], control: +c[8], throwAngle: x.throwAngle || null, dwell: x.dwell || null,
      uncutG: +c[9], cutG: +c[10], usd: +c[11], ittf: true, origem: 'usuario' };
  });
  var blades = BLADE_ROWS.map(function (row) {
    var c = row.split('|');
    return { id: c[0], catalogId: c[1] || null, name: c[2], category: c[3], plies: +c[4], composition: c[5], speed: +c[6], control: +c[7],
      flexibility: c[8], weightG: +c[9], usd: +c[10], ittf: true, idMismatch: BLADE_ID_MISMATCH.indexOf(c[0]) >= 0, origem: 'usuario' };
  });

  function byCatalogId(list, id) { for (var i = 0; i < list.length; i++) if (id && list[i].catalogId === id) return list[i]; return null; }
  var findRubber = function (catalogId) { return byCatalogId(rubbers, catalogId); };
  var findBlade = function (catalogId) { return byCatalogId(blades, catalogId); };
  var f1 = function (x) { return String(Math.round(x * 10) / 10).replace('.', ','); };

  /** Divergências (≥ 2 g de peso, ≥ 2,5 de ESN) entre os valores usados num pack e os dados do usuário. Só texto: não altera o motor. */
  function notesForPack(pack) {
    var out = [], tag = 'Dados do usuário: ';
    var b = pack.blade && findBlade(pack.blade.catalogId);
    if (b && Math.abs(b.weightG - pack.blade.weight) >= 2)
      out.push(tag + pack.blade.nome + ' pesa ' + f1(b.weightG) + ' g nos dados do usuário e ' + f1(pack.blade.weight) + ' g neste pack (pese a sua).');
    var seen = {};
    var rs = [pack.fh, pack.bh].concat((pack.bhOptions || []).map(function (o) { return o.bh; }));
    rs.forEach(function (r) {
      if (!r || seen[r.id]) return; seen[r.id] = 1;
      var u = r.catalogId ? findRubber(r.catalogId) : rubbers.filter(function (x) { return x.id === r.id.replace(/^(xiom|donic|yasaka|butterfly)-/, ''); })[0];
      if (!u || r.tipo === 'short-pips') return;
      var cut = Math.round(r.rawSheetWeight * AREA_STD);
      if (Math.abs(u.cutG - cut) >= 2)
        out.push(tag + r.nome + ' tem ' + f1(u.cutG) + ' g cortada (' + f1(u.uncutG) + ' g crua) nos dados do usuário; o motor usa ' + cut + ' g' + (r.rawEstimado ? ' (estimativa padrão)' : '') + '.');
      if (u.esn != null && r.hardnessESN != null && Math.abs(u.esn - r.hardnessESN) >= 2.5)
        out.push(tag + r.nome + ' tem ' + f1(u.esn) + '° ESN nos dados do usuário e ' + f1(r.hardnessESN) + '° neste pack.');
    });
    return out;
  }
  return { META: META, AREA_STD: AREA_STD, rubbers: rubbers, blades: blades, findRubber: findRubber, findBlade: findBlade, notesForPack: notesForPack, BLADE_ID_MISMATCH: BLADE_ID_MISMATCH };
});
