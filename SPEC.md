# Max Dashboard — Jarvis-like Interface

## Aesthetic Direction
**Jarvis meets cosmic glass.** Dark, cinematic, intelligent. Every element floats in layered glass. A living, breathing orb pulses at the center like a synthetic heart. Particles drift like digital stardust. This is a command center for someone who wants to feel like they're running a starship from their browser.

## Design Language

### Color Palette
- `--bg-deep`: #050510 (near-black cosmic blue)
- `--bg-glass`: rgba(255,255,255,0.04) (frosted panel surfaces)
- `--glass-border`: rgba(255,255,255,0.10)
- `--orb-blue`: #3b82f6 → `--orb-yellow`: #eab308 (animated gradient)
- `--text-primary`: rgba(255,255,255,0.95)
- `--text-muted`: rgba(255,255,255,0.45)
- `--accent-glow`: rgba(59,130,246,0.3)

### Typography
- **Display**: Orbitron (Google Fonts) — futuristic, authoritative
- **Body**: DM Sans — clean, readable, modern

### Motion
- Orb: continuous hue-rotate blue→yellow (8s ease infinite), subtle scale pulse (3s)
- Particles: canvas-driven, 60 particles drifting upward, fade out at top
- Sidebar panels: slide-in on load (staggered 100ms), 400ms ease-out
- Chat bar: elastic bounce-in on mount
- Hover states: glass panels lift with box-shadow bloom

### Visual Assets
- Lucide icons for sidebar nav
- CSS-only particle canvas
- Orb uses radial-gradient + backdrop-filter blur

## Layout

```
┌─────────────────────────────────────────┐
│  SIDEBAR (240px)  │   MAIN CONTENT      │
│  ─────────────    │   ─────────────     │
│  [Logo: MAX]      │   ┌─────────────┐   │
│                   │   │  ORB (center)│  │
│  ▸ Dashboard      │   │  + particles │  │
│  ▸ Tasks          │   │  + greeting  │  │
│  ▸ Planning       │   └─────────────┘   │
│  ▸ Projects       │                     │
│  ▸ Settings       │   ┌─────────────┐   │
│                   │   │  CHAT BAR   │   │
│  ─────────────    │   └─────────────┘   │
│  [User Avatar]    │                     │
└─────────────────────────────────────────┘
```

- Sidebar: fixed left, glass panels stacked vertically, scrollable task list
- Main: orb centered with particle canvas behind, chat bar anchored bottom
- Responsive: sidebar collapses to icon-only on mobile

## Features

### Orb (Hero Element)
- 200px diameter radial gradient sphere
- Color animates blue→yellow via CSS hue-rotate
- Pulsing scale animation (0.95→1.05)
- Soft glow halo behind

### Particle System
- Canvas element behind orb
- 60 small circles (2-4px) in white/blue tones
- Rise slowly, slight horizontal drift
- Loop infinitely

### Sidebar Tasks
- Scrollable task list with checkboxes
- Add task inline
- Task completion toggles strikethrough + opacity fade
- Color-coded priority dots

### Sidebar Planning
- Mini calendar showing current week
- Today's date highlighted
- Up to 3 upcoming events listed below

### Chat Bar
- Frosted glass input field
- Send button with hover glow
- Message history above (simulated)
- Typing indicator animation

## Technical Stack
- Single HTML file (vanilla JS + CSS)
- No build step required
- Canvas API for particles
- CSS custom properties for theming
- Google Fonts via CDN

## Polish
- Custom scrollbar (thin, dark, matches theme)
- ::selection color (accent blue)
- Smooth scroll behavior
- Glass panels: backdrop-filter: blur(20px)
- Focus states: glowing ring in accent color
