/* Catálogo de produtos reais, transcrito do "Guia Mestre Wang" (pesquisa do dono do site, coleta até out/2026).
   Notas 0-10 já normalizadas (ver rating.js) a partir de médias do Revspin.net. NÃO verificado de forma independente.
   Specs oficiais ficam em `spec` (texto, com a escala do fabricante); nunca entram no radar.
   "-" = sem dados. Conferir LARC vigente antes de publicar (lista 2026 vale até 31/12/2026). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./rating.js'));
  else root.GRProducts = factory(root.GRRating);
})(typeof self !== 'undefined' ? self : this, function (R) {
  var META = { fonte: 'Revspin.net (médias de usuários) via Guia Mestre Wang', coletado_em: '2026-10', verificado: false };
  var CATS = { w5: 'All-wood 5 camadas', w7: 'All-wood 7 camadas/híbrida', co: 'Carbono externo', ci: 'Carbono interno', def: 'Defensiva (DEF)' };
  var RCATS = { t: 'Tensor', k: 'Tacky/híbrida', c: 'Controle/entrada' };

  // cat|marca|modelo|vel|ctrl|rig|dur|cons|n|usd|spec|status
  var BLADES = [
    'w5|Tibhar|Stratus Power Wood|7.3|7.7|4.9|5.4|7.0|146|40|OFF (verificar)',
    'w5|Butterfly|Petr Korbel|5.8|6.0|4.8|5.3|6.7|120|70|OFF− (verificar)',
    'w5|Nittaku|Acoustic|6.5|7.7|4.3|4.9|8.3|97|165|',
    'w5|DHS|Hurricane 301|7.8|8.0|4.2|5.4|7.0|93|80|',
    'w5|Butterfly|Primorac|4.0|6.0|4.4|4.9|4.7|89|110|',
    'w5|Yasaka|Sweden Extra|4.5|7.0|3.5|4.8|7.7|67|43|ALL/ALL+; 5 madeiras, 85 g, 5,7 mm (Megaspin)',
    'w5|Stiga|Allround Classic|1.5|6.0|3.1|4.4|5.3|68|62|ALL',
    'w5|Victas|Koki Niwa Wood|7.5|9.0|4.4|4.8|9.3|46|140|',
    'w5|Xiom|Offensive S|6.0|7.0|4.6|5.5|8.3|47|48|',
    'w5|Yasaka|Gatien Extra|4.0|6.3|3.7|4.6|7.3|42|38|',
    'w5|Donic|Appelgren Allplay|2.3|5.7|3.7|4.2|4.7|51|28|ALL',
    'w5|OSP|Virtuoso OFF−|5.3|7.7|3.5|4.3|7.7|44|112|OFF−',
    'w5|Nittaku|Violin|5.8|6.7|3.2|5.0|8.3|50|165|',
    'w7|DHS|Power-G PG7|7.3|6.3|5.7|6.4|5.0|155|40|',
    'w7|Yasaka|Ma Lin Extra Offensive|6.5|5.3|5.7|6.8|5.7|89|40|',
    'w7|Stiga|Clipper|6.5|5.0|5.9|5.7|1.3|55|70|',
    'w7|Stiga|Rosewood NCT V|7.3|6.3|5.8|6.7|10|50|115|',
    'w7|Sanwei|Fextra 7|5.8|7.3|4.5|5.2|2.3|51|34|',
    'w7|Yasaka|Goiabao 5|8.3|7.3|6.2|7.3|9.0|47|45|',
    'w7|Stiga|Offensive Classic|4.0|4.7|3.7|5.4|2.7|46|48|OFF−',
    'w7|Stiga|Hybrid Wood NCT|8.8|6.7|7.7|7.7|5.7|66|108|madeira+fibra (verificar)',
    'co|Butterfly|Viscaria|7.5|6.0|5.2|5.7|7.3|178|185|OFF; 5 madeiras + 2 ALC; ~86–87 g; 5,7–5,8 mm; 157×150 mm; reação 11,8 / vibração 10,3; FL/ST e CS (penholder)',
    'co|Butterfly|Timo Boll ALC|7.5|5.7|5.8|6.2|7.7|158|185|verificar (mesma construção da Viscaria segundo TableTennisDaily)',
    'co|Butterfly|Timo Boll Spirit|6.5|5.3|5.5|6.1|8.0|124|135|',
    'co|Butterfly|Primorac Carbon|8.3|2.0|7.3|7.9|8.0|72|116|carbono TAMCA 5000; BR R$ 1.087 (JJYamada)',
    'co|Butterfly|Timo Boll ZLC|8.3|7.0|5.3|6.2|7.7|50|215|',
    'co|Butterfly|Zhang Jike ALC|7.5|7.7|5.3|5.2|9.0|58|214|',
    'co|Butterfly|Amultart ZL Carbon|8.8|5.7|6.8|7.5|8.0|61|500|',
    'co|Butterfly|Sardius|8.8|0.7|8.3|8.7|4.3|61|146|',
    'co|Butterfly|Boll TriCarbon|9.3|0.7|8.3|9.0|3.3|42|115|',
    'co|Xiom|Stradivarius|7.3|5.3|6.6|7.1|6.0|65|105|',
    'co|Xiom|Zetro Quad|7.5|6.3|5.9|4.9|8.7|78|140|',
    'co|Stiga|Infinity VPS V|6.5|6.3|5.4|6.3|6.7|88|70|',
    'co|Donic|Waldner Senso Carbon|5.8|6.0|5.3|5.5|5.3|87|50|',
    'co|Donic|Ovtcharov Carbospeed|9.0|4.7|7.6|7.9|8.0|47|75|',
    'co|Tibhar|Samsonov Force Pro Black Edition|7.8|7.0|5.0|5.2|6.7|52|52|',
    'co|Andro|Treiber Z|8.5|7.3|5.9|6.2|6.7|65|125|',
    'co|Yinhe|T-11+|8.3|6.0|7.2|7.2|6.3|77|18|',
    'co|Yinhe|N-9|7.8|7.0|6.5|7.2|6.0|68|15|',
    'co|Yinhe|Venus V-14 Pro|7.8|7.0|6.1|6.7|8.0|68|73|',
    'co|Friendship/729|Bomb|6.3|5.0|5.1|5.9|6.0|43|40|',
    'co|Butterfly|Fan Zhendong Super ALC|9.0|3.7|8.0|8.5|0|20|249|consistência 0 (possível limite da escala)',
    'co|Butterfly|Zhang Jike Super ZLC|8.5|7.7|6.2|6.8|7.3|49|350|',
    'co|Butterfly|Mizutani Jun Super ZLC|8.8|6.7|6.3|6.4|9.3|40|340|',
    'co|Joola|Energon Super PBO-c|8.0|7.7|5.6|5.6|10|43|190|',
    'ci|DHS|Hurricane Long 5|8.8|7.7|5.1|6.1|7.0|86||"Offensive Max" (OFF+); 5 madeiras + 2 ALC interno; 89 g ±3 (penholder 87 g ±3); 5,9 mm ±0,1 (DHS Sports USA); preço US$ 190–250',
    'ci|DHS|Hurricane Long 3|7.3|8.7|3.6|4.2|9.0|63|250|',
    'ci|Butterfly|Innerforce Layer ZLC|7.0|6.3|2.7|3.3|8.7|59|220|',
    'ci|Butterfly|Innerforce Layer ALC|7.5|7.7|4.6|5.1|8.3|51|195|',
    'ci|Butterfly|Innerforce ZLC|7.8|6.3|4.7|5.6|6.3|68|200|',
    'ci|Butterfly|Harimoto Innerforce Super ZLC|6.5|8.7|4.2|5.8|9.0|43|350|',
    'ci|Butterfly|Lin Yun-Ju Super ZLC|8.0|8.3|4.7|5.0|7.0|38|350|',
    'ci|Butterfly|Revoldia CNF|6.5|7.3|2.2|2.5|9.3|43|369|',
    'ci|Stiga|Dynasty Carbon|6.3|8.3|5.7|5.6|8.0|44|350|',
    'ci|Nittaku|Ma Long Carbon|7.0|8.7|4.3|6.0|10|14|180|',
    'ci|Andro|Temper Tech ALL+|4.8|8.3|6.3|6.1|7.0|44|51|ALL+',
    'def|Stiga|Defensive Classic II|-|-|-|-|-|-||5 camadas, 90 ±5 g, face limba; Stiga: controle 9,7 / vel 5,7|atual',
    'def|Butterfly|Diode Pro|-|-|-|-|-|-||5 madeiras, ~90 g, 5,5 mm, 165×156 mm, reação 9,6 / vibração 7,0|atual',
    'def|Butterfly|Diode V|-|-|-|-|-|-||5 madeiras, 97 g, 5,7 mm, reação 10,6 / vibração 7,9|atual',
    'def|Donic|Defplay Senso|0|8.3|3.3|4.1|9.0|23||verificar',
    'def|Butterfly|Joo Se Hyuk|-|-|-|-|-|34||DEF, 5 madeiras, 5,9 mm, 165×152 mm; ~95 g (Tabletennis11), exemplares de 90 a 110 g|descontinuada',
    'def|Butterfly|Defence Alpha|-|-|-|-|-|12||dados de plies conflitantes|provavelmente descontinuada'
  ];

  // cat|marca|modelo|vel|spin|ctrl|arco|dur|n|usd|brl|tacky|spec
  var RUBBERS = [
    't|Butterfly|Tenergy 05|7.7|8.0|4.3|7.6|5.2|381|80||-|dureza 36 (BF); 83/76/79; 1,7/1,9/2,1',
    't|Butterfly|Tenergy 05 FX|7.0|7.3|6.0|6.0|5.2|167|80||-|dureza 32 (BF)',
    't|Butterfly|Tenergy 64|7.7|6.0|5.0|5.4|6.0|173|80||-|dureza 36 (BF)',
    't|Butterfly|Tenergy 80|7.7|8.0|6.7|5.9|5.4|120|80||-|dureza 36 (BF)',
    't|Butterfly|Tenergy 25|7.3|7.0|6.0|4.3|6.4|75|80||-|dureza 36 (BF)',
    't|Butterfly|Dignics 05|7.0|8.0|6.0|6.3|7.0|80|94|645|-|dureza 40 (BF); 86/85/88',
    't|Butterfly|Glayzer|-|-|-|-|-|-||425|-|dureza 38 (BF); 81/73/82',
    't|Butterfly|Rozena|5.3|4.7|5.7|5.5|3.6|92|40|390|-|dureza 35 (BF); 83/70/75',
    't|Yasaka|Rakza 7|6.3|7.3|6.3|5.5|6.0|250|52|307–375|-|~45° (Yasaka) / 45–50 (JP) / 47,5 (lojas); 1,8/2,0/Max',
    't|Yasaka|Rakza 7 Soft|5.0|7.3|7.0|5.5|5.0|141||350–375|-|',
    't|Yasaka|Rakza X|6.7|6.7|7.0|4.7|5.8|65|43||-|~47,5°; 87/85/70 (Yasaka)',
    't|Yasaka|Rakza 9|8.0|7.7|6.3|4.3|7.4|79|53||-|',
    't|Yasaka|Mark V HPS|6.7|7.0|7.0|4.2|5.6|65|50||-|',
    't|Tibhar|Evolution MX-P|8.3|7.7|5.7|5.5|4.0|138|60||-|45,7–47,7° ESN; 125/80/120; 1,5 a 2,2',
    't|Tibhar|Evolution MX-S|7.3|8.3|7.0|5.1|4.8|107|59||-|',
    't|Tibhar|Evolution EL-P|7.0|7.3|6.7|5.3|6.2|72|40||-|',
    't|Andro|Rasant|7.3|7.7|6.7|5.6|6.8|147|57||-|',
    't|Andro|Rasant Grip|7.0|8.0|7.0|4.9|6.6|124|53||-|',
    't|Andro|Rasanter R47|8.0|7.7|6.3|5.9|5.2|93|41||-|47° ESN',
    't|Andro|Rasanter R42|6.3|7.3|7.3|6.1|5.2|68|41||-|42° ESN',
    't|Donic|Baracuda|5.7|8.3|5.3|7.3|5.4|221|60||-|',
    't|Donic|Acuda S2|6.0|6.7|5.3|5.1|5.0|111|37||-|',
    't|Donic|Bluefire M1|7.7|7.3|4.7|6.3|4.6|90|55||-|',
    't|Donic|Bluefire M2|5.7|6.7|5.0|6.4|2.6|67|55||-|',
    't|Xiom|Vega Europe|5.7|6.3|7.0|4.7|3.6|207|42||-|',
    't|Xiom|Vega Pro|7.0|7.3|5.7|5.8|5.0|169|39||-|',
    't|Xiom|Omega IV Pro|7.7|7.3|6.0|4.8|7.0|83|60||-|',
    't|Xiom|Omega V Tour|7.3|8.0|7.7|5.2|5.8|57|40||-|',
    't|Nittaku|Fastarc G-1|6.7|7.7|7.0|6.1|7.6|189|41||-|',
    't|Nittaku|Fastarc S-1|7.0|6.3|7.0|5.4|5.8|68|42||-|',
    't|Nittaku|Hammond Z2|7.7|7.3|7.0|6.4|6.2|81|59||-|',
    't|Stiga|Calibra LT|7.7|7.0|6.3|6.5|4.8|76|53||-|',
    't|Victas|Ventus Extra|7.3|8.0|8.0|4.7|8.8|42|36||-|',
    't|Victas|V>22 Double Extra|7.3|8.3|8.0|5.5|3.2|36|42||-|',
    't|Gewo|Hype XT Pro 50.0|7.7|7.7|7.0|5.9|6.2|27|48||-|50° (indicado no nome)',
    't|DHS|Gold Arc 8|8.0|7.7|7.0|5.7|6.6|146|67||-|',
    't|Yinhe|Moon|5.7|5.3|6.0|4.7|3.0|66|26||-|',
    't|Palio|AK47 Red|7.0|4.7|5.0|4.7|4.2|71|18||-|',
    'k|DHS|NEO Hurricane 3|4.7|7.7|5.7|5.8|5.0|319|20||8.1|37–41° DHS; 2,15/2,2 mm',
    'k|DHS|Hurricane 3|3.7|6.3|5.3|5.4|5.2|144|30||8.3|',
    'k|DHS|H3 National Blue Sponge|7.3|8.7|7.3|5.6|6.8|64|96||8.5|39/40/41 DHS',
    'k|DHS|Hurricane 8|5.0|7.7|6.7|4.7|5.6|70|45||8.1|',
    'k|DHS|Hurricane 2|5.0|7.7|3.3|3.4|5.8|76|22||8.6|',
    'k|DHS|NEO Skyline 2 TG2|5.0|7.7|5.7|4.9|5.6|112|32||8.1|',
    'k|DHS|NEO Skyline 3 TG3|5.0|6.7|5.7|4.8|5.6|90|24||7.5|',
    'k|729|Battle II Provincial Blue|6.3|8.0|7.0|-|-|-|||8.6|',
    'k|729|Super FX|0.7|4.7|5.0|3.9|4.8|90|15||6.7|',
    'k|Yinhe|Mercury II|4.3|6.0|5.7|5.5|2.2|106|8||6.0|',
    'k|Yinhe|Apollo 5|6.7|8.0|7.3|5.3|6.4|26|42||5.3|',
    'k|Butterfly|Dignics 09C|6.0|8.3|6.3|8.2|5.6|93|94|645|5.5|dureza 44 (BF); 79/96/96; 1,9/2,1',
    'k|Yasaka|Rakza Z|5.7|8.3|7.3|6.5|6.6|73|43||6.5|~50° (TTGearLab)',
    'k|Yasaka|Rising Dragon|6.3|8.3|7.7|4.4|6.0|73|50||6.0|',
    'k|Tibhar|Hybrid K3|-|-|-|-|-|36|75||-|~53° ESN; Tibhar 118/100/130 (sem dados agregados)',
    'k|Tibhar|Hybrid K3 FX|-|-|-|-|-|-|||-|48°; 115 vel / 130 spin',
    'k|Tibhar|Hybrid K1 European|7.0|8.3|7.3|6.0|6.8|18|41||5.5|',
    'k|Tibhar|Grip-S Europe|5.3|7.7|6.3|7.6|6.6|35|45||5.9|',
    'k|Donic|BlueGrip C1|7.0|7.7|5.7|6.9|7.4|10|55||6.9|60° ESN (Donic, via TT11)',
    'c|Yasaka|Mark V|3.3|4.0|5.7|4.4|7.4|212|37||-|',
    'c|Butterfly|Sriver|3.3|3.3|5.0|3.9|5.2|103|35||-|',
    'c|Butterfly|Sriver FX|3.0|3.7|5.3|4.8|4.2|69|40||-|',
    'c|Butterfly|Sriver EL|2.7|2.7|5.0|4.4|4.2|65|33||-|',
    'c|Butterfly|Tackiness Drive|0|4.7|6.3|5.1|7.2|43|50||-|',
    'c|729|Focus 3 Snipe|5.3|4.3|6.3|4.2|3.6|135|15||-|'
  ];

  // tipo|marca|modelo|vel|spin|geral|n|spec|status (valores crus do Revspin; sem radar)
  var PIPS = [
    'curto|Butterfly|Impartial XS|9.3|8.6|9.5|9|70/70/70, dureza 30; 1,7/1,9/2,1|n<10: sem nota',
    'curto|Butterfly|Challenger Attack|8.0|7.2|8.8|20|',
    'curto|Yasaka|Rakza PO|9.4|8.3|9.2|25|93/70/78; 2,0/Max',
    'curto|Nittaku|Moristo SP|9.0|7.8|8.8|16|85/68/82; 1,4 a Max',
    'curto|Victas|Spectol S1 (ex-TSP Spectol)|8.9|8.0|9.1|18|dureza 35,0; 1,6/2,0/Max',
    'curto|TSP|Spin Magic|8.1|8.5|9.5|15|',
    'curto|SpinLord|Waran|9.0|7.6|9.3|26|',
    'curto|Andro|Hexer Pips Force|9.3|8.6|9.3|22|',
    'curto|DHS|651|8.4|7.1|8.3|14|',
    'curto|Dr. Neubauer|Killer|7.2|4.9|8.6|10|',
    'enganoso|729|799 Super Warrior Provincial|8.1|7.9|9.0|21|médio/curto enganoso',
    'longo|Butterfly|Feint Long III|4.3|6.4|8.3|37|estabilidade 8, variação 3, dureza 25; OX/0,5/1,1/1,3; BR R$ 348',
    'longo|TSP|Curl P-1R|5.6|6.5|8.5|68|OX a 1,7 mm|disponibilidade incerta',
    'longo|Tibhar|Grass D.TecS|-|-|-|-|OX/0,5/0,9/1,2/1,6; ratings divergem entre lojas',
    'longo|Dr. Neubauer|Desperado 2|-|-|-|-|OX/0,6/1,0/1,3; LARC 26-027',
    'longo|DHS|C8|7.4|6.0|8.2|26|',
    'longo|SpinLord|Dornenglanz|4.7|4.0|8.9|24|',
    'longo|SpinLord|Blitzschlag|5.3|5.5|9.1|20|',
    'longo|Butterfly|Feint AG|-|-|-|-||descontinuada',
    'anti|Butterfly|Super Anti|-|-|-|-|estabilidade 5, variação 7, dureza 25; BR R$ 283',
    'anti|Dr. Neubauer|Tarantula|-|-|-|-|1,2/1,5/1,8 mm; LARC 26-028',
    'anti|Nittaku|Best Anti|4.1|2.6|-|13|controle 9,2'
  ];

  var num = function (s) { return s === '' || s === '-' || s == null ? null : parseFloat(s); };
  var slug = function (s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };

  var blades = BLADES.map(function (row) {
    var f = row.split('|'), n = num(f[8]);
    return { id: slug(f[1] + ' ' + f[2]), tipo: 'lamina', cat: f[0], catLabel: CATS[f[0]], marca: f[1], modelo: f[2],
      vel: num(f[3]), ctrl: num(f[4]), rig: num(f[5]), dur: num(f[6]), cons: num(f[7]), n: n,
      confianca: R.confidence(n), usd: num(f[9]), spec: f[10] || '', status: f[11] || 'ativo' };
  });
  var rubbers = RUBBERS.map(function (row) {
    var f = row.split('|'), n = num(f[8]);
    return { id: slug(f[1] + ' ' + f[2]), tipo: 'borracha', cat: f[0], catLabel: RCATS[f[0]], marca: f[1], modelo: f[2],
      vel: num(f[3]), spin: num(f[4]), ctrl: num(f[5]), arco: num(f[6]), dur: num(f[7]), n: n,
      confianca: R.confidence(n), usd: num(f[9]), brl: f[10] || null, tacky: num(f[11]), spec: f[12] || '', status: 'ativo' };
  });
  var pips = PIPS.map(function (row) {
    var f = row.split('|'), n = num(f[6]);
    return { id: slug(f[1] + ' ' + f[2]), tipo: 'pino', cat: f[0], marca: f[1], modelo: f[2],
      vel: num(f[3]), spin: num(f[4]), geral: num(f[5]), n: n, confianca: R.confidence(n), spec: f[7] || '', status: f[8] || 'ativo' };
  });

  var all = blades.concat(rubbers, pips);
  function find(id) { for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i]; return null; }
  return { META: META, blades: blades, rubbers: rubbers, pips: pips, find: find };
});
