# 02 — 建立並持久保存受管專案草稿

**What to build:** 讓 Host 能建立一個最小受管專案草稿並再次讀取它。專案資料由真實 SQLite 保存，因此關閉並重啟 Server 後仍能用穩定專案身分取得相同內容。

**Blocked by:** 01 — 啟動並查詢 McpApp Server

**Status:** ready-for-agent

- [ ] Host 可透過 MCP Tool 建立具有穩定、不重用身分的受管專案草稿。
- [ ] 建立結果包含後續 `begin_or_resume_work` 可使用的 `project_id`，但不會順便建立 Work Session。
- [ ] 純讀取工具可依 `project_id` 取得已保存的受管專案摘要。
- [ ] 找不到專案時回傳明確 domain error，不洩漏 Storage 細節。
- [ ] 關閉並以相同資料位置重啟 Server 後，仍可讀取相同專案與身分。
- [ ] 整合測試透過 Streamable HTTP 使用真實暫存 SQLite，不把 Drizzle 或資料表結構當作 public seam。
