# Luan Roinner — Portfólio

Portfólio de Luan Roinner, Product Designer em São Paulo. Site estático em HTML, CSS e JavaScript, sem build e sem dependências.

## Páginas

| Arquivo | Conteúdo |
| --- | --- |
| `index.html` | Home: banner, sobre, galeria/projetos e contato |
| `cactus-gaming.html` | Projeto Cactus Gaming |
| `bossa-bank.html` | Projeto Bossa Bank |
| `brilhantina.html` | Projeto Brilhantina |
| `instituto-conecta-cactus.html` | Projeto Instituto Conecta Cactus |
| `bb-imports.html` | Projeto B&B imports |
| `404.html` | Página de erro |
| `assets/` | Imagens e vídeo |
| `runtime.js` | Interações (lente raio-X, idioma PT/EN, menu, abas) |
| `js/` | Script de cada página |
| `fonts/` | Fontes Unbounded e Inter Tight (SIL Open Font License) |

## Segurança e privacidade

- Content-Security-Policy em todas as páginas: só scripts, fontes e mídia do próprio site.
- Nenhuma requisição a terceiros (fontes hospedadas localmente).
- `Referrer-Policy: strict-origin-when-cross-origin`.
- Sem formulários, cookies ou coleta de dados; só a preferência de idioma fica no navegador.

## Publicar com GitHub Pages

1. Crie um repositório (ex.: `portfolio` ou `seu-usuario.github.io`).
2. Envie **todo o conteúdo desta pasta** para a raiz do repositório, incluindo o arquivo oculto `.nojekyll`.
3. No GitHub: **Settings → Pages → Build and deployment**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)` e salve.
4. Em 1–2 minutos o site fica no ar em `https://seu-usuario.github.io/portfolio/` (ou `https://seu-usuario.github.io/` se o repositório tiver esse nome).

Para usar domínio próprio: **Settings → Pages → Custom domain**.

## Rodar localmente

Abra o `index.html` no navegador, ou sirva a pasta:

```bash
python3 -m http.server 8000
```

e acesse `http://localhost:8000`.

---

© 2026 Luan Roinner
