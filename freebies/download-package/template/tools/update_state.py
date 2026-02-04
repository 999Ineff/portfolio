#!/usr/bin/env python3
"""
State File Updater

Safely updates markdown state files without breaking table formatting.
Run this from your project root (where .claude/ folder is).

Usage:
    python update_state.py heartbeat <session_id>
    python update_state.py stage <task_id> <new_stage>
    python update_state.py complete <task_id>

Examples:
    python update_state.py heartbeat session-20240115-143022
    python update_state.py stage W001 implement
    python update_state.py complete W001
"""

import sys
import datetime
from pathlib import Path

# Config - assumes script is run from project root
CLAUDE_DIR = Path(".claude")
SESSIONS_FILE = CLAUDE_DIR / "SESSIONS.lock"
PIPELINE_FILE = CLAUDE_DIR / "PIPELINE_STATE.md"
QUEUE_FILE = CLAUDE_DIR / "WORK_QUEUE.md"

def get_timestamp():
    return datetime.datetime.now().isoformat()

def update_heartbeat(session_id):
    """Updates Last Heartbeat column for a session in SESSIONS.lock"""
    if not SESSIONS_FILE.exists():
        print(f"[ERROR] {SESSIONS_FILE} not found. Are you in the project root?")
        return False

    with open(SESSIONS_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    updated = False
    new_lines = []

    for line in lines:
        if f"| {session_id} " in line or f"|{session_id}|" in line:
            # Split by | and update the heartbeat column (4th data column)
            parts = line.split('|')
            if len(parts) >= 5:
                parts[4] = f" {get_timestamp()} "
                line = '|'.join(parts)
                updated = True
        new_lines.append(line)

    if updated:
        with open(SESSIONS_FILE, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"[OK] Heartbeat updated for {session_id}")
        return True
    else:
        print(f"[WARN] Session {session_id} not found in SESSIONS.lock")
        return False

def update_stage(task_id, new_stage):
    """Updates Stage column for a task in PIPELINE_STATE.md"""
    if not PIPELINE_FILE.exists():
        print(f"[ERROR] {PIPELINE_FILE} not found. Are you in the project root?")
        return False

    with open(PIPELINE_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update the Stage field in the Current section
    if f"Task ID:** {task_id}" in content or f"Task ID: {task_id}" in content:
        lines = content.split('\n')
        new_lines = []

        for line in lines:
            if line.strip().startswith("- **Stage:**") or line.strip().startswith("- Stage:"):
                line = f"- **Stage:** {new_stage}"
            new_lines.append(line)

        with open(PIPELINE_FILE, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))

        print(f"[OK] Task {task_id} stage updated to: {new_stage}")
        return True
    else:
        print(f"[WARN] Task {task_id} not found in PIPELINE_STATE.md Current section")
        return False

def mark_complete(task_id):
    """Mark a task as complete - clears PIPELINE_STATE and adds to history"""
    if not PIPELINE_FILE.exists():
        print(f"[ERROR] {PIPELINE_FILE} not found")
        return False

    with open(PIPELINE_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add to history and clear current
    timestamp = get_timestamp()
    history_entry = f"| {timestamp} | {task_id} | complete | DONE |"

    # Find the history table and add entry
    if "## History" in content:
        lines = content.split('\n')
        new_lines = []
        in_history = False
        added = False

        for line in lines:
            new_lines.append(line)
            if "## History" in line:
                in_history = True
            elif in_history and line.startswith("|") and "---" in line and not added:
                # Add after the header separator
                new_lines.append(history_entry)
                added = True

        content = '\n'.join(new_lines)

    # Clear the current section
    content = content.replace(f"Task ID:** {task_id}", "Task ID:** [none]")
    content = content.replace(f"**Stage:** ", "**Stage:** [none] <!-- was: ")

    with open(PIPELINE_FILE, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"[OK] Task {task_id} marked complete")
    return True

def show_help():
    print(__doc__)

def main():
    if len(sys.argv) < 2:
        show_help()
        sys.exit(1)

    command = sys.argv[1]

    if command == "heartbeat":
        if len(sys.argv) < 3:
            print("Usage: python update_state.py heartbeat <session_id>")
            sys.exit(1)
        update_heartbeat(sys.argv[2])

    elif command == "stage":
        if len(sys.argv) < 4:
            print("Usage: python update_state.py stage <task_id> <new_stage>")
            sys.exit(1)
        update_stage(sys.argv[2], sys.argv[3])

    elif command == "complete":
        if len(sys.argv) < 3:
            print("Usage: python update_state.py complete <task_id>")
            sys.exit(1)
        mark_complete(sys.argv[2])

    elif command in ["help", "-h", "--help"]:
        show_help()

    else:
        print(f"[ERROR] Unknown command: {command}")
        show_help()
        sys.exit(1)

if __name__ == "__main__":
    main()
