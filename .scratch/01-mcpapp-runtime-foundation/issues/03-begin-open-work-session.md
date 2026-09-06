# 03 — 為受管專案建立 Open Work Session

**What to build:** 讓 Host 對既有受管專案呼叫 `begin_or_resume_work`，在尚無 Open Work Session 時建立並持久保存一個新的 Work Session，取得後續變更操作使用的不透明 handle。

**Blocked by:** 02 — 建立並持久保存受管專案草稿

**Status:** claimed

**Review fixed point:** `788fed5`

- [x] 對沒有 Open Work Session 的受管專案呼叫 `begin_or_resume_work` 會建立 Work Session。
- [x] 回傳不透明 `work_session_id`，且 response schema 不暴露 credential 或 Storage identifier。
- [x] Work Session 明確關聯一個受管專案，並以 Open 狀態持久保存。
- [x] `work_session_id` 只作狀態關聯，不能取代 Server 所需的授權資訊。
- [x] 不存在的 `project_id` 不會建立孤立 Work Session。
- [x] 透過公開 MCP Tool contract 的測試證明 AC-001 的建立行為。

## Verification Evidence

- Public seam：依核准 Spec，測試透過真實 Streamable HTTP Server 呼叫 MCP Tool，並使用
  真實暫存 SQLite；測試不直接查詢資料表或 mock 內部 collaborator。
- Create Red：`apps/mcp-server/test/work-session.contract.test.ts` SHA-256
  `5d941a942b6dcc50e1c03b4e94ff671877136ad9c08b360b4122aca22f0faa83`；
  contract test 因 `beginOrResumeWork is not a function` 失敗。
- Create Green：相同測試內容雜湊下，targeted contract test 通過 1 個 test file、1 個
  test；回應只包含不透明 `work_session_id`、關聯的 `project_id` 與 `open` 狀態。
- Missing-project Red：最終測試檔 SHA-256
  `9efd58611d77c57df5fdca7a0eea6f970e27f22c68f78e285b8bbd6ca5c382c2`；
  不存在的 `project_id` 回傳 generic SQLite／MCP error，而非 `PROJECT_NOT_FOUND`。
- Missing-project Green：相同測試內容雜湊下，targeted contract test 通過 1 個 test
  file、2 個 tests；SQLite foreign key 同時防止孤立 Work Session。
- Final：`yarn test` 全部通過，其中 Server 為 5 個 test files、12 個 tests；
  `yarn lint`、`yarn typecheck`、`yarn build`、`yarn test:e2e` 與
  `git diff --check` 全部通過。
