# Velocity-16: High-Octane Cyber-League

Velocity-16 is a high-performance, retro-futuristic racing simulator inspired by the Mode 7 era of 16-bit gaming, evolved with modern physics, "Elvis Standard" visuals, and a 174 BPM heart rate.

## 🏎️ The League (High-Octane State)
Current build features the full 7-pilot roster, each with unique performance characteristics and hand-painted 24x16 sprite matrices.

| Pilot | Machine | Specialty | Palette |
| :--- | :--- | :--- | :--- |
| **Jackson** | Apex-Red | Balanced / AI-Core | Cyan/Magenta |
| **Unit-X** | Juggernaut-7 | Heavy / Brutalist Slab | Orange/Yellow |
| **Unknown** | Mantis-Ray | Organic / Dynamic Wings | Magenta/Violet |
| **Lyra-Neon** | Vapor-Skimmer | Narrow / High Agility | Green/Teal |
| **Baron Von Stryker** | Iron Vulture | Heavy / Military Grade | Blood-Orange/Gray |
| **Xylar the Exiled** | Plasma Reef | Fluid / Translucent Shell | Violet/Cyan |
| **Master-Remix** | Neon Symphony | Geometric / LED Array | Magenta/Gold |

## 🕹️ Core Features
- **Mode 7 Evolution**: Simulated 3D perspective with mass-based physics and character-specific handling.
- **Elvis Standard Visuals**: 24x16 and 32x13 hand-painted sprite matrices with dynamic "Shearing" for banking effects.
- **CRT/Arcade UI**: Neon-styled cabinet interface with LED status indicators, speedometer, and scanline post-processing.
- **Bitcrushed Audio**: WebAudio engine with 16-bit FM synthesis, square-wave engine hum, and TTS (Text-to-Speech) pilot feedback.

## 🛠️ Performance & Physics
- **Mass-Based Physics**: Handling is determined by machine weight and aerodynamic profiles.
- **Parallax Neon Grid**: Cyber-Napa circuit environment with multi-layered parallax and neon scanlines.
- **Shearing Engine**: Real-time pixel shearing for vehicle banking (replacing static rotation).

## 🚀 Getting Started
1. Open `Velocity-16/src/index.html` in a modern browser.
2. Click **"Initialize Engine"** to engage the WebAudio context.
3. **Controls**:
   - `Arrow Up`: Accelerate
   - `Arrow Down`: Brake
   - `Arrow Left/Right`: Turn (Engages dynamic shearing)
   - `Space`: Boost (If energy available)

## 🏗️ Hammer-Agent Workflow
This repository is maintained using the **Jackson Loop (Mandatory Workflow)**:
1. **Scope** (USER.md / MEMORY.md)
2. **Brief** (.clawdbot/MISSION_BRIEF.md)
3. **Spawn** (Codex/Opus parallel sessions)
4. **Peer Review** (Cross-branch validation)
5. **Standardized Commit** (Hammer Sprint prefix)

---
*Velocity-16 - Built for the Cyber-Napa Circuit.*
