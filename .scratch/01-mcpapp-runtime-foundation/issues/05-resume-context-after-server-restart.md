# 05 — Server 重啟後提供 Resume Context

**What to build:** 讓 McpApp Server 使用相同 SQLite 資料重新啟動後，Host 仍能恢復原本的 Open Work Session，並取得足以安全續作的 Resume Context，而不用依賴先前聊天紀錄。

**Blocked by:** 04 — 跨 HTTP 重連與本機 Host 恢復 Work Session

**Status:** ready-for-agent

- [ ] 關閉並重啟 Server 後，`begin_or_resume_work` 回傳重啟前的 `work_session_id`。
- [ ] Resume Context 包含受管專案與 Work Session 身分、目前工作流狀態、最後成功步驟及待處理 Approval Gate。
- [ ] Resume Context 包含目前已存在的 Evidence metadata 摘要；沒有 Evidence 時回傳明確空集合。
- [ ] Resume Context 由 SQLite 權威狀態產生，不依賴 Host 對話或記憶體快取。
- [ ] 不完整或無法解析的持久狀態不會被默認為正常，而會回傳可處置的錯誤。
- [ ] 以停止、重新建立 Server 程序的整合測試證明 AC-003 的正常重啟恢復行為。
