# 使用明確的 Work Session Handle

McpApp 不把應用程式工作狀態綁定 HTTP 連線、Host 名稱或 MCP transport session。`begin_work` 由 Server 建立可持久化的 Work Session 並回傳不透明 `work_session_id`；所有變更型工具都必須明確帶入該 ID，讓工作可跨 HTTP 重連與 Server 重啟延續。純讀取不需要 Work Session。

`work_session_id` 只用來關聯狀態，不是 bearer credential，知道 ID 不能在缺少有效本機安裝 Token 時授權操作。M0 依 Local Owner Trust 不區分共用該 Token 的本機 Client；每次請求提供的 MCP client metadata 只作稽核資訊。即使相容舊版 Host 而收到 `Mcp-Session-Id`，也只把它視為 transport 資訊，不作為 McpApp 的權威工作階段身分。這項設計遵循 MCP `2026-07-28` 的無 session 核心與明確 state handle 模式，同時承擔 Host Agent 必須在工具呼叫間傳遞 ID 的成本。

M0 每個受管專案同時只允許一個 Open Work Session。Codex 或 Project Console 呼叫 `begin_or_resume_work(project_id)` 時，Server 回傳既有 Open Work Session 與 Resume Context，只有不存在時才建立新 ID。Host 對話結束、HTTP 中斷或 Project Console 重載都不會關閉 Work Session；只有明確的結束或放棄操作能在沒有執行中工具時關閉，歷史與 Evidence 必須保留，之後工作才建立新 ID。
