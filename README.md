# 🎵 Audio Editor & Listener Analytics Dashboard

A modern, production-ready audio editing and listener analytics web application built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Wavesurfer.js**, and **Framer Motion**.

The application provides an interactive waveform editing experience along with listener analytics visualization in a clean and responsive dashboard interface.

---

## ✨ Features

### 🎧 Audio Editing

* Interactive waveform visualization
* Real-time playback controls
* Audio seek & timeline interaction
* Smooth waveform rendering with Wavesurfer.js
* Animated UI interactions using Framer Motion
* Responsive editor workspace

### 📊 Analytics Dashboard

* Listener engagement heatmap overlay
* Playback analytics panel
* Relative time tracking
* Modern dashboard layout
* Sidebar history management

### ⚡ Performance & Architecture

* Built with Next.js 15 App Router
* TypeScript-first architecture
* Zustand state management
* Hydration-safe rendering
* Optimized component structure
* Production-ready project setup

---

## 🛠️ Tech Stack

| Technology    | Usage                    |
| ------------- | ------------------------ |
| Next.js 15    | Frontend Framework       |
| React         | UI Library               |
| TypeScript    | Type Safety              |
| Tailwind CSS  | Styling                  |
| Wavesurfer.js | Audio Waveform Rendering |
| Framer Motion | Animations               |
| Zustand       | State Management         |

---

## 📂 Project Structure

```bash
audio-editor/
├── src/
│   ├── app/
│   │   ├── globals.css          
│   │   ├── layout.tsx
│   │   └── page.tsx             
│   ├── components/
│   │   ├── shared/
│   │   │   └── DashboardLayout  
│   │   ├── sidebar/
│   │   │   ├── Sidebar         
│   │   │   └── HistoryPanel    
│   │   ├── editor/
│   │   │   ├── EditorArea       
│   │   │   ├── WaveformPlayer   
│   │   │   ├── HeatmapOverlay   
│   │   │   ├── Toolbar          
│   │   │   └── PlaybackControls 
│   │   └── analytics/
│   │       └── AnalyticsPanel   
│   ├── store/
│   │   └── audioStore.ts        
│   ├── hooks/
│   │   ├── useUpload.ts         
│   │   └── useWavesurfer.ts     
│   ├── lib/
│   │   ├── mockData.ts       
│   │   └── utils.ts             
│   └── types/index.ts           
```

---

## 🚀 Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Application will run locally at:

```bash
http://localhost:3000
```

## 🏗️ Production Build

```bash
npm run build
npm start
```

---

## 📌 Highlights
* SSR hydration issues fixed for stable rendering
* Client-only Wavesurfer integration
* Responsive modern UI/UX
* Optimized repository structure
* Clean and scalable architecture

---

## 👨‍💻 Author

**Divyanshu Kumar**

---

## 📄 License

This project is built for educational and assessment purposes.
