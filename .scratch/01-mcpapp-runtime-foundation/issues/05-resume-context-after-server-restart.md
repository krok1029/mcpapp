# 05 — Server 重啟後提供 Resume Context

**What to build:** 讓 McpApp Server 使用相同 SQLite 資料重新啟動後，Host 仍能恢復原本的 Open Work Session，並取得足以安全續作的 Resume Context，而不用依賴先前聊天紀錄。

**Blocked by:** 04 — 跨 HTTP 重連與本機 Host 恢復 Work Session

**Status:** claimed

**Review fixed point:** `d4ee4b6c4cedae98187c651238ff9a55fc327ed3`

- [x] 關閉並重啟 Server 後，`begin_or_resume_work` 回傳重啟前的 `work_session_id`。
- [x] Resume Context 包含受管專案與 Work Session 身分、目前工作流狀態、最後成功步驟及待處理 Approval Gate。
- [x] Resume Context 包含目前已存在的 Evidence metadata 摘要；沒有 Evidence 時回傳明確空集合。
- [x] Resume Context 由 SQLite 權威狀態產生，不依賴 Host 對話或記憶體快取。
- [x] 不完整或無法解析的持久狀態不會被默認為正常，而會回傳可處置的錯誤。
- [x] 以停止、重新建立 Server 程序的整合測試證明 AC-003 的正常重啟恢復行為。

## Implementation

- Active Spec：`spec-versions/v003.md`，REQ-001／AC-003 的正常重啟部分，並維持
  AC-001 的同一 handle 與最新 Resume Context 行為。
- `begin_or_resume_work` 保留既有三個頂層欄位，新增 `resume_context`；其中包含
  `project_id`、`work_session_id`、`workflow_state`、`last_successful_step`、
  `pending_approval_gates` 與 `evidence_metadata`。目前已實作的工作流狀態是 `draft`。
- 建立專案及首次開始工作時，以 SQLite transaction 一併保存 workflow metadata；
  恢復既有 Session 時讀取最新持久狀態，不覆寫最後成功步驟。沒有待處理閘門或
  Evidence 時回傳 `[]`。Evidence 摘要包含穩定 UUID 與摘要文字。
- `user_version = 0` 的既有資料庫會交易式升級為版本 1，保留專案與 Open Work
  Session 身分。既有版本沒有保存歷史步驟，因此升級時使用 `null`；既有版本尚無
  Approval／Evidence 產生流程，對應集合為 `[]`。已升級資料缺少 workflow row 時
  不會再次補成預設值。
- 缺少 workflow row、JSON 損壞、Evidence 結構不完整或 Session 關聯不一致時，
  回傳 `PERSISTED_STATE_INVALID` 及停止工作、檢查或從可信備份還原的處置指引。
  交易內驗證失敗會 rollback，避免留下部分狀態。
- 使用既有 CONTEXT／ADR 的 Resume Context、Approval Gate 與 Evidence 定義。
  本 Ticket 不新增工作流轉移工具或 metadata 寫入工具；異常終止與部分結果恢復仍屬
  Ticket 12。

## Verification Evidence

- Public seam：真實 Streamable HTTP Client → 獨立 Node Server 子程序 → 真實暫存
  SQLite。透過 SIGTERM 等待原程序退出，再 fork 新程序並重新連線；不以同一程序
  內重新建立 Server 物件代替程序重啟。
- 新增 `apps/mcp-server/test/resume-context.contract.test.ts` 共 8 cases：正常重啟、
  已存在的 metadata、舊格式升級後再次重啟、缺少 workflow row、JSON 損壞後修復、
  Session 關聯不一致、同一程序內取得最新 metadata，以及缺少 Evidence identity。
- SQLite fixture 只用於安排舊版本、損壞資料及已保存 metadata；所有 assertions
  只觀察 MCP 回應。最新 metadata case 在 Server 閒置時更新 fixture，再經新 Client
  呼叫同一 Server，證明先前回傳的 Resume Context 不會成為記憶體權威快取。
  Fixture Evidence 只代表待讀取的測試資料，不宣稱已執行真實驗證工作流。

### TDD slices

每個切片先執行單一新增 case，再完成對應最小實作。以下 snapshot、完整 log 與
指令紀錄位於 `/tmp/mcpapp-ticket05-4FlcNB/`。Red／Green 配對使用相同測試內容；
沒有建立 Red Commit。

