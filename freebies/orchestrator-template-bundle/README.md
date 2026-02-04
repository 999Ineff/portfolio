# AI Project Orchestrator Template

> **A complete system for managing complex AI-assisted development projects**

This template transforms how you work with AI coding assistants. Instead of one-off conversations that lose context, you get a persistent system that tracks tasks, manages state, and maintains continuity across sessions.

---

## What's Inside

```
orchestrator-template-bundle/
├── .claude/                      # Core orchestrator files
│   ├── CLAUDE.md                 # Main instructions (AI reads this first)
│   ├── WORK_QUEUE.md             # Task tracking
│   ├── PIPELINE_STATE.md         # Progress tracking
│   ├── SESSIONS.lock             # Multi-session coordination
│   └── DECISIONS.md              # Decision log
├── tools/                        # Python automation scripts
│   ├── new_project.py            # Scaffold new projects
│   ├── update_state.py           # Safe state file updates
│   └── parse_plan.py             # Dependency analysis
├── examples/                     # Example configurations
│   └── sample-project-config.md  # How to customize for your project
├── README.md                     # You're reading it
└── ALTERNATIVES.md               # Guide for non-Claude Code users
```

---

## Quick Start (5 Minutes)

### Step 1: Copy to Your Project

Copy the `.claude/` folder to your project root:

```bash
# Windows
xcopy /E /I ".claude" "C:\path\to\your-project\.claude"

# Mac/Linux
cp -r .claude /path/to/your-project/.claude
```

### Step 2: Customize CLAUDE.md

Open `.claude/CLAUDE.md` and update the **PROJECT-SPECIFIC** section at the bottom:

```markdown
## Project Overview
- **Purpose:** [What does this project do?]
- **Status:** [planning | building | production]

## Quick Reference
- **Run:** npm start (or whatever runs your project)
- **Test:** npm test (or your test command)
- **Build:** npm run build (or your build command)
```

### Step 3: Start a Session

Open Claude Code (or your preferred AI assistant) in your project folder. The AI will:

1. Automatically read `.claude/CLAUDE.md`
2. Initialize a session ID
3. Check state files for any in-progress work
4. Report status and await your instructions

---

## The 9-Stage Pipeline

Every task flows through these stages:

| Stage | What Happens | Who Runs It |
|-------|--------------|-------------|
| `/analyze` | Understand requirements, scan codebase | AI Agent |
| `/plan` | Create implementation plan | AI (you approve) |
| `/parallel` | Find steps that can run simultaneously | AI + Python |
| `/implement` | Write the code | AI |
| `/security` | Check for vulnerabilities | AI Agent |
| `/test` | Run tests, verify it works | AI |
| `/cleanup` | Refactor for clarity | AI Agent |
| `/review` | Quality check | AI |
| `/complete` | Finalize, update tracking | AI + Python |

**You only need to approve once:** After `/plan`, everything else auto-proceeds unless there's a failure.

---

## State Files Explained

### WORK_QUEUE.md
Your task backlog. Three sections:
- **Active:** Currently being worked on
- **Queued:** Waiting to start
- **Completed:** Done (with history)

### PIPELINE_STATE.md
Where are we in the pipeline? Tracks:
- Current task ID
- Current stage
- Files being modified

### SESSIONS.lock
Prevents conflicts when multiple AI sessions might overlap. Tracks:
- Active session IDs
- Which files are "claimed"
- Last heartbeat timestamp

### DECISIONS.md
Log of architectural decisions. Why did we choose approach A over B? Future-you will thank present-you.

---

## Common Commands

| Command | What It Does |
|---------|--------------|
| `/status` | Show current state, queue, progress |
| `/analyze` | Start analysis on a new task |
| `/plan` | Jump to planning stage |
| `/implement` | Jump to implementation |
| `/abort` | Cancel current task |
| `/queue [task]` | Add task to queue |
| `/priority W001 HIGH` | Change task priority |

---

## Using the Python Tools

### new_project.py
Scaffold a new project with the orchestrator template:

```bash
python tools/new_project.py "MyNewProject"
python tools/new_project.py "MyNewProject" --description "What it does"
python tools/new_project.py "MyNewProject" --path "D:\Projects"
```

### update_state.py
Safely update state files without breaking markdown tables:

```bash
# Must run from project root (where .claude/ folder is)
python tools/update_state.py heartbeat session-20240115-143022
python tools/update_state.py stage W001 implement
```

### parse_plan.py
Analyze a plan for parallel execution opportunities:

```bash
# Must have PLAN.md in project root
python tools/parse_plan.py
# Returns JSON: { "all_tasks": [...], "ready_for_parallel": [...] }
```

---

## Customization

### Auto-Proceed Levels

Control how autonomous the AI is:

```markdown
## Quick Reference
- **Auto-Proceed:** NORMAL
```

| Level | Behavior |
|-------|----------|
| `CAUTIOUS` | Ask before every stage transition |
| `NORMAL` | Auto-proceed on safe transitions, ask at decision points |
| `AUTONOMOUS` | Only ask on failures or plan approval |

### Adding Custom Commands

Create a file in `.claude/commands/my-command.md`:

```markdown
# /my-command

**Purpose:** What this command does

**Steps:**
1. First step
2. Second step

**Output:** What to return
```

### Adding Custom Agents

Create a file in `.claude/agents/my-agent.md`:

```markdown
# My Agent

**Purpose:** What this agent specializes in

**Capabilities:**
- Skill 1
- Skill 2

**How to Use:**
Spawn via Task tool with subagent_type: "general-purpose"
```

---

## Best Practices

### Do This
- Fill in the Project Overview section completely
- Keep DECISIONS.md updated with "why" not just "what"
- Use the pipeline stages - they exist to catch issues early
- Let the AI auto-proceed through passing stages

### Don't Do This
- Don't delete state files mid-session (causes confusion)
- Don't manually edit markdown tables (use the Python tools)
- Don't skip `/plan` approval (the one mandatory checkpoint)
- Don't run multiple Claude Code sessions on the same project simultaneously

---

## Troubleshooting

### "Session conflict detected"
Another session is active. Options:
1. Wait for it to finish
2. If it's stale (>30 min old), the new session can override
3. Manually clear SESSIONS.lock if you're sure nothing else is running

### "State file corrupted"
The markdown table got malformed. Fix:
1. Check for extra/missing `|` characters
2. Ensure header row matches data rows
3. Or delete the file - it will be recreated

### AI doesn't see the CLAUDE.md
Make sure:
1. The file is named exactly `CLAUDE.md` (not `claude.md`)
2. It's inside the `.claude/` folder
3. The `.claude/` folder is in your project root

---

## How This Was Built

This system evolved from real-world use managing multiple AI-assisted projects. Key insights:

1. **AI context is precious** - Don't waste it re-explaining the project every session
2. **State must persist** - Text files that both AI and humans can read/edit
3. **Mechanical tasks should be code** - Python handles table updates, AI handles thinking
4. **One approval point** - Plan approval is the gate; everything else flows

---

## Credits

Built by Luis Aviles | [Portfolio](https://luis-aviles-portfolio.netlify.app) | [LinkedIn](https://www.linkedin.com/in/luis-aviles-0b969235a/)

Part of the "AI Orchestrator Blueprint" guide series.

---

## License

MIT License - Use freely, modify as needed, no attribution required.
