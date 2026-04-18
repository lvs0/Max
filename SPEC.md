# Max Dashboard — Jarvis-like Interface

## 1. Concept & Vision

Max is a sleek, dark, glassmorphic personal assistant dashboard inspired by JARVIS from Iron Man. It feels like piloting a futuristic command center — atmospheric, alive, and responsive. The orb at the center is the emotional heart: pulsing calmly while idle, glowing urgently when speaking. The overall mood is premium, cinematic, and quietly powerful.

## 2. Design Language

**Aesthetic Direction:** Dark glassmorphism with neon accents — think control room at midnight, screens glowing through frosted glass.

**Color Palette:**
- Background: `#0a0a0f` (deep void black)
- Surface glass: `rgba(255, 255, 255, 0.05)` (frosted white)
- Orb Idle (waiting): `#00F5F5` (electric cyan)
- Orb Speaking: `#FFD700` (golden yellow)
- Accent text: `#a0a0b0` (muted silver)
- Primary text: `#e0e0e8` (soft white)
- Border glass: `rgba(255, 255, 255, 0.08)`

**Typography:**
- Primary: `Inter`, fallback `system-ui`
- Display/Orb label: `Orbitron` (Google Fonts), futuristic

**Spatial System:**
- Base unit: 8px
- Border radius: 16px for panels, 24px for large cards, full-round for orb
- Glass blur: `backdrop-filter: blur(20px)`

**Motion Philosophy:**
- Orb: continuous subtle pulse scale(0.95–1.05) @ 2s ease-in-out infinite
- Orb speaking: scale(1.0–1.15) + brighter glow, @ 1.2s
- Particles: 30–50 floating dots, random drift, opacity 0.2–0.6, parallax depth layers
- Panel entrance: fade-in + translateY(20px→0) @ 600ms ease-out
- Chat message: slide-in from bottom @ 300ms

## 3. Layout & Structure

```
┌──────────────────────────────────────────────────────────┐
│  [Left Sidebar 260px]  │  [Center Main 1fr]  │ [Right 280px] │
│  - MAX logo             │   - Orb (animated)  │  - Planning   │
│  - Tasks list           │   - Status label    │  - Calendar   │
│  - Current plan         │   - Quick actions   │  - Stats      │
└──────────────────────────────────────────────────────────┘
│              [Chat Bar — bottom center]                   │
└──────────────────────────────────────────────────────────┘
```

- Full viewport height, no scroll on main layout
- Background: fixed particle canvas behind everything
- All panels: glassmorphic floating cards

## 4. Features & Interactions

**Orb:**
- Idle: cyan (#00F5F5), slow pulse
- Speaking: yellow (#FFD700), faster pulse + outer glow ring
- Click: toggles speaking state (demo)

**Particles:**
- 40 floating particles on canvas, varying size (2–6px), varying opacity
- Drift slowly upward and sideways
- Reset to bottom when they exit top

**Chat Bar:**
- Fixed at bottom center
- Glassmorphic pill input
- Placeholder: "Ask Max anything..."
- Enter submits (console.log for now)

**Left Sidebar:**
- MAX logo at top
- Task list with checkable items (visual only)
- Current plan section with progress bar

**Right Sidebar:**
- Planning/calendar widget (mock events)
- System stats (CPU, Memory, Uptime) — animated bars

**Quick Actions:**
- 4 icon buttons under orb: Weather, News, Timer, Settings

## 5. Component Inventory

**`<Orb />`**
- States: idle (cyan pulse), speaking (yellow pulse + glow)
- Size: 160px diameter
- Glow: box-shadow radial, color matches state

**`<ParticleCanvas />`**
- Full-viewport fixed canvas behind content
- 40 particles with random velocity

**`<GlassPanel />`**
- Reusable glassmorphic card
- Props: title, children
- States: default, hover (border brightens to 0.15 opacity)

**`<ChatBar />`**
- Input pill, send button
- States: empty, focused (border glow), submitted

**`<TaskItem />`**
- Checkbox + label + priority dot
- States: pending, completed (line-through + opacity 0.5)

**`<StatBar />`**
- Label + animated width bar + percentage
- Fill color: gradient cyan→purple

## 6. Technical Approach

- **Single HTML file** with React 18 via CDN + Tailwind CSS CDN
- React components defined inline via `function App()`
- Canvas API for particle system (requestAnimationFrame loop)
- CSS custom properties for theming
- No build step required — open `index.html` directly
- GitHub: initialize repo, first commit, push to `https://github.com/lvs0/max`
