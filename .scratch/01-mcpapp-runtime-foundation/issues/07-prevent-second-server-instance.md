# 07 — 阻止第二個 McpApp Server 實例

**What to build:** 讓同一個 McpApp 資料位置同時只有一個權威 Server。第二個前景程序必須快速且清楚地拒絕啟動；第一個 Server 正常 graceful shutdown 後，新的程序可以安全接續使用相同資料。

**Blocked by:** 01 — 啟動並查詢 McpApp Server

**Status:** ready-for-agent

- [ ] 第一個 Server 啟動時取得限定於該資料位置的單一實例鎖。
- [ ] 第一個 Server 仍存活時，第二個實例快速拒絕啟動並回報既有實例摘要。
- [ ] 第二個實例拒絕啟動時不修改 SQLite 或既有 lock ownership。
- [ ] 收到正常結束訊號時，Server 停止接受新工作並完成 graceful shutdown。
- [ ] graceful shutdown 後，新 Server 可以使用相同資料位置正常啟動。
- [ ] 多程序整合測試驗證正常 lock lifecycle，完成 AC-027 的存活實例部分。