| 切片                   | 測試內容 SHA-256                                                   | Red → Green 證據                                                                        |
| ---------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| 重啟與 Resume Context  | `f4bbcaabff375333a129db4f1675a918c650565cd27233c74bc0259699282b05` | `context-red-final.log` 缺少 `resume_context` → `context-green-final.log` 通過          |
| 已存在的 metadata      | `96c4209030a1a3822fb06b762b066c813a156341b00b0652abc8143a7a3b2040` | 首次即 Green；`metadata-green.log`，既有 JSON 讀取已涵蓋                                |
| 舊格式升級             | `6e3f985ada044d6672b71a951bb56ffda859651dca96e73a83c19b258545d49f` | `migration-red.log` 無法恢復舊專案 → `migration-green.log` 通過                         |
| 缺少 workflow row      | `611c072a373711f819c7f2e9473a903e02f34cc58fd7ab9e181857a33f889496` | `missing-state-red.log` 只有一般錯誤 → `missing-state-green.log` 回傳可處置領域錯誤     |
| JSON 損壞與修復        | `fce2a8d673cf99fbd61d6f97395bea18e45603fde415c2207f65819d4b5bbad6` | `malformed-red.log` 暴露原始解析錯誤 → `malformed-green.log` 回報領域錯誤並保留 Session |
| Session 關聯不一致     | `ae9e8ce1e74399cafe5b0d9a0d3c2de7865cce412c117e150e9d8001bd616fee` | `identity-red-final.log` 錯誤地回傳正常結果 → `identity-green-final.log` 通過           |
| 同一程序內最新狀態     | `e898291ddbcc094c7eed9fbe9c61a61619387c236507b3f1e3732d6eeecd5b37` | 首次即 Green；`latest-green.log`                                                        |
| Evidence 缺少 identity | `fe946a6e2c62e7ee23c77c8e88c9779bdde9ea090d8a41090cd3f89d3852cec0` | 首次即 Green；`evidence-invalid-green.log`，既有結構驗證已涵蓋                          |

- 單檔指令：`corepack yarn vitest run --root apps/mcp-server test/resume-context.contract.test.ts`。
  單一切片以 `-t` 指定相應 case；重跑指令與 selectors 保存於 `commands.md`。
- Session 關聯測試最初使用不存在的 UUID，遭 SQLite 外鍵在 fixture setup 拒絕；
  `identity-red.log`／`identity-green.log` 不算 Red／Green 證據。改用可保存但不一致的
  NULL 關聯後，重新取得上表有效 Red，再恢復檢查並取得 Green。
- 最後將程序清理改為 `Promise.all` 以符合 lint；修改前後相同 8 個 cases 均 Green。
  並將最終測試原樣放入 review fixed point 的暫存展開目錄，重新執行第一個 case：
  `final-content-red.log` 仍因缺少 `resume_context` 失敗，目前實作則完整通過。
- 最終測試檔 SHA-256：
  `1d3e05d1d304949ea95c96bc0cfe93fc2d1b9cce3515cf64e06145d011f14d31`。
- 子程序 fixture SHA-256：
  `b4759a42a914382cdbb3d187441de7817d8ddf31e0a7a94b61faa7b5e8a9375e`。

### Quality checks — 2026-09-06

| 指令                         | 結果                                                   |
| ---------------------------- | ------------------------------------------------------ |
| `corepack yarn test`         | Node runner 6、Server 27、Contracts 1、UI 2 tests 通過 |
| `corepack yarn lint`         | 通過，包含非測試 code 檔案 600 行限制                  |
| `corepack yarn typecheck`    | 通過                                                   |
| `corepack yarn build`        | 通過                                                   |
| `corepack yarn test:e2e`     | 1 個 Chromium test 通過                                |
| `corepack yarn format:check` | 通過                                                   |
| `git diff --check`           | 通過                                                   |

- Contracts build／test、Server tests／typecheck／build 與 Chromium test 在本 Ticket
  均實際執行；最後重跑時部分已通過的 Contracts jobs 以及未變更的 UI jobs 使用
  Turbo cache。完整輸出為 `full-test-final.log`、`lint-final.log`、
  `typecheck-final.log`、`build-final.log`、`e2e-final.log` 與 `format-final.log`。
- 開發期間的工具解析失敗、fixture setup 失敗、typecheck 與 lint 修正均未充作
  行為 Red。首輪 lint 的程序清理警告已修正，最終檢查無警告。

## Delivery status

- 分支：`codex/ticket-05-resume-context`。
- 實作與本機驗證完成；專案擁有者已於 2026-09-06 核准本次 Commit 及提交後雙軸
  code-review。
- 提交後執行 Standards／Spec 獨立審查；PR 尚未發布。Ticket 保持 `claimed`，待
  專案擁有者 Merge 並記錄 Merge Commit 後才可 resolved。
