# 01 — 啟動並查詢 McpApp Server

**What to build:** 讓專案擁有者能以單一開發指令啟動前景 McpApp Server，並讓 Host 透過 Streamable HTTP 查詢可機器判讀的 readiness、版本與基本 runtime 狀態。這條最小端到端路徑同時建立後續 Ticket 共用的 Server contract 測試 seam。

**Blocked by:** None — can start immediately

**Status:** resolved

- [x] 單一開發指令會以前景程序啟動 McpApp Server，啟動失敗時回傳非零狀態與可理解原因。
- [x] MCP Client 可透過 Streamable HTTP 完成初始化並呼叫唯讀 runtime status 工具。
- [x] runtime status 至少回傳 Server readiness 與版本，且回應符合明確 schema。
- [x] Server 未執行時，Client 取得明確的 unavailable 結果，而不是無限等待或假裝成功。
- [x] 自動化測試透過公開 Streamable HTTP seam 驗證啟動、查詢與關閉，不直接測 private handler。
- [x] 專案提供可實際執行且非空的 Typecheck、Lint、Test 與 Build 指令。

## Verification Evidence

- Red：`apps/mcp-server/test/runtime.contract.test.ts` SHA-256
  `8cc99ae3f7788b26f61c41ca2ef9c41634e3e0b5e8dc57d38b81cca4d533fcc0`；
  `yarn test --filter=@mcpapp/server` 因 `startMcpAppServer is not a
function` 失敗。
- Green：同一測試內容雜湊下，`yarn test --filter=@mcpapp/server` 通過 2
  個 test files、2 個 tests。
- Lifecycle：`yarn vitest --root apps/mcp-server run
test/development-command.test.ts` 通過 1 個 test file、2 個 tests，涵蓋前景啟動、
  MCP 查詢、graceful shutdown 與啟動失敗。
- Evidence gap：Lifecycle tests 是在對應實作後補上的，沒有同內容的 Red
  Evidence；此缺口依首次 Standards review 如實記錄，不補造歷史。
- Review fix Red：`apps/mcp-server/test/runtime.contract.test.ts` SHA-256
  `ea9351d6805345e47523d6dae53da6b3fe56bb6b29c9835ff9bf8e6df9f565f4`；
  非 loopback bind 測試因 Server 實際綁定 `0.0.0.0` 而失敗。
- Review fix Green：同一測試內容雜湊下，`yarn vitest --root apps/mcp-server
run test/runtime.contract.test.ts` 通過 1 個 test file、2 個 tests。
- Request guard fix Red：`apps/mcp-server/test/runtime.contract.test.ts` SHA-256
  `c775b5894d207df2fa6131055f0f09b0c4df54449cde159bbf2522013becb294`；
  `127.0.0.2` 未被應用程式邊界拒絕，測試收到作業系統的
  `EADDRNOTAVAIL` 而非預期的明確拒絕原因。
- Request guard fix Green：同一測試內容雜湊下，`yarn vitest --root
apps/mcp-server run test/runtime.contract.test.ts` 通過 1 個 test file、3 個
  tests。
- CI dependency fix Red：commit `14d5602` 的全新快照執行 `yarn typecheck`，
  `@mcpapp/server` 因找不到尚未 build 的 `@mcpapp/contracts` 宣告而回傳
  `TS2307` 與 exit code 2。
- CI dependency fix Green：全新快照套用 `turbo.json` 修正後執行
  `yarn typecheck`；Turbo 先完成 `@mcpapp/contracts:build`，再通過所有 4 個
  tasks，無 cache 命中。
- Final：`yarn test` 通過 6 個 test files、9 個 tests；`yarn typecheck`、
  `yarn lint`、`yarn format:check`、`yarn build` 與 `git diff --check` 全部通過。

## Review Findings

- Spec P1：公開 `host` override 可綁定非 loopback。已加入 loopback address
  驗證與公開邊界 contract test；專案擁有者已核准追加 Commit。
- Standards P2：Lifecycle tests 缺少 Red Evidence。無法事後補造；專案擁有者已依
  ADR-0034 明確接受此 evidence risk。
- 第二輪 Spec P2：Server 接受 request guards 不支援的 `127/8` 位址。已將允許範圍
  收斂為 `127.0.0.1` 與 `::1`，並加入 contract test；專案擁有者已核准追加
  Commit。

## Answer

已完成並透過 [PR #1](https://github.com/krok1029/mcpapp/pull/1) 合併至
`main`。Merge commit 為 `01ce44b7e599fff0c695b22bf0a486cf7f17b484`，合併前
GitHub Actions `quality` 與 GitGuardian Security Checks 均通過。
