#!/usr/bin/env python3
"""
New Project Scaffolder

Creates a new project folder with the orchestrator template.
Useful when you want to start a new project with the full pipeline system.

Usage:
    python new_project.py "ProjectName"
    python new_project.py "ProjectName" --description "What it does"
    python new_project.py "ProjectName" --path "D:\Projects"

What it does:
1. Creates project folder at specified location
2. Copies the .claude/ template folder
3. Replaces [YOUR PROJECT NAME] placeholder
4. Initializes state files with timestamps
"""

import sys
import shutil
import os
import datetime
import argparse
from pathlib import Path

def get_timestamp():
    return datetime.datetime.now().isoformat()

def update_file_content(filepath, replacements):
    """Read file, replace placeholders, write back."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        for old, new in replacements.items():
            content = content.replace(old, new)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"[OK] Updated {filepath.name}")
    except Exception as e:
        print(f"[ERROR] {filepath.name}: {e}")

def initialize_state_file(filepath, header_content):
    """Write initial content to a state file."""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(header_content)
        print(f"[OK] Initialized {filepath.name}")
    except Exception as e:
        print(f"[ERROR] {filepath.name}: {e}")

def main():
    parser = argparse.ArgumentParser(description="Scaffold new project with orchestrator template")
    parser.add_argument("name", help="Project name")
    parser.add_argument("--path", help="Parent directory (default: current directory)", default=".")
    parser.add_argument("--description", help="Project description", default="[To be filled in]")

    args = parser.parse_args()

    project_name = args.name
    parent_dir = Path(args.path).resolve()
    target_dir = parent_dir / project_name

    # Find template location (relative to this script)
    script_dir = Path(__file__).parent.parent
    template_claude = script_dir / ".claude"

    print(f"\n=== Creating Project: {project_name} ===")
    print(f"Location: {target_dir}")

    # 1. Check if already exists
    if target_dir.exists():
        print(f"[ERROR] Directory already exists: {target_dir}")
        sys.exit(1)

    # 2. Create project folder
    try:
        target_dir.mkdir(parents=True)
        print("[OK] Created project folder")
    except Exception as e:
        print(f"[ERROR] Could not create folder: {e}")
        sys.exit(1)

    # 3. Copy .claude template
    target_claude = target_dir / ".claude"

    if not template_claude.exists():
        print(f"[ERROR] Template not found at: {template_claude}")
        print("Make sure this script is inside the orchestrator-template-bundle folder")
        sys.exit(1)

    shutil.copytree(template_claude, target_claude)
    print("[OK] Copied .claude/ template")

    # 4. Update placeholders in CLAUDE.md
    claude_md = target_claude / "CLAUDE.md"
    if claude_md.exists():
        replacements = {
            "[YOUR PROJECT NAME]": project_name,
        }
        update_file_content(claude_md, replacements)

    # 5. Add creation timestamp to state files
    timestamp = get_timestamp()

    sessions_file = target_claude / "SESSIONS.lock"
    if sessions_file.exists():
        with open(sessions_file, 'r', encoding='utf-8') as f:
            content = f.read()
        content = f"<!-- Initialized: {timestamp} -->\n" + content
        with open(sessions_file, 'w', encoding='utf-8') as f:
            f.write(content)

    print(f"\n=== Project {project_name} Created! ===")
    print(f"\nNext steps:")
    print(f"1. cd {target_dir}")
    print(f"2. Open .claude/CLAUDE.md")
    print(f"3. Fill in the PROJECT-SPECIFIC section")
    print(f"4. Start coding with your AI assistant!")

if __name__ == "__main__":
    main()
