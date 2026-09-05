# M0 採用 Local Owner Trust

M0 是單一專案擁有者的純本機階段，將目前登入作業系統、持有本機安裝 Token 的使用者及其允許的 loopback Client 視為同一信任域。McpApp Server 只監聽 loopback、嚴格驗證 `Origin`，並使用安裝時隨機產生、存於使用者應用資料目錄且僅 owner 可讀之檔案的單一 Token；Token 不得進入 Repository、Evidence 或日誌。M0 不實作每 Client Grant、OAuth、Owner Session、原生 credential broker 或獨立 Owner Console。

Project Console 在 Local Owner Trust 下直接回應內容綁定且不可重放的 Approval Challenge，Server 繼續保存 Approval Proof 與 Evidence，但不宣稱能以密碼學方式區分人類點擊與 Agent 呼叫。Work Session 與 ADR-0060 的 Mutation Guard 維持跨 Host 的狀態一致性。Secure MCP Tunnel 在 M0 完全停用；任何遠端 Client 連入前，必須重新決定 Client 授權與專案擁有者核准模型，而 ADR-0052 至 ADR-0056 只保留為待重新評估的設計歷史，不能自動恢復生效。

核准工具與純 UI 互動依 ADR-0059 使用 MCP Apps app-only visibility，降低 Host Agent 意外自我核准的機率，但不改變 Local Owner Trust 的保證上限。
