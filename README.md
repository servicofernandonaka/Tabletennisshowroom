# Guia da Raquete (projeto separado do CalcMed)

Site estático (HTML/CSS/JS puro, abre direto por `guia-raquete/index.html`).

- `js/catalog.js`: catálogo por **arquétipos** (estimativas, `verified:false`). Sem produtos reais até haver fonte oficial.
- `js/engine.js`: motor determinístico (UMD, sem DOM): filtro por perfil, recomendação, validação de sinergia (bottom-out, pino longo + lâmina rígida, cores ITTF, empunhadura), peso, balance point, radar 0–10.
- `js/app.js` + `index.html`: Quiz, ficha técnica com radar, "Monte o Seu Pack" e guias.
- Testes: `node --test guia-raquete/tests/*.test.js`

Pendente: preencher `products` com dados oficiais (ESN/DHS, camadas, pesos) e ITTF/LARC.

## Catálogo real (Guia Mestre Wang)
- `js/rating.js`: fórmulas de normalização (Revspin → 0–10), confiança por nº de avaliações e radar combinado do pack.
- `js/products.js`: 62 lâminas, 63 borrachas invertidas e 22 pinos/anti transcritos do guia (coleta out/2026). **Não verificados de forma independente.** Specs oficiais ficam em `spec`, fora do radar.
- Pendente: código LARC por borracha, preços em R$ por feed, lâminas caneta japonesas, peso cortado real.
