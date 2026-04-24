# Max Dashboard

A Jarvis-like intelligent dashboard with glassmorphism, animated orb, and particle effects.

## Features

- **Glassmorphism UI** — Frosted glass panels with backdrop blur effects
- **Animated Orb** — Living sphere with blue→yellow gradient animation, pulsing scale, and soft glow
- **Particle System** — 60 drifting particles rising through the canvas (blue & yellow tones)
- **Smart Sidebar** — Task management with priorities, mini calendar, upcoming events
- **Chat Interface** — Conversational command bar with typing indicators
- **Responsive Design** — Collapses to mobile-friendly layout on small screens

## Design System

### Colors
- Deep space background: `#050510`
- Glass surfaces: `rgba(255,255,255,0.04)`
- Orb gradient: Blue `#3b82f6` → Yellow `#eab308`
- Accent glow: `rgba(59,130,246,0.3)`

### Typography
- **Display**: Orbitron — futuristic, authoritative
- **Body**: DM Sans — clean, modern, readable

### Motion
- Orb: 8s hue-rotate cycle + 3s scale pulse
- Particles: Canvas-driven, 60fps, infinite loop
- UI: Staggered slide-in animations on load
- Chat bar: Elastic bounce-in entrance

## Usage

Simply open `index.html` in any modern browser. No build step required.

```bash
# Serve locally (optional)
python -m http.server 8000
# or
npx serve .
```

## Interactive Elements

- Click tasks to toggle completion
- Click "Add new task" to create tasks (inline editable)
- Type in chat bar and press Enter or click send
- Mobile: tap hamburger menu to toggle sidebar

---
Built with 💙 by Max Worker for Lévy VS
