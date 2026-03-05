# TomaFlow 番茄钟 (PWA)

**其他语言：** [English](README.md) | 简体中文 | [Español](README.es.md)

[![Deploy to GitHub Pages](https://github.com/bingoYB/toma_flow/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/bingoYB/toma_flow/actions/workflows/deploy-pages.yml)
![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=222)
![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite 5](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8)

一个现代化纯前端番茄钟应用，基于 React + TypeScript + Tailwind CSS。  
支持任务管理、统计图表、多语言、明暗主题与可安装 PWA。

## 在线访问

- GitHub Pages: https://bingoyb.github.io/toma_flow/
- 演示模式：在 URL 后追加 `#demo`（例如 `https://bingoyb.github.io/toma_flow/#demo`）

## 技术栈

- React 18
- TypeScript 5
- Vite 5
- Tailwind CSS 3
- Recharts（图表）
- vite-plugin-pwa（离线与安装能力）

## 功能特性

- 番茄钟流程：`工作 / 短休息 / 长休息`
- 倒计时结束通知（音效 + 系统通知）
- 任务管理：
- 创建任务并设置预计时长
- 从指定任务开始专注
- 标记完成 / 重新打开 / 删除 / 拖拽排序
- 数据统计（表格 + 图表）：
- 总工作时长
- 总休息时长
- 完成番茄数
- 专注率
- 每日任务工作时长
- 每日工作趋势
- 任务占比饼图
- 每日番茄柱状图
- 设置项：
- 自定义工作/休息时长
- 通知音效切换与预览
- 通知音量设置
- 系统通知开关
- 国际化（10 种语言）：
- 中文、英文、印地语、西班牙语、阿拉伯语、法语、孟加拉语、葡萄牙语、俄语、乌尔都语
- 明暗主题切换
- 可安装 PWA + 离线缓存

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
