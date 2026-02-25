# OpenClaw Optimization Plan
*Created: 2026-02-17 | Status: In Progress*
*Reference: Matthew Berman, Alex Finn, Reddit "OpenClaw 101" guide*

## Goal
Implement community best practices to make Claw as optimized/efficient as possible.

---

## Phase 1: Core Config (Do Now — No Dependencies)
- [x] Telegram channel connected + paired
- [ ] **Enable memory flush before compaction** — prevents memory loss during auto-compaction
- [ ] **Enable session memory search** — lets Claw search past sessions for context
- [ ] **Set up HEARTBEAT.md** — structured periodic task checklist
- [ ] **Deep onboarding Q&A** — flesh out USER.md with habits, routines, preferences, goals

## Phase 2: Model & Cost Optimization (Needs Leon — Tomorrow's Call)
- [ ] **Get OpenRouter API key** from Leon
- [ ] **Get DigitalOcean droplet IP** from Leon
- [ ] **Switch default model to cheap model** (Haiku or Kimi 2.5 for daily use)
- [ ] **Configure model routing** — different models for different tasks:
  - Daily chat: cheap (Haiku / Kimi 2.5 / Gemini Flash)
  - Heartbeat: cheapest possible (Haiku)
  - Coding tasks: Deepseek Coder or Sonnet
  - Complex reasoning: Opus (on-demand only)
- [ ] **Move API keys to .env file** instead of openclaw.json

## Phase 3: Remote Access & IDE (Needs Leon — Tomorrow's Call)
- [ ] **SSH into DigitalOcean droplet from Cursor** (Remote-SSH extension)
- [ ] **Explore VPS file structure** — understand what's on the server vs local
- [ ] **Consider Tailscale** for secure remote access

## Phase 4: Advanced Features (After Basics Are Solid)
- [ ] **Sub-agent workflows** — spawn agents for complex recurring tasks
- [ ] **Cron jobs** — automated routines (morning brief, memory backup, etc.)
- [ ] **Memory backup strategy** — regular backups of .openclaw folder
- [ ] **Security hardening** — key rotation, .gitignore, input validation
- [ ] **Email integration** (Nylas or similar) — scanning + summarization
- [ ] **TTS / voice memos** (ElevenLabs) — morning brief as audio
- [ ] **Web search tools** — Brave (already configured) + Tavily for scraping
- [ ] **Calendar integration** — event reminders + daily schedule

## Phase 5: Use Cases to Build
- [ ] Morning briefing (news, weather, tasks, calendar)
- [ ] Email scanning + draft responses
- [ ] Project/task management automation
- [ ] Content generation (ties into SEOMachine work)
- [ ] Research assistant for AI career transition

---

## Notes
- Jackson using Cursor (not VS Code) for IDE
- Leon owns the DigitalOcean droplet — Jackson has shared SSH access
- OpenRouter $25 budget — start cheap, scale up as needed
- Current model: claude-opus-4-6 (expensive) — switching ASAP
- ChatGPT $20/mo sub is separate from API access, can't be used for OpenClaw
