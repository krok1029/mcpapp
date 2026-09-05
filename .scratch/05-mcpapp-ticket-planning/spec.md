Status: ready-for-agent
執行順序: 05

# 05 — Backlog and Ticket Planning Spec

## Problem Statement

若 Spec 核准後立刻建立完整 Ticket 清單，細節會在實作前過期；若只規劃眼前一步，專案擁有者又看不到整體範圍與依賴。以 schema、backend、frontend 分層拆票還會產生無法獨立展示或驗收的水平工作。

## Solution

先從核准 Spec 建立粗粒度 Backlog Map，再依最新 Spec、Repository 與已合併 PR 即時細化下一個 Ticket Candidate。每張 Ticket 是可在一次連續工作階段完成、獨立 Review 和交付的 tracer-bullet 垂直切片；每個受管專案同時只有一張 Active Ticket。

### Requirements and Acceptance Criteria

#### REQ-009 — Backlog 與 Ticket

- AC-035：Spec 核准後建立可持續調整的 Backlog Map，顯示候選工作、依賴與大致順序，但不過早細化全部 Ticket。
- AC-036：Host Agent 依依賴、最快驗證價值、優先降低風險與較小範圍推薦下一個 Ticket Candidate，最終由專案擁有者選擇。
- AC-037：完整 Ticket 連回 Requirement 與 Acceptance Criterion，包含範圍、驗證計畫、風險與可獨立展示的完成條件。
- AC-038：每個受管專案同時只有一張 Active Ticket；依賴未解除的 Ticket 不能啟動。
- AC-039：每張 Ticket 使用一個 Branch、可包含多個核准 Commit，並恰好對應一個 PR。

## User Stories

1. As a 專案擁有者, I want to 在 Spec 核准後查看 Backlog Map, so that 我能理解整體交付範圍。
2. As a 專案擁有者, I want to 看見候選工作間的依賴, so that 不會啟動被阻擋的工作。
3. As a 專案擁有者, I want to 持續調整 Backlog Map, so that 粗略計畫能反映新資訊。
4. As a 專案擁有者, I want to 延後細化尚未開始的 Ticket, so that 不必維護過早失效的細節。
5. As a Host Agent, I want to 依最新 Repository 狀態推薦候選項目, so that 建議不會只根據舊 Spec。
6. As a 專案擁有者, I want to 選擇下一個 Ticket Candidate, so that 優先順序不由 Agent 單方面決定。
7. As a 專案擁有者, I want to 在實作前核准完整 Ticket, so that 範圍和驗證方式明確。
8. As a Host Agent, I want to 讓 Ticket 連回 Requirement 與 Acceptance Criterion, so that 交付可以追溯。
9. As a Host Agent, I want to 拆出垂直 tracer bullet, so that 每張 Ticket 能獨立展示價值。
10. As a 專案擁有者, I want to 一次只有一張 Active Ticket, so that Branch 與工作樹不會互相污染。
11. As a Host Agent, I want to 讓一張 Ticket 固定對應一個 Branch 與 PR, so that Review 與完成狀態有清楚邊界。
12. As a 專案擁有者, I want to 在 Ticket 關閉或 Merge 後才釋放下一張, so that 不會出現隱性平行工作。

## Implementation Decisions

- Backlog Map 是可編輯的粗粒度規劃，不設獨立 Approval Gate；只有完整 Ticket 核准授權實作。
- Ticket Candidate 在即將開始時，依核准 Spec、目前 Repository 與已合併 PR 細化。
- 候選推薦依序考量依賴解除、最快驗證價值、降低高風險、小範圍與避免水平分工。
- Ticket 必須是端到端可展示的垂直切片，不以技術層、資料表或套件作為唯一交付價值。
- Ticket 包含 Requirement／Acceptance Criterion 關聯、明確非目標、測試 seams、Evidence 計畫與驗收方式。
- 每個受管專案只允許一張 Active Ticket；不同受管專案的狀態彼此獨立。
- Ticket 必須在 PR Merge Commit 被記錄，或明確關閉並完成處置後，才會釋放 Active 狀態。

## Testing Decisions

- 主要 seam 是 MCP Tool contracts，從核准 Spec 建立 Backlog、選候選、細化、核准與啟動 Ticket。
- 測試依賴 graph 的 frontier 選擇、被阻擋 Ticket 拒絕、以及同專案第二張 Active Ticket 拒絕。
- 測試 Backlog 更新不會自行核准 Ticket，也不會改變既有 Ticket 身分。
- 測試每張完整 Ticket 的 Requirement、Acceptance Criterion、Branch 與 PR 基數 constraints。
- 只觀察工具回應與持久狀態，不測排序 helper 或 storage query internals。

## Out of Scope

- 一次建立所有詳細 Ticket。
- 水平分層 Ticket、跨多張 Ticket 的 PR，以及多 Ticket 共用 Branch。
- 同一受管專案平行 Active Ticket 或自動選定下一張 Ticket。
- 受控程式修改、Verification Evidence、Review 與 PR 發布。

## Further Notes

- 本 Spec 依賴 Repository Provisioning，因為完整 Ticket 必須依最新 Git 狀態細化。
- `to-tickets` 對 McpApp Repository 本身的拆票也必須遵循相同 tracer-bullet 精神，但它是開發流程，不是本產品 runtime dependency。
