
<p>
  <img src="public/logo.png" alt="TomaFlow Logo" width="96" />
</p>

# TomaFlow Pomodoro (PWA)


**Read this in:** English | [简体中文](README.zh-CN.md) | [Español](README.es.md)


![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=222)
![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite 5](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8)


[![Deploy to GitHub Pages](https://github.com/bingoYB/tomaflow/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/bingoYB/tomaflow/actions/workflows/deploy-pages.yml)
[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy%20to-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)](https://dash.cloudflare.com/?to=/:account/pages/new)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bingoYB/tomaflow&project-name=tomaflow&repository-name=tomaflow)

Modern frontend-only Pomodoro app built with React + TypeScript + Tailwind CSS.  
Includes tasks, analytics, multilingual UI, dark mode, and installable PWA support.

## Screenshot

![TomaFlow Screenshot](demo.png)

## Live Demo

- GitHub Pages: https://bingoyb.github.io/tomaflow/
- Cloudflare Pages: https://tomaflow.pages.dev/
- Vercel: https://tomaflow.vercel.app/
- Demo mode: append `#demo` to the URL
- Example: `https://bingoyb.github.io/tomaflow/#demo`

## Tech Stack

- React 18
- TypeScript 5
- Vite 5
- Tailwind CSS 3
- Recharts
- vite-plugin-pwa

## Features

- Pomodoro modes: `Work / Short Break / Long Break`
- Notifications: sound + system notifications
- Task management: create, focus, complete, reopen, delete, drag-sort
- Analytics: totals, focus rate, daily breakdown, line/pie/bar charts
- Settings: durations, sound preset, volume, notification toggle, shortcuts
- Internationalization: 10 languages
- Themes: light and dark
- PWA: installable + offline cache

## One-Click Deploy

- Vercel: click the `Deploy with Vercel` button above
- Cloudflare Pages: click the `Deploy to Cloudflare Pages` button above, then import this GitHub repo

## Deployment Compatibility

This project now supports multiple deployment targets through `VITE_BASE_PATH`:

- GitHub Pages: `VITE_BASE_PATH=/tomaflow/`
- Vercel: default `/`
- Cloudflare Pages: default `/`

Implemented config:

- `vite.config.ts`: dynamic `base`, PWA `start_url`, and `scope`
- `.github/workflows/deploy-pages.yml`: sets `VITE_BASE_PATH=/tomaflow/` during build
- `vercel.json`: Vite build/output + SPA rewrite
- `wrangler.toml`: Cloudflare Pages output directory
- `public/_redirects`: SPA fallback for Pages-style hosting

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```
