<p>
  <img src="public/logo.png" alt="TomaFlow Logo" width="96" />
</p>


# TomaFlow Pomodoro (PWA)

**Leer en:** [English](README.md) | [简体中文](README.zh-CN.md) | Español


![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=222)
![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite 5](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8)


[![Deploy to GitHub Pages](https://github.com/bingoYB/tomaflow/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/bingoYB/tomaflow/actions/workflows/deploy-pages.yml)
[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy%20to-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)](https://dash.cloudflare.com/?to=/:account/pages/new)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bingoYB/tomaflow&project-name=tomaflow&repository-name=tomaflow)


Aplicación Pomodoro moderna, 100% frontend, construida con React + TypeScript + Tailwind CSS.

## Captura

![Captura de TomaFlow](demo.png)

## Demo en línea

- GitHub Pages: https://bingoyb.github.io/tomaflow/
- Cloudflare Pages: https://tomaflow.pages.dev/
- Vercel: https://tomaflow.vercel.app/
- Modo demo: agrega `#demo` al final de la URL
- Ejemplo: `https://bingoyb.github.io/tomaflow/#demo`

## Despliegue en un clic

- Vercel: haz clic en `Deploy with Vercel`
- Cloudflare Pages: haz clic en `Deploy to Cloudflare Pages` e importa este repositorio de GitHub

## Compatibilidad de despliegue

El proyecto usa `VITE_BASE_PATH` para soportar distintas plataformas:

- GitHub Pages: `VITE_BASE_PATH=/tomaflow/`
- Vercel: valor por defecto `/`
- Cloudflare Pages: valor por defecto `/`

Archivos de configuración:

- `vite.config.ts`: `base` dinámico y PWA (`start_url`, `scope`)
- `.github/workflows/deploy-pages.yml`: define `VITE_BASE_PATH=/tomaflow/`
- `vercel.json`: build/output de Vite + fallback SPA
- `wrangler.toml`: salida de build para Cloudflare Pages
- `public/_redirects`: fallback de rutas SPA para hosting estático

## Inicio rápido

```bash
npm install
npm run dev
```

## Build de producción

```bash
npm run build
npm run preview
```
