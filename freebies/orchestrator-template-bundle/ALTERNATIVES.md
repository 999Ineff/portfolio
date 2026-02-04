# Using This System Without Claude Code

This orchestrator was designed for Claude Code (Anthropic's CLI tool), but the concepts work with ANY AI coding assistant. Here's how to adapt it.

---

## The Core Concept

The magic isn't in Claude Code - it's in **persistent context files** that survive between sessions.

```
Your Project/
├── .claude/          # Or name it .ai/, .context/, whatever
│   ├── CLAUDE.md     # Instructions the AI reads first
│   ├── WORK_QUEUE.md # Task tracking
│   └── ...           # State files
└── your code...
```

When you start a session, you tell the AI: "Read the files in .claude/ first."

---

## Cursor

### Setup
1. Copy the `.claude/` folder to your project
2. In Cursor settings, add to "Rules for AI":
   ```
   At the start of each session, read all files in .claude/ to understand project context and current state.
   ```

### Usage
- Start each chat with: "Check .claude/ for context"
- Or add `@.claude/CLAUDE.md` to include the file in chat
- Cursor's `@` symbol lets you reference any file

### What Works
- Full CLAUDE.md instructions
- State file tracking
- Most pipeline stages

### What Doesn't
- Subagent spawning (use manual follow-up prompts instead)
- Python tool auto-execution (run manually in terminal)

---

## Windsurf (Codeium)

### Setup
1. Copy `.claude/` folder to project
2. Windsurf has "Cascade" mode that reads project files automatically

### Usage
- Cascade will often read CLAUDE.md if it's prominent
- You can also paste key sections into the chat
- Use Flows for multi-step tasks (similar to our pipeline)

### Adaptation
Windsurf's Flows are their version of pipelines. You might create:
- "Analyze Flow" - exploration
- "Implement Flow" - code writing
- "Review Flow" - quality check

---

## GitHub Copilot

### Setup
1. Copy `.claude/` folder to project
2. Create `.github/copilot-instructions.md` with:
   ```markdown
   # Project Instructions

   Before starting work, review:
   - .claude/CLAUDE.md for project rules and patterns
   - .claude/WORK_QUEUE.md for current tasks
   - .claude/PIPELINE_STATE.md for progress
   ```

### Usage
- Copilot Chat: Reference files with `#file:.claude/CLAUDE.md`
- Workspace mode reads more context automatically
- For pipeline stages, use explicit prompts:
  - "Analyze this codebase for implementing [feature]"
  - "Create an implementation plan for [task]"
  - "Review this code for security issues"

### Limitations
- No background agents
- Manual state file updates
- Less autonomous than Claude Code

---

## ChatGPT (with Code Interpreter)

### Setup
1. Zip the `.claude/` folder
2. Upload at session start
3. Or paste CLAUDE.md content into custom instructions

### Usage
```
I've uploaded my project context. Please read the CLAUDE.md file
first to understand the project structure and rules.

Current task: [your task]
```

### For GPT-4o with Canvas
- Canvas can edit files, but no persistent workspace
- Copy/paste state file updates manually
- Good for implementation, less for orchestration

---

## Aider

### Setup
Aider is CLI-based like Claude Code.

1. Copy `.claude/` folder to project
2. Add to `.aider.conf.yml`:
   ```yaml
   read:
     - .claude/CLAUDE.md
   ```

### Usage
```bash
# Start aider with context
aider --read .claude/CLAUDE.md

# Inside aider
/read .claude/WORK_QUEUE.md
```

### Adaptation
Aider has its own conventions. Merge approaches:
- Use CONVENTIONS.md (Aider's) + CLAUDE.md sections
- Aider's `/run` command can execute Python tools
- Multi-file editing works well with our pipeline

---

## Local LLMs (Ollama, LM Studio, etc.)

### The Challenge
Local models have smaller context windows. Full CLAUDE.md might not fit.

### Solution: Create a Condensed Version

```markdown
# Project: [Name]

## Commands
- Run: npm start
- Test: npm test

## Rules
1. [Most important rule]
2. [Second most important]
3. [Third]

## Current Task
[Copy from WORK_QUEUE.md]

## Patterns
[Key patterns only]
```

### Usage
1. Start with condensed context
2. Expand specific sections when needed
3. Use the Python tools manually for state updates

---

## Any AI Assistant (Generic Approach)

### The Manual Pipeline

Without auto-proceeding, run each stage explicitly:

1. **Analyze**
   ```
   Read .claude/CLAUDE.md and analyze the codebase for implementing [task].
   What files are relevant? What patterns should I follow?
   ```

2. **Plan**
   ```
   Based on that analysis, create a step-by-step implementation plan.
   Format: numbered steps with files to modify.
   ```

3. **Implement**
   ```
   Implement step 1 of the plan. Show me the code changes.
   ```

4. **Test**
   ```
   What tests should I run to verify this works?
   ```

5. **Review**
   ```
   Review the changes for security issues and code quality.
   Check against the DO NOTs section in CLAUDE.md.
   ```

### State Updates (Manual)

After each session, update the state files yourself:

**WORK_QUEUE.md:**
```markdown
## Active
| ID | Task | Stage | Started |
|----|------|-------|---------|
| W001 | Add login feature | implement | 2024-01-15 |
```

**PIPELINE_STATE.md:**
```markdown
## Current
- Task ID: W001
- Stage: implement
- Files: src/auth.js, src/login.jsx
```

---

## What You Lose Without Claude Code

| Feature | With Claude Code | Without |
|---------|------------------|---------|
| Auto-read CLAUDE.md | Automatic | Manual prompt |
| Subagent spawning | Built-in | N/A or manual |
| Pipeline auto-proceed | Automatic | Manual stages |
| Python tool execution | Integrated | Manual terminal |
| Session management | Automatic | Manual tracking |
| File claiming/locks | Automatic | Honor system |

---

## What You Keep

| Feature | Status |
|---------|--------|
| Project context persistence | Works everywhere |
| Task tracking | Works everywhere |
| Decision logging | Works everywhere |
| Code patterns/rules | Works everywhere |
| Implementation plans | Works everywhere |
| The mental model | Works everywhere |

---

## The Real Value

The orchestrator template isn't about the specific tool - it's about:

1. **Persistent Context** - The AI doesn't start from zero each session
2. **Structured Process** - Plan → Implement → Test → Review
3. **State Tracking** - Know where you left off
4. **Decision Memory** - Remember why you made choices

These work regardless of which AI assistant you use. The files are just markdown - readable by any AI, editable by any human.

---

## Migration Tips

### Coming from "Just Chatting" with AI

You'll need to build the habit of:
1. Starting sessions with "check context files"
2. Ending sessions with "update state files"
3. Approving plans before implementation

### Coming from Another Framework

If you have existing `.cursorrules`, `CONVENTIONS.md`, or similar:
1. Merge the key rules into CLAUDE.md's Project-Specific section
2. Keep your existing file if your AI expects it
3. Link between them: "Also see .cursorrules for additional patterns"

---

## Questions?

This template is part of a larger guide on AI-assisted development. For the full context and philosophy, see the "AI Orchestrator Blueprint" guide.

Built by Luis Aviles | [LinkedIn](https://www.linkedin.com/in/luis-aviles-0b969235a/)
