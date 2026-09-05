# 建立 Host-neutral 的標準 MCP App

McpApp 依開放的 MCP Apps 標準實作，不把 ChatGPT 或 Codex 的專屬介面當作核心依賴。MCP Server 以 `_meta.ui.resourceUri` 將選定工具連到 `ui://` HTML Resource；React 與 Vite 建置的 Project Console 透過 `@modelcontextprotocol/ext-apps` 所提供的標準 `ui/*` JSON-RPC bridge 與 Host 溝通。所有 MCP Tools 在沒有 UI 的客戶端也必須可完整使用；Host 專屬能力一律先做 capability detection，並提供標準退化路徑，不依 Host 名稱分支。

MVP 使用 MCP Apps `basic-host` 進行本機 UI 開發並驗證完整 write tools，以 Codex 作為不呈現 UI 的 Host Agent 驗證端到端開發流程，另以 ChatGPT Pro 驗證目前可用的對話、UI 與 read/fetch 相容性。由於 ChatGPT 不直接連線本機 MCP Server，後續驗證需以 Secure MCP Tunnel 提供可連線端點；依 ADR-0057，M0 不啟用 Tunnel，必須在 M0 完成並重新決定遠端授權後才能加入。ChatGPT 方案、管理員權限、寫入確認與 Beta 限制視為 Host 驗證條件，不滲入領域規則，也不降低 write workflow 的功能範圍。未來 Host 開放所需能力時，必須能沿用相同工具與 UI 完成整合驗收。OpenAI Plugin 封裝是後續發佈方式，不是 McpApp 的核心產品身分。本決策取代 ADR-0001。

所有 Host 共用的 Server transport、程序生命週期與 Tunnel 啟用邊界由 ADR-0050 定義。

依 ADR-0059，核准與純 UI 互動使用標準 MCP Apps app-only visibility；一般領域能力仍提供 Agent-visible 工具，兩者呼叫相同 application command，不建立 Host 專屬業務邏輯。

依 ADR-0061，McpApp 也不把本 Repository 使用的 Codex skill 套件變成產品執行時依賴；跨 Host 的一致性由工具、產物、狀態轉移、核准與 Evidence 契約保證。
