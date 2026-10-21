/* Kits Prontos de Fábrica ("tira da caixa e joga"): raquetes já montadas e coladas, para quem não quer comprar peças separadas.
   DADOS: só o que foi encontrado em páginas de fabricante/lojas (busca de out/2026), com a fonte em cada kit. Nada foi conferido na lista
   oficial da ITTF/LARC nem pesado em balança: `verificado:false`. Onde as fontes divergem, o campo fica vazio e a divergência vai em `ressalvas`.
   Preços: sem fonte confiável em R$ → não exibimos valor; a vitrine manda conferir o preço atual.
   UMD, sem DOM. A regra de `recommendKit` é editorial (curadoria do Mestre Wang), não uma medição. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MasterWangKits = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var META = { fonte: 'Páginas de fabricante e lojas (busca out/2026)', verificado: false, homologacao: 'Confirme o modelo exato na lista da ITTF/LARC antes de usar em torneio.' };

  var KITS = [
    { id: 'timo-boll-silver', brand: 'Butterfly', nome: 'Butterfly Timo Boll Silver', badge: 'O mais fácil de controlar', perfil: 'iniciante ou lazer social',
      lamina: '5 camadas de madeira, cabo anatômico', borracha: 'Addoy (esponja de 1,5 a 1,7 mm; as lojas divergem)', cabo: 'Anatômico', peso: null,
      destaque: 'Foco em controle: a loja o classifica com controle máximo e velocidade baixa, para quem está começando.',
      refPreco: 'cerca de £ 25 em uma loja do Reino Unido (só referência; confira o preço atual no Brasil)',
      ressalvas: ['Espessura da esponja diverge entre lojas (1,5 mm ou 1,7 mm).', 'Peso não confirmado: confira a ficha do vendedor.'],
      fontes: [{ t: 'TableTennis365', u: 'https://www.tabletennis365.com/Shop/Product/timo-boll-silver/6057' }] },
    { id: 'timo-boll-gold', brand: 'Butterfly', nome: 'Butterfly Timo Boll Gold', badge: 'Controle com um pouco mais de ação', perfil: 'lazer avançado ou quem já tem alguma experiência',
      lamina: '5 camadas de madeira, cabo FL (flared)', borracha: 'Pan Asia (esponja de 1,5 mm), vermelha e preta', cabo: 'FL (flared)', peso: null,
      destaque: 'Equilíbrio entre ataque e defesa, com controle alto (a loja o coloca acima do Silver em velocidade e efeito).',
      refPreco: null,
      ressalvas: ['Peso diverge entre fontes (149 g com embalagem em uma loja, 170 g em outra): pese a sua.', 'Estoque e disponibilidade variam por loja.'],
      fontes: [{ t: 'TableTennis365', u: 'https://tabletennis365.com/Shop/Product/butterfly-timo-boll-gold/6058' }, { t: 'Galaxus', u: 'https://galaxus.ch/en/s3/product/butterfly-bat-boll-gold-table-tennis-bats-16327848' }] },
    { id: 'stiga-pro-carbon', brand: 'Stiga', nome: 'Stiga Pro Carbon', badge: 'Carbono pronto de fábrica', perfil: 'lazer avançado que quer mais velocidade e efeito',
      lamina: '7 camadas com 2 de fibra de carbono, cabo FL (flared)', borracha: 'S5 lisa invertida (esponja de 2 mm)', cabo: 'FL (flared)', peso: 159,
      pesoNota: 'ficha do fabricante (loja dos EUA); varia por exemplar',
      destaque: 'A ficha do fabricante dá notas altas em velocidade e efeito e nota menor em controle: exige mais técnica que os kits Butterfly.',
      refPreco: null,
      ressalvas: ['Não confundir com o Pro Carbon+ (outro modelo, de ~165 g).', 'Uma loja lista 165 g para uma variante: pese a sua.', 'Aprovação da borracha pela ITTF vem do fabricante; confirme na lista oficial.'],
      fontes: [{ t: 'Stiga (EUA)', u: 'https://www.stigaus.com/products/rackets/tournament/pro-carbon' }] },
    { id: 'xiom-muv', brand: 'Xiom', nome: 'Xiom MUV (série)', badge: 'Opção leve da série', perfil: 'quem quer raquete mais leve, com modelos de entrada a avançados',
      lamina: 'Varia por modelo (a MUV 9.0OS tem 5 madeiras + 2 camadas de fibra C.Fleece)', borracha: 'MUV HYSPIN (4.0OS e 5.5S) ou MUV PROSPIN 2.0 (7.0OS e 9.0OS)', cabo: 'Varia por modelo', peso: null,
      destaque: 'Série com vários modelos. Na avaliação de jogadores, as 4.0OS e 5.5S aparecem como leves e a 7.0OS como pesada: escolha o modelo pelo peso que você procura.',
      refPreco: null,
      ressalvas: ['Escolha um modelo específico (4.0OS, 5.5S, 7.0OS ou 9.0OS) e confira ficha, peso e homologação dele.', 'Pesos citados são notas de jogadores, não medidas do fabricante.', 'Uma loja afirma que a linha é homologada pela ITTF: confirme na lista oficial.'],
      fontes: [{ t: 'Revspin: MUV 5.5S', u: 'https://revspin.net/premade/xiom-muv-55s.html' }, { t: 'Revspin: MUV 7.0OS', u: 'https://revspin.net/premade/xiom-muv-7os.html' }, { t: 'Revspin: MUV 9.0OS', u: 'https://revspin.net/premade/xiom-muv-9os.html' }] }
  ].map(function (k) { k.verificado = false; k.origem = 'fabricante-e-lojas'; k.tags = k.id === 'stiga-pro-carbon' ? ['ready', 'perf'] : ['ready']; return k; });

  var TAGS = { ready: ['⚡', 'Pronto para Jogar', ''], perf: ['🔥', 'Alta Performance', 'red'], master: ['🏆', 'Escolha do Mestre', 'gold'] };   // selos editoriais (curadoria)
  var BENEFITS = [
    ['⚡', 'Pronta para uso imediato', 'Chega montada e colada: tire da caixa e jogue.'],
    ['🧴', 'Sem custo de colagem', 'Não precisa comprar cola, fita de borda nem serviço de montagem.'],
    ['🛡️', 'Boa para lazer avançado e condomínio', 'Construção de fábrica pensada para uso recreativo frequente.'],
    ['💰', 'Costuma custar menos que montar por partes', 'Tendência geral: confira o preço atual de cada modelo.']
  ];
  var byId = function (id) { for (var i = 0; i < KITS.length; i++) if (KITS[i].id === id) return KITS[i]; return null; };

  /** Regra editorial. Kits de fábrica quase sempre são de empunhadura clássica: para caneta não há kit verificado → `kits: []`. */
  function recommendKit(a) {
    var out = { kits: [], note: '' };
    if (a.grip && a.grip !== 'shakehand') { out.note = 'Ainda não temos kit pronto verificado para caneta. Monte por partes (Pack 5, caneta moderna) ou consulte o Mestre Wang.'; return out; }
    var first;
    if (a.body === 'light_safe') first = 'xiom-muv';
    else if (a.goal === 'learn_control') first = 'timo-boll-silver';
    else if (a.goal === 'close_blocker') first = 'timo-boll-gold';
    else first = 'stiga-pro-carbon';   // spin_attacker e competitive_step
    var next = { 'xiom-muv': 'timo-boll-silver', 'timo-boll-silver': 'timo-boll-gold', 'timo-boll-gold': 'timo-boll-silver', 'stiga-pro-carbon': 'timo-boll-gold' }[first];
    out.kits = [byId(first), byId(next)];
    return out;
  }
  function buyUrl(cfg, kit, text) {
    cfg = cfg || {};
    if (cfg.checkoutUrl) {
      try { var u = new URL(cfg.checkoutUrl, 'https://example.invalid/'); u.searchParams.set('kit', kit.id); u.searchParams.set('utm_source', 'guia-raquete'); u.searchParams.set('utm_medium', 'kit'); return /^https?:/i.test(cfg.checkoutUrl) ? u.href : cfg.checkoutUrl; } catch (e) { /* cai no WhatsApp */ }
    }
    return 'https://wa.me/' + String(cfg.whatsapp || '').replace(/\D/g, '') + '?text=' + encodeURIComponent(text || ('Olá! Quero comprar o kit pronto: ' + kit.nome));
  }
  function buyText(kit) { return 'Olá! Vim pelo Guia da Raquete e quero comprar o kit pronto de fábrica: ' + kit.nome + '. Pode me passar preço e prazo?'; }
  return { META: META, TAGS: TAGS, KITS: KITS, BENEFITS: BENEFITS, byId: byId, recommendKit: recommendKit, buyUrl: buyUrl, buyText: buyText };
});
