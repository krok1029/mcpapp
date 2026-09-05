# 使用 Yarn Workspaces 與 Turborepo 管理模組化單體

McpApp 使用 Yarn Workspaces 管理 `mcp-server`、`mcp-ui` 與 domain、application、storage、github、stack-typescript、graph、contracts 等 packages，並以 Turborepo 編排與快取 Build、Test、Lint、Typecheck。系統保持單一部署與工作流邊界，不拆成微服務；Turborepo 不承載業務邏輯。
