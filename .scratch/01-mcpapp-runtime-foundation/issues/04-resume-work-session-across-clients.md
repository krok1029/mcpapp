# 04 — 跨 HTTP 重連與本機 Host 恢復 Work Session

**What to build:** 讓 Host 對已有 Open Work Session 的受管專案再次呼叫 `begin_or_resume_work` 時，無論 HTTP 重新連線、Project Console 重載或換成另一個本機 Client，都取得原本的 Work Session，而不是建立分叉工作。

**Blocked by:** 03 — 為受管專案建立 Open Work Session

**Status:** claimed

**Review fixed point:** `8d6d7bfa7da9c937b371af04773b68115eb5bbed`

- [x] 同一 Client 重複呼叫時取得相同 `work_session_id`。
- [x] 中斷並建立新的 HTTP 連線後，仍取得相同 `work_session_id`。
- [x] 第二個本機 Client 對同一受管專案呼叫時，仍取得相同 Open Work Session。
- [x] HTTP transport session ID 與 Client metadata 只作 transport 或稽核資訊，不會建立新的權威 Work Session。
- [x] Host 對話結束或 Project Console 重載不會關閉 Work Session。
- [x] 整合測試透過多個 Streamable HTTP Client 證明 AC-001 的恢復部分與 AC-002。

## Verification Evidence

- Active Spec：`spec-versions/v003.md`，REQ-001／AC-001 的 handle 恢復部分與 AC-002。
- Public seam：真實 Streamable HTTP Client → 真實 McpApp Server → 真實暫存 SQLite。
  測試只觀察 MCP 回應，不查詢 Storage 或 mock 內部 collaborator。
- 新增 `apps/mcp-server/test/work-session-resume.contract.test.ts`，共 6 個 cases：
  同一 Client 重複呼叫、關閉 transport 後重新連線、不同 metadata 的第二個本機
  Client、Host Client 關閉後重建、Console Client 關閉後重建，以及改變 legacy
  `Mcp-Session-Id`。所有 cases 均要求恢復相同 Open Work Session。
- 重連 case 使用 `Connection: close` 關閉原 HTTP 連線，再以新 transport 連回 Server。
  Host 對話結束與 Project Console 重載，在本 Ticket 已核准的 Server seam 以關閉及
  重建 Client 驗證；不宣稱已操作真實 Host 對話控制或渲染後的 Console。
- 本 Ticket 沒有變更產品程式碼。Ticket 03 已完成 lookup-or-create；新增測試依序加入
  並執行，5 個切片分別為 1、2、3、5、6 個 cases 通過，均為首次執行即 Green。
  不把既有行為驗證或環境設定失敗記為新的 TDD Red。
- 最終測試檔 SHA-256：
  `e8a5aaab3cd3d1c4fd728b9d05ab9d927f2c0e22c97224e5b97d0f8d3548b177`。
- 歷史回歸驗證：在暫存目錄展開 `81986b6dc95d320330ee6c688697c097b313c3ca`
  （Ticket 03 single-open 修正前），複製相同雜湊的測試檔執行；6 個 cases 均因
  `work_session_id` 改變而失敗。目前基準 `8d6d7bf` 上相同測試全部通過。這是對已知
  回歸的敏感度驗證，並非本 Ticket 的實作前 Red。

### Quality checks — 2026-09-06

| 指令                                                                                        | 結果                                                   |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `corepack yarn vitest run --root apps/mcp-server test/work-session-resume.contract.test.ts` | 1 file、6 tests 通過                                   |
| `corepack yarn test`                                                                        | Node runner 6、Server 19、Contracts 1、UI 2 tests 通過 |
| `corepack yarn lint`                                                                        | 通過                                                   |
| `corepack yarn typecheck`                                                                   | 通過                                                   |
| `corepack yarn build`                                                                       | 通過                                                   |
| `corepack yarn test:e2e`                                                                    | 1 個 Chromium test 通過                                |
| `corepack yarn format:check`                                                                | 通過                                                   |
| `git diff --check`                                                                          | 通過                                                   |

- Server tests、Server typecheck／build 與 Chromium test 均實際重新執行；未變更的
  Contracts／UI jobs 使用 Turbo cache。開發期間另執行 Server 單檔測試與 typecheck。
- 本機完整輸出：`/tmp/mcpapp-ticket04-2aP852/`，包含 `slice-1.log` 至 `slice-5.log`、
  `historical-regression.log`、`full-test.log` 與各品質指令 log。

## Delivery status

- 已完成變更與本機驗證，等待 Commit Approval；尚未執行提交後的 Standards／Spec
  雙軸 code-review，也尚未建立 PR 或取得新分支的 GitHub Actions 結果。
- Ticket 維持 `claimed`，由專案擁有者 Merge PR 並記錄 Merge Commit 後才標記完成。
