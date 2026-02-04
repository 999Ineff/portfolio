#!/usr/bin/env python3
"""
Plan Parser

Analyzes PLAN.md (or IMPLEMENTATION_PLAN.md) to find tasks that can run in parallel.
Looks for dependency annotations and returns JSON with parallel-ready tasks.

Usage:
    python parse_plan.py
    python parse_plan.py --file IMPLEMENTATION_PLAN.md

Expected plan format:
    - [ ] Task description (T-001)
    - [ ] Dependent task (T-002) [depends: T-001]
    - [ ] Another task (T-003) [depends: T-001, T-002]

Output (JSON):
    {
        "all_tasks": [...],
        "ready_for_parallel": [...],  // Tasks with no dependencies
        "blocked": [...]              // Tasks waiting on others
    }
"""

import sys
import re
import json
import argparse
from pathlib import Path

def parse_plan(plan_file):
    """Parse a plan file and extract task dependencies."""

    if not plan_file.exists():
        return {"error": f"File not found: {plan_file}"}

    with open(plan_file, 'r', encoding='utf-8') as f:
        content = f.read()

    tasks = []
    lines = content.split('\n')

    for line in lines:
        line = line.strip()

        # Look for task lines: "- [ ] Description (T-001)" or "1. Description (T-001)"
        # Also handles "- Description (T-001)" without checkbox

        task_match = re.search(r'(?:- \[[ x]\]|- |\d+\.\s+)(.+?)(?:\(T-(\d+)\))?$', line)
        if not task_match:
            continue

        description = task_match.group(1).strip()

        # Extract task ID
        id_match = re.search(r'\(T-(\d+)\)', line)
        task_id = f"T-{id_match.group(1)}" if id_match else None

        if not task_id:
            # Try to find ID at start of description
            id_match = re.search(r'^T-(\d+)', description)
            task_id = f"T-{id_match.group(1)}" if id_match else None

        # Extract dependencies
        deps = []
        dep_match = re.search(r'\[depends?:?\s*([^\]]+)\]', line, re.IGNORECASE)
        if dep_match:
            dep_str = dep_match.group(1)
            # Find all T-### patterns
            deps = re.findall(r'T-\d+', dep_str, re.IGNORECASE)
            deps = [d.upper() for d in deps]
            # Remove dependency annotation from description
            description = re.sub(r'\s*\[depends?:?\s*[^\]]+\]', '', description, flags=re.IGNORECASE)

        # Clean up description
        description = re.sub(r'\s*\(T-\d+\)\s*', '', description).strip()

        if description:  # Only add if there's actual content
            task = {
                "id": task_id,
                "description": description,
                "dependencies": deps,
                "is_complete": "- [x]" in line.lower() or "- [X]" in line
            }
            tasks.append(task)

    # Categorize tasks
    incomplete_tasks = [t for t in tasks if not t['is_complete']]
    completed_ids = {t['id'] for t in tasks if t['is_complete'] and t['id']}

    # Find tasks ready for parallel (no incomplete dependencies)
    ready = []
    blocked = []

    for task in incomplete_tasks:
        unmet_deps = [d for d in task['dependencies'] if d not in completed_ids]
        if not unmet_deps:
            ready.append(task)
        else:
            task['waiting_on'] = unmet_deps
            blocked.append(task)

    return {
        "all_tasks": tasks,
        "ready_for_parallel": ready,
        "blocked": blocked,
        "completed": [t for t in tasks if t['is_complete']],
        "summary": {
            "total": len(tasks),
            "completed": len([t for t in tasks if t['is_complete']]),
            "ready": len(ready),
            "blocked": len(blocked)
        }
    }

def main():
    parser = argparse.ArgumentParser(description="Parse implementation plan for parallel tasks")
    parser.add_argument("--file", "-f", default="PLAN.md",
                       help="Plan file to parse (default: PLAN.md)")
    parser.add_argument("--pretty", "-p", action="store_true",
                       help="Pretty print JSON output")

    args = parser.parse_args()

    # Check multiple possible locations
    plan_files = [
        Path(args.file),
        Path("IMPLEMENTATION_PLAN.md"),
        Path("PLAN.md"),
        Path(".claude/PLAN.md"),
    ]

    plan_file = None
    for pf in plan_files:
        if pf.exists():
            plan_file = pf
            break

    if not plan_file:
        result = {"error": f"No plan file found. Tried: {[str(p) for p in plan_files]}"}
    else:
        result = parse_plan(plan_file)
        result["file_parsed"] = str(plan_file)

    if args.pretty:
        print(json.dumps(result, indent=2))
    else:
        print(json.dumps(result))

if __name__ == "__main__":
    main()
