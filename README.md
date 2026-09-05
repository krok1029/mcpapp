# McpApp

McpApp is a local-first control system for AI-native software delivery. It coordinates structured specifications, human approval gates, controlled repository operations, verification evidence, review, and traceability while keeping the project owner in control of consequential decisions.

The Project Console uses React and the Vite 8 toolchain: Rolldown-powered builds, Oxc-powered React transforms, Vitest, Oxlint, Oxfmt, Testing Library, and Playwright.

The project is currently bootstrapping its M0 runtime foundation. Product requirements and architectural decisions live in [`CONTEXT.md`](CONTEXT.md), [`docs/adr/`](docs/adr/), and [`.scratch/`](.scratch/).

## Prerequisites

- Node.js 24 LTS
- NVM
- Corepack

## Development

```sh
nvm use
corepack yarn install --immutable
corepack yarn dev:ui
corepack yarn typecheck
corepack yarn lint
corepack yarn format:check
corepack yarn test
corepack yarn test:coverage
corepack yarn build
corepack yarn test:e2e
```

`yarn dev` starts the foreground McpApp Server on
`http://127.0.0.1:3100/mcp`. MCP clients can initialize over Streamable HTTP
and call the read-only `runtime_status` tool for the Server readiness and
version. Stop the Server with `Ctrl-C`.

## License

Apache-2.0
