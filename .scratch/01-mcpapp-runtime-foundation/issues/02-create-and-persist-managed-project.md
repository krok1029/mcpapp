# 02 — 建立並持久保存受管專案草稿

**What to build:** 讓 Host 能建立一個最小受管專案草稿並再次讀取它。專案資料由真實 SQLite 保存，因此關閉並重啟 Server 後仍能用穩定專案身分取得相同內容。

**Blocked by:** 01 — 啟動並查詢 McpApp Server

**Status:** claimed

**Review fixed point:** `c5a46c7`

- [x] Host 可透過 MCP Tool 建立具有穩定、不重用身分的受管專案草稿。
- [x] 建立結果包含後續 `begin_or_resume_work` 可使用的 `project_id`，但不會順便建立 Work Session。
- [x] 純讀取工具可依 `project_id` 取得已保存的受管專案摘要。
- [x] 找不到專案時回傳明確 domain error，不洩漏 Storage 細節。
- [x] 關閉並以相同資料位置重啟 Server 後，仍可讀取相同專案與身分。
- [x] 整合測試透過 Streamable HTTP 使用真實暫存 SQLite，不把 Drizzle 或資料表結構當作 public seam。

## Verification Evidence

- Dependency approval：專案擁有者核准新增 `drizzle-orm@1.0.0-rc.4`；Server
  使用其 `node:sqlite` adapter，不另增 SQLite native driver。
- Create/read Red：`apps/mcp-server/test/managed-project.contract.test.ts`
  SHA-256 `98261a32fbb9dea8595b166dc885faa87169ceaa374f3354079141d52b20e67a`；
  contract test 因 `createManagedProject is not a function` 失敗。
- Create/read Green：同一測試內容雜湊下，targeted contract test 通過 1 個 test
  file、1 個 test。
- Not-found Red：同一測試檔 SHA-256
  `8f1ca8a1369f39bcb767e6021a4cccb36c27f81e94026470c4dee3fb6be1eca9`；
  不存在的 `project_id` 未回傳 `PROJECT_NOT_FOUND`，而是 schema parse error。
- Not-found Green：同一測試內容雜湊下，targeted contract test 通過 1 個 test
  file、2 個 tests。
- Persistence／identity：最終測試檔 SHA-256
  `f1da1ae67c0e3fd34875be06a06ffb30f390978684e99aa5d4c4f2ecb36b40aa`；
  targeted contract test 通過 1 個 test file、4 個 tests，涵蓋建立後讀取、明確
  not-found、相同 SQLite 路徑重啟後讀取，以及不重用 `project_id`。
- Evidence gap：重啟持久化與不重用 ID 的個別 tests 是在第一個 Green 所加入的
  SQLite／UUID 實作後補上，沒有同內容的 Red Evidence；不補造歷史。
- Final：`yarn test` 全部通過，其中 Server 為 4 個 test files、10 個 tests；
  `yarn lint`、`yarn typecheck`、`yarn format:check`、`yarn build` 與
  `git diff --check` 全部通過。
