---
name: OpenCode MCPs & Plugins
description: Configure MCP servers and plugins in opencode.json for OpenCode agent
---

## Overview

This skill sets up the `opencode.json` configuration file with MCP servers, plugins, and skill sources for OpenCode.

## Configuration

The `opencode.json` file should include:

1. **MCP Servers** - External tools/services OpenCode can call
2. **Plugins** - OpenCode extensions that add functionality
3. **Skills Sources** - Additional directories/URLs for skill discovery

## Example Structure

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "github": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-github"]
      },
      "filesystem": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dirs"]
      }
    }
  },
  "plugins": [
    "opencode-plugin-github",
    "opencode-plugin-linear"
  ],
  "skills": [
    "./.opencode/skills",
    "~/.config/opencode/skills",
    "https://github.com/opencode-ai/skills-catalog/"
  ]
}
```

## Workflow

1. Check if `opencode.json` exists in project root
2. Add/configure MCP servers based on project needs
3. Add plugins for extended functionality
4. Configure skill sources for custom/reusable skills
5. Validate JSON syntax

## Common MCP Servers

| Server | Purpose | Package |
|--------|---------|---------|
| GitHub | Repository operations | `@modelcontextprotocol/server-github` |
| Filesystem | File operations | `@modelcontextprotocol/server-filesystem` |
| Postgres | Database queries | `@modelcontextprotocol/server-postgres` |
| SQLite | Local database | `@modelcontextprotocol/server-sqlite` |
| Slack | Team communication | `@modelcontextprotocol/server-slack` |
| Notion | Knowledge base | `@modelcontextprotocol/server-notion` |

## Notes

- MCP servers run as subprocesses via stdio
- Plugins are npm packages prefixed with `opencode-plugin-`
- Skills arrays from all discovered configs are combined (not replaced)
- Relative paths resolve from OpenCode working directory
- HTTP catalogs must serve an `index.json` at the base URL