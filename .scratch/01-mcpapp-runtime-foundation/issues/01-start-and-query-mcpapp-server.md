# 01 — 啟動並查詢 McpApp Server

**What to build:** 讓專案擁有者能以單一開發指令啟動前景 McpApp Server，並讓 Host 透過 Streamable HTTP 查詢可機器判讀的 readiness、版本與基本 runtime 狀態。這條最小端到端路徑同時建立後續 Ticket 共用的 Server contract 測試 seam。

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] 單一開發指令會以前景程序啟動 McpApp Server，啟動失敗時回傳非零狀態與可理解原因。
- [ ] MCP Client 可透過 Streamable HTTP 完成初始化並呼叫唯讀 runtime status 工具。
- [ ] runtime status 至少回傳 Server readiness 與版本，且回應符合明確 schema。
- [ ] Server 未執行時，Client 取得明確的 unavailable 結果，而不是無限等待或假裝成功。
- [ ] 自動化測試透過公開 Streamable HTTP seam 驗證啟動、查詢與關閉，不直接測 private handler。
- [ ] 專案提供可實際執行且非空的 Typecheck、Lint、Test 與 Build 指令。
