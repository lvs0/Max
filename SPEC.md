# Max Dashboard — Jarvis-like Interface

## 1. Concept & Vision

Max is a sleek, dark, glassmorphic personal assistant dashboard inspired by JARVIS from Iron Man. It feels like piloting a futuristic command center — atmospheric, alive, and responsive. The orb at the center is the emotional heart: pulsing calmly while idle (cyan), glowing urgently when speaking (golden yellow). The overall mood is premium, cinematic, and quietly powerful.

## 2. Design Language

**Aesthetic Direction:** Dark glassmorphism with neon accents — control room at midnight, screens glowing through frosted glass.

**Color Palette:**
- Background: `#050510` (deep void black)
- Surface glass: `rgba(255, 255, 255, 0.06)` (frosted white)
- Orb Idle (waiting): `#00F5F5` (electric cyan)
- Orb Speaking: `#FFD700` (golden yellow)
- Accent text: `#64748b` (muted silver)
- Primary text: `#e2e8f0` (soft white)
- Border glass: `rgba(255, 255, 255, 0.1)`

**Typography:**
- Primary: `Syne`, fallback `system-ui`
- Display/Mono: `Space Mono` (Google Fonts)

**Spatial System:**
- Base unit: 8px
- Border radius: 12px for panels, 16px for cards, 24px for large cards, full-round for orb
- Glass blur: `backdrop-filter: blur(24px)`

**Motion Philosophy:**
- Orb idle: conic gradient rotate + scale pulse (4s), cyan glow
- Orb speaking: yellow conic gradient, faster pulse (1.2s), intense glow rings
- Particles: 80 floating dots, random drift, pulsing opacity
- Panel entrance: slide/fade animations with staggered delays
- Stats: animated bars updating every 5s

## 3. Layout & Structure

```
┌────────────────────────────────────────────────────────────────┐
│                    [Clock — top center]                        │
├──────────────┬──────────────────────────┬─────────────────────┤
│ Left Sidebar │       Main Area          │   Right Sidebar     │
│ 260px        │       (1fr)              │   280px             │
│              │                          │                     │
│ • MAX logo   │   • Orb (animated)       │ • SYS logo          │
│ • Tasks      │   • Quick Actions        │ • System Stats      │
│ • Planning   │   • Status Cards         │   - CPU/Mem/Disk/Net│
│              │                          │ • Calendar April    │
│              │                          │ • Uptime            │
└──────────────┴──────────────────────────┴─────────────────────┘
│                  [Chat Bar — bottom center]                    │
└────────────────────────────────────────────────────────────────┘
```

- Full viewport height, no scroll on main layout
- Background: fixed particle canvas behind everything
- All panels: glassmorphic floating cards with blur

## 4. Features & Interactions

**Orb:**
- Click toggles speaking state (demo)
- Idle: cyan conic gradient, slow rotate + breath
- Speaking: yellow conic gradient, fast rotate + intense pulse + glow rings
- Label changes: "MAX · READY" ↔ "MAX · SPEAKING"

**Particles:**
- 80 floating particles on canvas, varying size (0.5–3.5px)
- Drift with subtle velocity, respawn at edges
- Colors: cyan (180°) or yellow (45°), pulsing opacity

**Chat Bar:**
- Fixed at bottom center (responsive: full width on narrow screens)
- Glassmorphic pill input
- Placeholder cycles: "Ask Max anything..." → "Max is thinking..." → "Max is responding..."
- Enter submits, triggers orb speaking state for 3s

**Left Sidebar:**
- MAX logo with animated mini orb
- Task list: clickable items with done toggle (line-through)
- Tags: Urgent (yellow), Project (purple), Important (cyan)
- Planning timeline: colored dots (blue/yellow/green) + time + title

**Right Sidebar:**
- SYS logo
- System Stats: animated bars for CPU, Memory, Disk, Network (updating every 5s)
- Calendar: April 2026 grid with event dots and today highlighted
- Uptime display

**Quick Actions:**
- 4 icon buttons: Weather 🌤️, News 📰, Timer ⏱️, Settings ⚙️
- Each triggers speaking state + placeholder message

## 5. Component Inventory

**`<Orb />`**
- States: idle (cyan), speaking (yellow)
- Size: 240px diameter
- Glow: box-shadow radial rings, color matches state
- 4 orbital ring decorations with staggered pulse

**`<ParticleCanvas />`**
- Full-viewport fixed canvas behind content
- 80 particles with random velocity and pulse phase

**`<GlassPanel />`**
- Reusable glassmorphic card
- Backdrop blur 24px, border rgba(255,255,255,0.1)

**`<ChatBar />`**
- Input pill, send button
- States: default, focused (border glow cyan), speaking (orb icon yellow)

**`<TaskItem />`**
- Checkbox + label + priority dot + meta + tag
- States: pending, completed (line-through + opacity 0.4)

**`<StatBar />`**
- Label + animated width bar + percentage
- Fill color: gradient cyan→purple, box-shadow glow

**`<Calendar />`**
- 7-column grid, day names, numbered days
- Today highlighted with gradient
- Event days marked with yellow dot

## 6. Technical Approach

- **Single HTML file** — no build step, open directly
- Canvas API for particle system (requestAnimationFrame loop)
- CSS custom properties for theming
- Google Fonts: Syne + Space Mono
- Responsive: right sidebar hides below 1200px
- GitHub: `https://github.com/lvs0/max`
