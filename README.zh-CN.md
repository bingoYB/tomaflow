<p>
  <img src="public/logo.png" alt="TomaFlow Logo" width="96" />
</p>

# TomaFlow 番茄钟 (PWA)

**其他语言：** [English](README.md) | 简体中文 | [Español](README.es.md)


![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=222)
![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite 5](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8)


[![Deploy to GitHub Pages](https://github.com/bingoYB/toma_flow/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/bingoYB/toma_flow/actions/workflows/deploy-pages.yml)
[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy%20to-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)](https://dash.cloudflare.com/?to=/:account/pages/new)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bingoYB/toma_flow&project-name=toma_flow&repository-name=toma_flow)

一个现代化纯前端番茄钟应用，基于 React + TypeScript + Tailwind CSS。  
支持任务管理、统计图表、多语言、明暗主题与可安装 PWA。

## 在线地址

- GitHub Pages: https://bingoyb.github.io/toma_flow/
- 演示模式：URL 末尾加 `#demo`
- 示例：`https://bingoyb.github.io/toma_flow/#demo`

## 一键部署

- Vercel：点击上方 `Deploy with Vercel`
- Cloudflare Pages：点击上方 `Deploy to Cloudflare Pages`，然后在控制台导入当前 GitHub 仓库

## 多平台部署适配

本项目通过 `VITE_BASE_PATH` 兼容不同部署方式：

- GitHub Pages：`VITE_BASE_PATH=/toma_flow/`
- Vercel：默认 `/`
- Cloudflare Pages：默认 `/`

已配置文件：

- `vite.config.ts`：动态 `base`，并同步 PWA `start_url` 与 `scope`
- `.github/workflows/deploy-pages.yml`：构建时注入 `VITE_BASE_PATH=/toma_flow/`
- `vercel.json`：Vite 构建输出与 SPA 路由回退
- `wrangler.toml`：Cloudflare Pages 输出目录
- `public/_redirects`：静态托管下的 SPA 回退规则

## 本地启动

```bash
npm install
npm run dev
```

## 生产构建

```bash
npm run build
npm run preview
```
