# 🗄️ DBMigrator-AI

> AI-powered database migration management with intelligent schema diffing, risk analysis, and automated rollback — powered by MiMo V2.5

## Why This Exists

Database migrations are one of the highest-risk operations in software engineering. A single overlooked column type change or missing index can cascade into hours of downtime, data loss, and broken production environments. Traditional migration tools execute blindly — they run SQL scripts without understanding the semantic impact of changes across your schema graph.

DBMigrator-AI brings intelligence to this critical workflow. By leveraging MiMo V2.5's deep reasoning capabilities, it doesn't just diff schemas — it *understands* them. It evaluates referential integrity constraints, detects cascading deletion risks, identifies performance regressions from index changes, and classifies each migration operation by severity and reversibility.

The result is a migration pipeline that thinks before it acts: generating detailed migration plans, assigning risk scores to each step, and maintaining battle-tested rollback procedures. Whether you're migrating a small SaaS database or orchestrating a multi-shard schema evolution across production clusters, DBMigrator-AI gives you the confidence to move fast without breaking things.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      DBMigrator-AI Pipeline                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │              │    │              │    │              │      │
│  │ Schema Diff  │───▶│  Migration   │───▶│  Execution   │      │
│  │   Engine     │    │    Plan      │    │   Engine     │      │
│  │              │    │              │    │              │      │
│  └──────────────┘    └──────────────┘    └──────┬───────┘      │
│         │                   │                   │              │
│         │                   │                   ▼              │
│         │                   │           ┌──────────────┐      │
│         ▼                   ▼           │              │      │
│  ┌──────────────────────────────┐       │  Rollback    │      │
│  │   Risk Assessment Layer      │◀──────│  Controller  │      │
│  │  (Severity · Reversibility)  │       │              │      │
│  └──────────────────────────────┘       └──────────────┘      │
│                                                                 │
│  Input: Source DB ◀──▶ Target DB                                │
│  Output: Migration Plan + Rollback Scripts                      │
└─────────────────────────────────────────────────────────────────┘
```

## Token Consumption Model

| Pipeline Stage      | Tokens per Run | Description                                       |
|---------------------|----------------|---------------------------------------------------|
| 🔍 Schema Diff      | 200K           | Parse DDL, compare columns, types, constraints    |
| 📋 Migration Plan   | 300K           | Generate ordered migration steps with risk scores |
| ⚡ Execute & Rollback| 150K           | Run operations + maintain rollback state          |
| **Total**           | **650K**       | End-to-end migration lifecycle                    |

## Features

- **Intelligent Schema Diff** — Visual comparison of source vs target schemas with color-coded additions, removals, and modifications
- **Risk Scoring Engine** — Every migration step classified by severity (low/medium/high/critical) with explainable reasoning
- **Migration Plan Generation** — Ordered, dependency-aware migration steps with estimated execution time
- **Automated Rollback** — Pre-generated inverse operations for every migration step, tested before execution
- **Execution Logging** — Real-time terminal-style log output with progress indicators and status tracking
- **Breaking Change Detection** — Identifies column drops, type narrowing, and FK violations before they hit production
- **Migration Status Dashboard** — Track pending, running, completed, and rolled-back migrations at a glance
- **Dark Mode DBA Theme** — Professional interface designed for late-night production deploys

## Tech Stack

- **Frontend** — Vanilla HTML5 / CSS3 / JavaScript (ES6+)
- **Styling** — Custom CSS with CSS Grid and Flexbox, dark-mode DBA theme
- **Logic** — Pure client-side JS, zero external dependencies
- **AI Engine** — MiMo V2.5 by Nous Research
- **Deployment** — Static files, works in any modern browser

## Quick Start

```bash
# Clone the repository
git clone https://github.com/nousresearch/DBMigrator-AI.git
cd DBMigrator-AI

# No build step needed — just open in your browser
open index.html

# Or serve with any static file server
python3 -m http.server 8080
# Then visit http://localhost:8080
```

## Project Structure

```
DBMigrator-AI/
├── index.html          # Main application shell & UI layout
├── style.css           # DBA-themed styles with dark mode
├── app.js              # Core migration logic & AI integration
└── README.md           # This file
```

---

> Built with MiMo V2.5 — [Nous Research](https://nousresearch.com)
