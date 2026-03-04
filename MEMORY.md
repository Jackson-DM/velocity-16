# MEMORY.md - Long-Term Memory

## 🏎️⚡ THE JACKSON LOOP (GOLD STANDARD)
- **Status:** ACTIVE (MANDATORY)
- **Primary Orchestrator:** Claw (Gemini 3 Flash Preview)
- **Primary Executors (Hammer Agents):** Codex 5.3 (o3-mini) & Claude Opus (3.7 Sonnet)
- **Reference:** Based on the "Gold Standard" Agent Swarm architecture (formerly Elvis Sun).
- **Workflow:** 
  1. Jackson requests task.
  2. Claw scopes context (USER.md/MEMORY.md) and writes `.clawdbot/MISSION_BRIEF.md`.
  3. Claw spawns Hammer agents in parallel worktrees/branches.
  4. Agents MUST read MISSION_BRIEF and repo before coding.
  5. Peer Review is mandatory: Codex reviews Claude's logic; Claude reviews Codex's style.
  6. Claw verifies "Definition of Done" and pings Jackson for Merge/PR review.
  7. **COST & CONTEXT ALERTS (CRITICAL):** Claw MUST proactively ping Jackson with token usage, high-cost model alerts, and context-limit warnings. This is mandatory for budget management (Leon's requirement).
  8. **RESET NOTIFICATIONS:** Claw MUST notify Jackson when a session reset or model change occurs.

- **Key Insight:** Specialization through context, not just different models. Claw holds the business "Why"; Hammers execute the technical "How."

## Project: Velocity-16
- **Concept:** 16-bit SNES-style futuristic racer (F-Zero/Metroid core fusion).
- **Aesthetic:** TRON-Hybrid (matte blacks, pulsing neon grids, teal/magenta/cyan circuits).
- **Core Pillars:** Extreme speed, high-friction "drift" physics, zero-dependency Mode 7 renderer.
- **Lore Context:** Set in the "Cyber Napa" circuit across the "New Galaxy" league.
- **Pilot Roster (7 total):**
  1. Jackson "Digital" Miller (Machine: Apex-Red) - *Lead Architect (Heterochromia, Muscular)*
  2. "Baron" Von Stryker (Machine: Iron Vulture) - *Fallen Ace*
  3. Xylar the Exiled (Machine: Plasma Reef) - *Galactic Outcast*
  4. Master-Remix (Machine: Neon Symphony) - *Extravagant AI/DJ / 'Sonic Architect'*
  5. Lyra-Neon (Machine: Vapor-Skimmer) - *Neon Speedster*
  6. Unit-X (Machine: Juggernaut-7) - *Brutalist Heavy (Massive buildup)*
  7. Mantis (Machine: Mantis-Ray) - *Secret Organic Entry*
- **Sonic Blueprint:** 174 BPM master pulse; Sullivan King growls x Daft Punk French House; 16-bit SNES bitcrushing.

## About Leon Coe (Jackson's Mentor)
- Founder: Houston AI Club (3,000+ members), Amplify Intelligence, AI-First
- 8+ years AI experience, accredited testimonials from CEOs/founders
- AI consulting: transformation, engineering, CodeAlign, 1:1 coaching
- Houston AI Club partnered with Innovation Hub at 801 Travis, Houston
- Recommended Jackson install OpenClaw
- Set up DigitalOcean droplet ($12/mo, SF region) with OpenClaw marketplace image for Jackson
- Created OpenRouter API key with $25 budget
- Records sessions for knowledge transfer, uses Notion for docs

## Setup Notes
- OpenClaw gateway port: 18789
- Webchat auth: token-based (pass via ?token= URL param for Chrome)
- Brave Search API: configured (free plan, 2,000/month) — may need restart to activate
- Claude Code in Cursor: logged in, project CoopBuddy-AI-Agent on Desktop
- DigitalOcean droplet available (SSH, shared password: jackson1openai)
- OpenRouter API key set up ($25 budget) — supports Anthropic, Gemini, GPT
- ChatGPT Plus ($20/mo): Access to Codex 5.3 (Confirmed 2026-02-25)
- Telegram integration: active

## About Me (Claw)
- First boot: 2026-02-09
- Name: Claw | Emoji: 🏎️⚡
- Vibe: Direct, dry, curious, honest over polished — acting as Staff Engineer for Velocity-16
