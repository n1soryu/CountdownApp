# LDR Countdown

A glassmorphic long-distance relationship countdown built with React, Vite, and Tailwind CSS. Events are stored locally in the browser so you can track every reunion, anniversary, or milestone without a backend.

## Tech Stack
- React 19 + Vite 7
- Tailwind CSS 3 with PostCSS + Autoprefixer
- lucide-react icon set, date-fns utilities, clsx helpers
- Dockerized production build served via nginx (Dokploy ready)

## Getting Started
```bash
npm install
npm run dev
```
Open `http://localhost:5173` and start adding events. Data persists in `localStorage` under the key `ldr-events`.

### Available Scripts
- `npm run dev` – start Vite dev server
- `npm run build` – create a production bundle in `dist/`
- `npm run preview` – preview the production bundle locally
- `npm run lint` – run ESLint across the project

## Docker / Dokploy
Build and run the production image locally:
```bash
docker build -t ldr-countdown .
docker run -p 8080:80 ldr-countdown
```
Dokploy deployments can point at the included `Dockerfile`. The multi-stage build compiles the Vite app with Node 18 Alpine, then serves the optimized assets through nginx with SPA-friendly routing (`nginx.conf`).

## Project Structure
```
├── src/
│   ├── App.jsx        # Main UI & countdown logic
│   ├── main.jsx       # React entry point
│   └── index.css      # Tailwind layers + custom animations
├── tailwind.config.js # Tailwind theme extensions
├── postcss.config.js  # Tailwind + Autoprefixer plugins
├── Dockerfile         # Multi-stage build (Node + nginx)
└── nginx.conf         # SPA routing & asset caching
```
