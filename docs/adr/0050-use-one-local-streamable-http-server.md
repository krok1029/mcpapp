# 使用單一本機 Streamable HTTP Server

MVP 以單一、本機長時間執行的 Streamable HTTP McpApp Server 作為 SQLite 與工作流狀態的唯一權威執行程序，讓 Codex、MCP Apps `basic-host` 與後續 Secure MCP Tunnel 共用相同狀態。M0 依 ADR-0058 由使用者手動以前景程序啟動；「長時間執行」只表示程序獨立於 Host 並在一次開發工作期間持續存活，不代表登入自啟或作業系統 service。Server 預設只監聽 loopback，以單一實例鎖排除重複程序，並依 ADR-0060 以每個受管專案的 Mutation Guard 防止 Host 同時執行變更操作。

M0 依 ADR-0057 產生一把本機安裝 Token，供專案擁有者允許的 loopback Client 共用；Token 內容不得進入 Repository、領域文件、Evidence 或日誌。M0 不啟用 Secure MCP Tunnel；後續只有在遠端授權重新決策且專案擁有者明確啟動 Tunnel 時才接受遠端路徑，Tunnel 僅轉送至既有 Server，不建立額外狀態寫入者。Server 重啟與異常終止後必須能安全辨識並復原殘留的單一實例鎖、操作紀錄與 Repository 差異，且不得因此遺漏可能的部分結果。
