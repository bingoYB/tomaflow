# TomaFlow Pomodoro (PWA)

**Read this in:** English | [简体中文](README.zh-CN.md) | [Español](README.es.md)

[![Deploy to GitHub Pages](https://github.com/bingoYB/toma_flow/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/bingoYB/toma_flow/actions/workflows/deploy-pages.yml)
![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=222)
![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite 5](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8)

A modern, frontend-only Pomodoro app built with React + TypeScript + Tailwind CSS.  
It includes task management, analytics dashboards, multi-language support, dark mode, and installable PWA capabilities.

## Live Demo

- GitHub Pages: https://bingoyb.github.io/toma_flow/
- Demo mode: append `#demo` to the URL (example: `https://bingoyb.github.io/toma_flow/#demo`)

## Tech Stack

- React 18
- TypeScript 5
- Vite 5
- Tailwind CSS 3
- Recharts (charts)
- vite-plugin-pwa (offline and install support)

## Features

- Pomodoro workflow: `Work / Short Break / Long Break`
- End-of-session notifications (sound + system notifications)
- Task management:
- Create tasks with estimated duration
- Start focus from a specific task
- Mark done / reopen / delete / reorder (drag and drop)
- Analytics (table + charts):
- Total work time
- Total break time
- Completed pomodoros
- Focus rate
- Daily task breakdown
- Daily work trend
- Task distribution pie chart
- Daily pomodoro bar chart
- Settings:
- Custom work/break durations
- Notification sound switching and preview
- Notification volume
- System notification toggle
- Internationalization (10 languages):
- Chinese, English, Hindi, Spanish, Arabic, French, Bengali, Portuguese, Russian, Urdu
- Light/Dark themes
- Installable PWA with offline cache

## Getting Started

```bash
npm install
npm run dev
```

## Build for Production

```bash
npm run build
npm run preview
```
