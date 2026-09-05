# MCP Server 只暴露高階領域工具

McpApp 向 Host Agent 暴露建立專案草稿、更新 Spec、規劃與建立 Repository、建立 Backlog、細化與啟動 Ticket、執行驗證、準備與建立 Commit、Review、發布 PR、同步狀態、查詢追溯與匯出紀錄等高階 MCP Tools，不提供任意 Shell 或通用 Git 工具。為了讓不具本機檔案能力的 Host Agent 也能完成開發，McpApp 另外提供受 Active Ticket 約束的讀取、搜尋、套用 Patch、狀態與 Diff 等受控 Repository 操作；驗證只能執行 Stack Profile 核准的命令。每項工具都必須驗證工作流狀態與權限並產生 Evidence；只有受控操作能推進工作流。
