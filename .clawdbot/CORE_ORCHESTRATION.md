# THE JACKSON LOOP: MISSION_ORCHESTRATION_STANDARD
*Orchestrator: Claw 🏎️⚡ | Repository: Velocity-16 (and all future projects)*

## 🧩 THE 3-TIER ARCHITECTURE
### Tier 1: THE ORCHESTRATOR (Claw)
- **Model:** Gemini 3 Flash Preview (2M Context)
- **Role:** Holds the "Business Brain" (USER.md, MEMORY.md, Meeting Notes).
- **Function:** Writes the MISSION_BRIEF.md. Spawns specialized Tier 2 agents. Does NOT code directly; manages the "Fleet."

### Tier 2: THE EXECUTORS (The Swarm)
- **Codex 5.3:** For heavy lifting, multi-file refactors, and complex backend logic.
- **Claude Code:** For precision Frontend/UI, styling, and git operations.
- **Protocol:** Every task begins with `read` of MISSION_BRIEF.md and all relevant source files.

### Tier 3: THE VALIDATION LAYER
- **Peer Review:** Codex reviews Claude's logic; Claude reviews Codex's style.
- **Human-in-the-Loop:** Jackson provides final approval before any major "Merge" to the master project state.

## 🔄 THE 8-STEP WORKFLOW
1. **Request:** Jackson gives a goal to Claw.
2. **Scoping:** Claw checks MEMORY.md and project context.
3. **Mission Brief:** Claw generates `.clawdbot/MISSION_BRIEF.md`.
4. **Spawn:** Claw triggers `sessions_spawn` for Codex or Claude.
5. **Execution:** Agents work in parallel background sessions.
6. **Monitoring:** Claw monitors via the task registry.
7. **Cross-Review:** Agents peer-review each other's outputs.
8. **Notify:** Claw pings Jackson: "Task Complete. Ready for Merge."
