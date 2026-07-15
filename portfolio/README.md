# Portfolio — Sai Teja Golla

A single-file personal portfolio site (`index.html`) in the same cinematic
dark / glassmorphism design language as SoleMate — Bebas Neue display type,
`#e8ff3b` accent, glass panels, IntersectionObserver scroll reveals, and
zero animation libraries.

## Run locally

```bash
cd portfolio
python -m http.server 8080   # → http://localhost:8080
```

Or just open `index.html` in a browser — it's fully self-contained
(only external requests are Google Fonts, with system-font fallbacks).

## Deploy

Any static host works:

- **Vercel** — `vercel deploy portfolio` (or point a new project at the `portfolio/` directory)
- **GitHub Pages** — serve the `portfolio/` folder from the repo settings
- **Netlify** — drag-and-drop the folder

## Sections

1. Hero — name, role, stack highlights
2. About — bio + quick-facts card
3. Skills — languages / backend / frontend / infra
4. Projects — SoleMate (featured), DocMind AI, Stock Market API + Dashboard
5. Experience & Education — timeline
6. Contact — email, GitHub, LinkedIn
