# TomaFlow Pomodoro (PWA)

**Leer en:** [English](README.md) | [简体中文](README.zh-CN.md) | Español

[![Deploy to GitHub Pages](https://github.com/bingoYB/toma_flow/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/bingoYB/toma_flow/actions/workflows/deploy-pages.yml)
![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=222)
![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite 5](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8)

Una app Pomodoro moderna, totalmente frontend, construida con React + TypeScript + Tailwind CSS.  
Incluye gestión de tareas, paneles de estadísticas, soporte multilingüe, modo oscuro y capacidades PWA instalables.

## Demo en línea

- GitHub Pages: https://bingoyb.github.io/toma_flow/
- Modo demo: añade `#demo` al final de la URL (ejemplo: `https://bingoyb.github.io/toma_flow/#demo`)

## Stack técnico

- React 18
- TypeScript 5
- Vite 5
- Tailwind CSS 3
- Recharts (gráficas)
- vite-plugin-pwa (soporte offline e instalación)

## Funcionalidades

- Flujo Pomodoro: `Trabajo / Descanso Corto / Descanso Largo`
- Notificaciones al finalizar sesión (sonido + notificaciones del sistema)
- Gestión de tareas:
- Crear tareas con duración estimada
- Iniciar enfoque desde una tarea específica
- Marcar como completada / reabrir / eliminar / reordenar (arrastrar y soltar)
- Estadísticas (tabla + gráficas):
- Tiempo total de trabajo
- Tiempo total de descanso
- Pomodoros completados
- Tasa de enfoque
- Resumen diario por tarea
- Tendencia diaria de trabajo
- Gráfico de distribución por tarea
- Gráfico diario de pomodoros
- Configuración:
- Duraciones personalizadas de trabajo/descanso
- Cambio y vista previa de sonidos
- Volumen de notificaciones
- Interruptor de notificaciones del sistema
- Internacionalización (10 idiomas):
- Chino, inglés, hindi, español, árabe, francés, bengalí, portugués, ruso y urdu
- Tema claro/oscuro
- PWA instalable con caché offline

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
