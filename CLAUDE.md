# CLAUDE.md

## Project Overview
- **Name**: TextBridge
- **Created**: Thu 04/16/2026
- **Description**: [Add project description here]

## Tech Stack
- Language: [e.g. Python / TypeScript / etc.]
- Framework: [e.g. React / FastAPI / etc.]
- Database: [e.g. PostgreSQL / SQLite / etc.]

## Architecture
```
TextBridge/
+-- src/              # Source code
|   +-- components/   # UI components
|   +-- utils/        # Utility functions
|   +-- services/     # Business logic / API calls
|   +-- types/        # Type definitions
|   +-- hooks/        # Custom hooks
|   +-- assets/       # Static assets
+-- tests/            # Test files
|   +-- unit/         # Unit tests
|   +-- integration/  # Integration tests
+-- docs/             # Documentation
+-- scripts/          # Automation scripts
+-- config/           # Configuration files
+-- logs/             # Log files
+-- .claude/          # Claude Code config
|   +-- skills/       # Project-specific skills
|   +-- agents/       # Sub-agents
|   +-- commands/     # Slash commands
```

## Coding Standards
- Use meaningful variable/function names
- Write tests for all new features
- Keep functions small and focused, single responsibility
- Document public APIs and complex logic
- Handle errors gracefully with proper logging

## Commands
- `[build command]` - Build the project
- `[test command]` - Run tests
- `[lint command]` - Run linter
- `[dev command]` - Start dev server

## Key Decisions
- [Document important architectural decisions here]

## Known Issues
- [Track known bugs or limitations]

## TODO
- [ ] Initial setup
- [ ] Core feature implementation
- [ ] Write tests
- [ ] Documentation


<!-- n8n-skills-section -->
## n8n MCP Connection

- **n8n instance:** https://n8n.srv1282987.hstgr.cloud
- **MCP server:** `n8n-mcp` via `npx n8n-mcp` (configured in `.mcp.json`)

## n8n Skills Available

| Skill | Activates when... |
|-------|-------------------|
| `n8n-expression-syntax`  | Writing `{{}}` expressions, `\$json`, `\$node`, webhook data |
| `n8n-mcp-tools-expert`   | Using MCP tools: search_nodes, validate, get_node, templates |
| `n8n-workflow-patterns`  | Building new workflows, choosing architecture patterns |
| `n8n-node-configuration` | Configuring nodes, property dependencies, operation fields |
| `n8n-validation-expert`  | Validation errors, fixing operator issues, debug loops |
| `n8n-code-javascript`    | Writing JavaScript in Code nodes |
| `n8n-code-python`        | Writing Python in Code nodes |

## Critical n8n Gotchas

- Webhook data: `\$json.body.*` - NOT `\$json.*` directly
- Code nodes: do NOT use `{{}}` - use direct JS/Python access
- Always return `[{ json: {...} }]` from Code nodes
