# 以互補的 Host 路徑驗證 MVP

由於專案擁有者使用 ChatGPT Pro，而目前 ChatGPT Pro 的自訂 MCP 連線只允許 read/fetch，MVP 不要求單一 Host 同時完成對話、MCP App UI 與 write workflow。Codex 透過無 UI 的 MCP Tools 驗證從 Spec 到合併 PR 的完整 Agent 執行；MCP Apps `basic-host` 驗證 Project Console、核准互動與所有 write tools；ChatGPT Pro 在 M0 完成並重新決定遠端授權後，才經由 Secure MCP Tunnel 驗證目前可用的對話、UI 呈現與 read/fetch 相容性。三條路徑共用相同 contracts、工作流狀態與權限規則，不建立 Host 專屬領域分支。

這項拆分是外部 Host 能力的測試限制，不是降低產品要求。當 ChatGPT Pro 或其他目標 Host 提供完整 write/modify 能力時，加入整合路徑驗證同一段完整工作流，不重寫 Server 或 UI。

三條驗證路徑依 ADR-0050 連入同一個 McpApp Server 實例與 SQLite 工作流狀態；Secure MCP Tunnel 不建立第二套 Server 或資料副本。

依 ADR-0057，M0 只執行本機 Codex 與 `basic-host` 路徑，Project Console 在 Local Owner Trust 下直接完成核准；M0 不宣稱能以密碼學方式區分人類點擊與 Agent 呼叫。

依 ADR-0059，Codex 遇到 Approval Gate 時等待，專案擁有者在連到同一 Server 的 `basic-host` Project Console 透過 app-only 工具回應，再由 Codex 續作。
