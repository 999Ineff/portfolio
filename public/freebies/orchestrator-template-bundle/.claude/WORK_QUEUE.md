# Work Queue

> Task tracking across sessions. Update after completing or adding work.

---

## Active

| ID | Task | Stage | Session | Started | Files |
|----|------|-------|---------|---------|-------|
| | | | | | |

---

## Queued

| ID | Task | Priority | Added | Notes |
|----|------|----------|-------|-------|
| | | | | |

**Priority levels:** URGENT, HIGH, MEDIUM, LOW

**Notes can include:**
- `DEPENDS: W001` - Can't start until W001 completes
- `BLOCKED` - Waiting on external input
- `PARALLEL OK` - Can run alongside current work

---

## Completed

| ID | Task | Result | Completed | Files Modified |
|----|------|--------|-----------|----------------|
| | | | | |

**Result values:** DONE, ABORTED, REVERTED, HOTFIX

---

## How to Use

### Adding a Task
1. Generate next ID (W001, W002, etc.)
2. Add to Queued with priority
3. Note any dependencies

### Starting a Task
1. Move from Queued to Active
2. Fill in Session ID and Started time
3. Update PIPELINE_STATE.md

### Completing a Task
1. Move from Active to Completed
2. Fill in Result and Files Modified
3. Clear PIPELINE_STATE.md
4. Check queue for next task
