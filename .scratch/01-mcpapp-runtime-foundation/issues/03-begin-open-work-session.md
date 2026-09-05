# 03 — 為受管專案建立 Open Work Session

**What to build:** 讓 Host 對既有受管專案呼叫 `begin_or_resume_work`，在尚無 Open Work Session 時建立並持久保存一個新的 Work Session，取得後續變更操作使用的不透明 handle。

**Blocked by:** 02 — 建立並持久保存受管專案草稿

**Status:** ready-for-agent

- [ ] 對沒有 Open Work Session 的受管專案呼叫 `begin_or_resume_work` 會建立 Work Session。
- [ ] 回傳不透明 `work_session_id`，且 response schema 不暴露 credential 或 Storage identifier。
- [ ] Work Session 明確關聯一個受管專案，並以 Open 狀態持久保存。
- [ ] `work_session_id` 只作狀態關聯，不能取代 Server 所需的授權資訊。
- [ ] 不存在的 `project_id` 不會建立孤立 Work Session。
- [ ] 透過公開 MCP Tool contract 的測試證明 AC-001 的建立行為。
