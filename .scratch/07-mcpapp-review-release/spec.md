Status: ready-for-agent
執行順序: 07

# 07 — Review, PR and Milestone Completion Spec

## Problem Statement

實作者的自我檢查、測試通過與正式 Review 是不同保證；若邊修改邊 Review，審查基準會持續移動。即使本機 Diff 正確，未經核准的 Push、PR 內容或失敗 CI 仍可能讓遠端交付偏離專案擁有者看過的內容。

## Solution

對凍結的 Spec Version、Ticket、Acceptance Criterion、Verification Evidence 與累積 Diff 執行獨立 Review Run，分別產生 Standards 與 Spec Finding。處置所有阻擋 Finding 後，專案擁有者核准精確 PR 發布內容；Host Agent 可 Push、建立或更新 PR，但只有專案擁有者 Merge。Ticket 與 Milestone 依實際 Merge、CI 與 Evidence 完成。

### Requirements and Acceptance Criteria

#### REQ-013 — 獨立 Review Run

- AC-056：Review Run 輸入固定為 Spec Version、Ticket、Acceptance Criterion、Verification Evidence 與凍結 Diff；執行期間只能產生 Finding。
- AC-057：Review 同時覆蓋 Repository Standards 與核准 Spec，兩軸結果分開呈現且不互相掩蓋。
- AC-058：Finding 含 P0 至 P3、位置、證據、影響、建議與處置；純風格偏好不成立為 Finding。
- AC-059：P0、P1 必須修正；P2 必須修正或由專案擁有者接受風險；P3 可轉 Backlog 且不阻擋發布。
- AC-060：修正 Finding 後必須對新的累積 Diff 與 Evidence 重新 Review。

#### REQ-014 — CI、PR 與 Ticket 完成

- AC-061：TypeScript Stack Profile 在 PR 的乾淨環境執行安裝、Typecheck、Lint、Test 與 Build，並保存 GitHub Checks 為遠端 Evidence。
- AC-062：PR 發布前，專案擁有者核准實際 remote、branch、Commit、Diff、標題、固定格式內文及受控類型與風險 Label。
- AC-063：Host Agent 只在核准後 Push 並建立或更新 PR，且不得 Force Push。
- AC-064：CI 失敗或存在未處置的阻擋 Finding 時，Ticket 不得完成。
- AC-065：只有專案擁有者可以 Merge；McpApp 記錄實際 Merge Commit 後，Ticket 才完成並釋放下一張。

#### REQ-015 — Milestone 完成

- AC-066：每個受管專案同時只有一個進行中的 Milestone。
- AC-067：相關 Acceptance Criterion 全部具通過 Evidence、PR 均已合併、Checks 通過，且沒有阻擋 Finding 或 Open Question 時，才可請求最終確認。
- AC-068：專案擁有者完成最終確認後，Milestone 才標記完成。
- AC-069：Repository 提供清楚且可重現的本機啟動與驗證方式；MVP 不以部署為完成條件。

## User Stories

1. As a Reviewer, I want to 審查一份凍結 Diff, so that Review 過程不會因持續修改而失效。
2. As a Reviewer, I want to 取得 Spec、Ticket、Acceptance Criterion 與 Evidence, so that Finding 有完整交付脈絡。
3. As a 專案擁有者, I want to 分開查看 Standards 與 Spec Review, so that 一軸通過不會掩蓋另一軸問題。
4. As a 專案擁有者, I want to 讓 Finding 附位置、證據與影響, so that 審查不是泛泛偏好。
5. As a 專案擁有者, I want to 依 P0 至 P3 處置 Finding, so that 修正成本與交付風險相稱。
6. As a Host Agent, I want to 在修正後重跑 Review, so that 舊結果不會套用到新 Diff。
7. As a 專案擁有者, I want to 在發布前查看實際 remote 與 branch, so that 變更不會送到錯誤目的地。
8. As a 專案擁有者, I want to 核准 Commit、Diff、標題、內文與 Labels, so that PR 完全符合我看過的內容。
9. As a Host Agent, I want to 在核准後建立或更新 PR, so that 發布操作可自動執行但仍受控。
10. As a 專案擁有者, I want to 禁止 Agent Merge, so that 最終交付仍由我決定。
11. As a 專案擁有者, I want to 在乾淨 CI 重跑全部品質檢查, so that 本機環境不會掩蓋問題。
12. As a 專案擁有者, I want to 在記錄 Merge Commit 後才完成 Ticket, so that McpApp 狀態符合 GitHub 事實。
13. As a 專案擁有者, I want to 完成有限 Milestone 而不是永久完成專案, so that side project 可以繼續演進。
14. As a 專案擁有者, I want to 在所有 Acceptance Criterion 有證據後最終確認, so that Milestone 完成可被驗證。

## Implementation Decisions

- Review Run 與 implementation run 分離，Review 期間不能修改待審程式碼。
- Review 規則優先序為核准 Spec／Acceptance Criterion、Ticket／Test Plan、Repository instructions 與 ADR、Stack Profile、通用最佳實務。
- Standards 與 Spec 是兩個獨立 review axes；結果分欄保存，不互相降級或覆蓋。
- Finding 使用 P0 Critical、P1 High、P2 Medium、P3 Low，並保存具體處置結果。
- 每次修正建立新的累積 Diff 與 Evidence，舊 Review Run 保留但不再授權發布。
- TypeScript Stack Profile 產生最小 GitHub Actions workflow，在每次 PR 重跑固定品質指令。
- PR 採一 Ticket、一 Branch、一 PR，可包含多個已核准 Commit；發布 Challenge 綁定實際內容。
- Host Agent 可以 Push、建立及更新 PR，但不能 Merge；Force Push 一律禁止。
- McpApp 以 GitHub Checks 與 Merge Commit 的實際結果推進 Ticket，而非 Agent 宣告。
- 產品只判定 Milestone 完成，不宣稱受管專案永久完成，也不包含部署責任。

## Testing Decisions

- Review contract tests 使用固定 Spec、Ticket、Evidence 與 Git Diff，驗證只產生 Finding 且不修改工作樹。
- 分別測試 Standards 與 Spec Finding 的保存、分級、處置及重新 Review invalidation。
- GitHub 流程在一般 CI 使用 recording Fake adapter，驗證核准內容與實際 Push／PR payload 完全一致。
- 真實 GitHub E2E 顯式啟用，使用隔離 Private Repository 驗證 Checks、PR 更新與 Merge 偵測；不由測試 Agent 執行 Merge。
- 測試 CI failure、stale PR approval、HEAD 改變、未處置 Finding 與未記錄 Merge 均不能完成 Ticket。
- Milestone tests 由公開 application command 驗證所有完成條件，不能只 unit-test 私有 predicate。

## Out of Scope

- Review 期間自動修正程式碼或以測試結果取代 Review。
- Agent 自動接受 P2 風險、忽略 P0／P1 或自動 Merge。
- Force Push、跨 Ticket PR、一 Ticket 多 PR，以及無核准的 PR 更新。
- 自動部署與判定受管專案永久完成。

## Further Notes

- 本 Spec 依賴 Controlled Implementation and Evidence。
- McpApp Repository 自身依開發流程先經 Commit Approval Gate 建立 Commit，再用固定點執行雙軸 `code-review`；產品仍以凍結累積 Diff 作為 Review Run 核心契約。
