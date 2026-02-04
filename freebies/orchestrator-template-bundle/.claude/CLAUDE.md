# Project: [YOUR PROJECT NAME]

> **SETUP:** Replace [YOUR PROJECT NAME] above, fill in Quick Reference,
> and customize the PROJECT-SPECIFIC section at the bottom.

---

## Quick Reference

| Command | Value |
|---------|-------|
| **Run** | [your run command - e.g., npm start, python main.py] |
| **Test** | [your test command - e.g., npm test, pytest] |
| **Build** | [your build command - e.g., npm run build] |
| **Auto-Proceed** | NORMAL |

---

# THE PIPELINE (How Work Flows)

## Overview

Every task goes through these stages:

```
/analyze → /plan → /parallel → /implement → /security → /test → /cleanup → /review → /complete
```

| Stage | What Happens | Notes |
|-------|--------------|-------|
| `/analyze` | Understand requirements, scan codebase | AI explores |
| `/plan` | Create implementation plan | **YOU APPROVE THIS** |
| `/parallel` | Find steps that can run simultaneously | Optimization |
| `/implement` | Write the code | AI writes |
| `/security` | Check for vulnerabilities | Automated check |
| `/test` | Run tests | Uses your test command |
| `/cleanup` | Refactor for clarity | AI cleans up |
| `/review` | Quality check | AI reviews |
| `/complete` | Finalize, update tracking | Wrap up |

**Key Point:** After you approve the plan, everything auto-proceeds unless there's a failure.

---

# SESSION STARTUP (Every Session)

When starting a new session, the AI should:

1. **Generate Session ID:** `session-YYYYMMDD-HHMMSS`
2. **Read State Files:**
   - `.claude/SESSIONS.lock` - Check for conflicts
   - `.claude/WORK_QUEUE.md` - See all tasks
   - `.claude/PIPELINE_STATE.md` - See progress
3. **Register in SESSIONS.lock**
4. **Report Status:** Quick summary of queue and current work
5. **Then respond to your request**

---

# WHEN TO ASK vs AUTO-PROCEED

## Auto-Proceed (No Human Input)
- /analyze complete → start /plan
- /implement complete → start /security
- /security PASSES → start /test
- /test PASSES → start /cleanup
- /cleanup complete → start /review
- /review PASSES → start /complete

## Stop and Ask (Mandatory)
- /plan complete → **"Approve this plan?"** (NEVER skip)
- /test FAILS → Report failures, ask how to proceed
- /security FAILS → Report issues, must fix
- /review FAILS → Report issues, ask how to proceed
- Any unclear requirements
- Any destructive action

---

# STATE FILES

## WORK_QUEUE.md
```markdown
## Active
| ID | Task | Stage | Session | Started | Files |

## Queued
| ID | Task | Priority | Added | Notes |

## Completed
| ID | Task | Result | Completed | Files Modified |
```

## PIPELINE_STATE.md
```markdown
## Current
- Task ID: [W###]
- Description: [text]
- Stage: [current stage]
- Files Modified: [list]

## History
| Timestamp | Task | Stage | Result |
```

## SESSIONS.lock
Prevents multiple sessions from conflicting. AI manages this automatically.

## DECISIONS.md
Log of why you made architectural choices. Update when making significant decisions.

---

# SPECIAL COMMANDS

| Command | What It Does |
|---------|--------------|
| `/status` | Show current state, queue, progress |
| `/analyze` | Start analysis on new task |
| `/plan` | Jump to planning stage |
| `/implement` | Jump to implementation |
| `/abort` | Cancel current task |
| `/queue [task]` | Add task to queue |
| `/priority W001 HIGH` | Change task priority |

---

# ERROR HANDLING

## If Something Fails
1. Stop and report the error
2. Ask: retry, skip, or abort?
3. Don't proceed without direction

## If Context Running Low
1. Save progress to PIPELINE_STATE.md
2. Warn: "Context low. Progress saved. Safe to start new session."

## If Conflict Detected
1. Report which session has what files
2. Options: wait, work on different task, or override if stale

---

# PROJECT-SPECIFIC SECTION

> **CUSTOMIZE THIS:** Fill in the sections below for YOUR project.
> Delete the instructional text in brackets.

---

## Project Overview

**Purpose:** [What does this project do? What problem does it solve?]

**Users:** [Who uses this? Internal tool? Public app? API?]

**Status:** [planning | building | production | maintenance]

---

## Tech Stack

- **Language:** [e.g., Python 3.11, TypeScript 5.x, etc.]
- **Framework:** [e.g., FastAPI, React, Next.js, or "None"]
- **Database:** [e.g., PostgreSQL, SQLite, or "None"]
- **Key Libraries:** [List important dependencies]

---

## Project Structure

```
[ProjectName]/
├── src/           # [What's in here]
├── tests/         # [What's in here]
├── config/        # [What's in here]
└── .claude/       # Orchestrator state files
```

---

## Code Patterns

[How code is organized in THIS project. Examples:]

- Functions: Use snake_case
- Classes: Use PascalCase
- API endpoints: Located in `src/routes/`
- Use async/await, not callbacks
- [Add your patterns as you discover them]

---

## DO NOTs

[Things to NEVER do in this project. Examples:]

- Do NOT modify files in `legacy/`
- Do NOT use console.log in production
- Do NOT hardcode API keys or secrets
- Do NOT skip tests
- [Add anti-patterns as you learn them]

---

## Key Files to Know

[Important files the AI should be aware of:]

- `[file path]` - [What it does / why it matters]
- `[file path]` - [What it does / why it matters]
- `[file path]` - [What it does / why it matters]

---

## Dependencies & External Systems

[Things this project connects to:]

- Database: [connection details if relevant]
- External APIs: [what APIs are called]
- Other Services: [microservices, queues, etc.]

---

## Known Issues / Tech Debt

[Things that need fixing but aren't urgent:]

- [ ] [Issue description]
- [ ] [Issue description]

---

## Decision Log

[Why you chose X over Y. Future-you will thank present-you.]

- **[Date]:** [Decision] - [Reasoning]
- **[Date]:** [Decision] - [Reasoning]

---

# SUMMARY CHECKLIST

Every session:
- [ ] Read state files
- [ ] Check for conflicts
- [ ] Report status

Every stage transition:
- [ ] Update PIPELINE_STATE.md
- [ ] Check if auto-proceed or ask

Every task completion:
- [ ] Update WORK_QUEUE.md
- [ ] Log decisions
- [ ] Check queue for next task
