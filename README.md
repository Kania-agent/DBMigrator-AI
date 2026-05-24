# DBMigrator-AI

![DBMigrator-AI banner](assets/banner.png)

> **Powered by MiMo** — built on top of Xiaomi's [MiMo](https://platform.xiaomimimo.com) reasoning models for intelligent database schema analysis and migration planning.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Powered by MiMo](https://img.shields.io/badge/Powered%20by-MiMo-ff6b35.svg)](https://platform.xiaomimimo.com)

---

## Why MiMo

Database migrations are one of the riskiest operations in production systems. A single missed foreign key dependency or an incorrectly typed column can cascade into hours of downtime. MiMo V2.5 brings deep reasoning capabilities that can trace complex schema dependency graphs, identify subtle data-type incompatibilities between source and target databases, and produce migration plans that respect referential integrity at every step.

Traditional migration tools rely on static diffing — they compare two schemas and emit ALTER statements. MiMo goes further by understanding the *intent* behind schema changes. When a column is renamed, split, or merged, MiMo reasons about the semantic relationship and generates data transformation logic, not just DDL. This eliminates the most common class of migration bugs that slip past conventional tooling.

MiMo V2.5's chain-of-thought reasoning also excels at rollback planning. For every forward migration step, it generates a tested reverse operation and validates that the rollback path is safe. This gives engineering teams the confidence to ship schema changes to production without fear of irreversible damage. The model can also detect when a rollback is impossible (e.g., after data deletion) and flag those steps explicitly so teams can make informed decisions.

---

## Token Consumption

| Agent | Model | Tokens/run | Frequency | Daily/user |
|---|---|---|---|---|
| Schema Analyzer | MiMo V2.5 | 4,200 | Per migration | ~8,400 |
| Migration Planner | MiMo V2.5 | 3,800 | Per migration | ~7,600 |
| Rollback Generator | MiMo V2.5 | 2,500 | Per migration | ~5,000 |

---

## What it does

DBMigrator-AI analyzes source and target database schemas, identifies structural differences, and generates safe, ordered migration scripts. It handles cross-database migrations (PostgreSQL ↔ MySQL ↔ SQLite), complex column transformations, index recreation, and automatic rollback generation — all with MiMo-powered reasoning to catch edge cases that static tools miss.

---

## Why this exists

Every engineering team has a war story about a migration that went wrong — a column dropped before data was copied, a constraint added before backfill completed, a type change that silently truncated data. DBMigrator-AI exists because schema migrations deserve the same level of intelligent analysis that we apply to application code. Manual migration authoring is error-prone, and static diff tools lack the reasoning depth to handle real-world complexity.

---

## Features

- **Intelligent schema diffing** — understands semantic changes, not just structural ones
- **Cross-database migration** — PostgreSQL, MySQL, MariaDB, SQLite, and MongoDB
- **Dependency-aware ordering** — topologically sorts migration steps to respect foreign keys
- **Automatic rollback generation** — every forward step gets a tested reverse operation
- **Data transformation logic** — generates Python/SQL transforms for column splits, merges, and type changes
- **Dry-run mode** — previews migration plan without executing any changes
- **CI/CD integration** — GitHub Actions and GitLab CI templates included
- **Migration history tracking** — stores executed migrations in a versioned registry
- **Conflict resolution** — detects and resolves concurrent migration conflicts
- **Pre-flight validation** — checks database connectivity, permissions, and disk space before running

---

## Tech Stack

- **Python 3.11+** — core runtime
- **MiMo V2.5** — schema analysis and migration planning via Xiaomi API
- **SQLAlchemy** — database abstraction and introspection
- **Alembic** — migration execution engine
- **Pydantic** — configuration and schema validation
- **Rich** — terminal UI for migration previews
- **pytest** — testing framework
- **Docker** — containerized test databases

---

## Quickstart

```bash
# Clone and install
git clone https://github.com/yuroo-shield/DBMigrator-AI.git
cd DBMigrator-AI
pip install -e ".[dev]"

# Set your MiMo API key
export MIMO_API_KEY="your-key-here"

# Analyze a migration
dbmigrator analyze \
  --source "postgresql://user:pass@localhost:5432/old_db" \
  --target "postgresql://user:pass@localhost:5432/new_db"

# Generate and preview migration plan
dbmigrator plan \
  --source "postgresql://user:pass@localhost:5432/old_db" \
  --target "postgresql://user:pass@localhost:5432/new_db" \
  --dry-run

# Execute migration with rollback support
dbmigrator migrate \
  --source "postgresql://user:pass@localhost:5432/old_db" \
  --target "postgresql://user:pass@localhost:5432/new_db" \
  --enable-rollback
```

---

## Project Structure

```
DBMigrator-AI/
├── assets/
│   └── banner.png
├── dbmigrator/
│   ├── __init__.py
│   ├── analyzer.py        # Schema introspection and diffing
│   ├── planner.py         # MiMo-powered migration planning
│   ├── executor.py        # Migration execution engine
│   ├── rollback.py        # Rollback generation and management
│   ├── transforms.py      # Data transformation logic
│   ├── registry.py        # Migration history tracking
│   ├── preflight.py       # Pre-flight validation checks
│   └── config.py          # Configuration management
├── templates/
│   ├── migration.sql.j2   # Migration SQL templates
│   └── rollback.sql.j2    # Rollback SQL templates
├── tests/
│   ├── test_analyzer.py
│   ├── test_planner.py
│   ├── test_executor.py
│   └── conftest.py
├── docker-compose.yml      # Test database containers
├── pyproject.toml
└── README.md
```

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. Run the test suite before submitting PRs:

```bash
# Run tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=dbmigrator --cov-report=html
```

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
