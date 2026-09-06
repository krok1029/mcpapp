# 03 — 為受管專案建立 Open Work Session

**What to build:** 讓 Host 對既有受管專案呼叫 `begin_or_resume_work`，在尚無 Open Work Session 時建立並持久保存一個新的 Work Session，取得後續變更操作使用的不透明 handle。

**Blocked by:** 02 — 建立並持久保存受管專案草稿

**Status:** resolved

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
- Single-open review-fix Red：當時測試檔 SHA-256
  `9f1ae22376b3361abdbdf21273e2fa41588fb534fff77a32e3aa57e7d91d598c`；
  對同一受管專案重複呼叫時，第二次產生不同 `work_session_id`。
- Single-open review-fix Green：相同測試內容雜湊下，targeted contract test 通過 1 個
  test file、3 個 tests；Store 改為 lookup-or-create，並以 SQLite partial unique index
  保證每個受管專案最多一個 Open Work Session。
- Final：`yarn test` 全部通過，其中 Server 為 5 個 test files、13 個 tests；
  `yarn lint`、`yarn typecheck`、`yarn build`、`yarn test:e2e` 與
  `git diff --check` 全部通過。

## Review Findings

- Standards／Spec P1：`begin_or_resume_work` 原本無條件建立新 ID，允許同一受管專案
  同時存在多個 Open Work Session。已改為回傳既有 Open Work Session，並增加資料庫
  唯一約束與公開契約測試。
- Standards P1：review 建議本 Ticket 同時加入安裝 Token 驗證。依 active Spec Further
  Notes，安全 Token 與 Project Console visibility 明確由後續 Spec 完成；Ticket 03
  不擴張為 Server-wide 授權實作。此 Diff 沒有把 `work_session_id` 當成 credential 或
  授權依據。
- Standards P3：`beginOrResumeWork` 與 Managed Project client helper 重複連線、呼叫、
  錯誤解析與關閉流程。已抽為具型別的共用 `callProjectTool`。
- Standards P3：`ManagedProjectStore` 已同時管理 Work Session，名稱過窄。已改名為
  `RuntimeStore`，檔案同步改為 `runtime-store.ts`。
- Standards re-review P3：`RuntimeStore` instance 仍命名為 `projects`、共用 client
  metadata 仍命名為 managed-project client，且 Work Session contract tests 重複建立
  fixture。已分別改為 `runtimeStore`、`mcpapp-client`，並抽出共用 `startServer()`；
  重構後測試檔 SHA-256 為
  `b9e101276433c19d6e77b9f8baf996f10f93c58f0f4996d89d95fd9a19aa8d7a`。
- Standards final-review P3：擴充後的 `RuntimeStore.create()`／`get()` 未指出操作的
  領域物件。已改名為 `createManagedProject()`／`getManagedProject()`。

## Answer

- 已由 [PR #4](https://github.com/krok1029/mcpapp/pull/4) 於 2026-09-06 合併。
- Merge Commit：`8d6d7bfa7da9c937b371af04773b68115eb5bbed`。
- PR 記錄最終 Standards 與 Spec review 均為 0 個 Findings，GitHub Actions quality
  與 GitGuardian Security Checks 均通過。
- Ticket 04 的 blocker 已解除，後續驗證跨 HTTP 重連與本機 Client 恢復同一 Work Session。
