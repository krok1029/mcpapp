Status: ready-for-agent
執行順序: 08

# 08 — Traceability and Impact Analysis Spec

## Problem Statement

當需求、Ticket、Test、Commit、PR 與程式檔案分散保存時，專案擁有者難以回答某項需求如何被交付、某個檔案為何改變，以及修改 Spec 會影響哪些未完成工作。若 Agent 的推論可直接阻擋流程，不確定關係又會變成新的錯誤事實來源。

## Solution

從權威 Artifact、Evidence、Git 與 GitHub 事實投影可重建的 Development Evidence Chain 與 File-level Knowledge Graph。介面以相關子圖回答追溯問題；Inferred Relationship 保存來源、信心水位與審核狀態，但未確認前不能驅動阻擋決策。新 Spec Version 產生 Impact Analysis 並只重新確認受影響工作。

### Requirements and Acceptance Criteria

#### REQ-016 — Development Evidence Chain

- AC-070：Idea、Spec Version、Requirement、Acceptance Criterion、Ticket、Evidence、Commit 與 PR 具有可追溯關聯。
- AC-071：程式碼圖譜在 MVP 僅追蹤 Repository、Module 與 File，不建立 Function、Class 或 API 級身分。
- AC-072：每條 Inferred Relationship 保存來源、high／medium／low 信心水位、審核狀態、Evidence 與解釋。
- AC-073：未確認的 Inferred Relationship 不得令 Ticket 失效、阻擋 PR 或宣告 Requirement 完成。
- AC-074：Project Console 可從 Requirement、Ticket、PR 或 File 查詢預設最多兩層的相關子圖，並按關係類型展開。

#### REQ-017 — Spec 變更與 Impact Analysis

- AC-075：新 Spec Version 建立前顯示與前一核准版本的差異及 Impact Analysis。
- AC-076：被取代或刪除 Requirement 所影響的未完成 Ticket 與 Test 回到待確認狀態。
- AC-077：既有 Commit 保留對舊 Spec Version 的關聯；知識圖譜只重新投影受影響子圖。
- AC-078：Requirement 或 Acceptance Criterion 的實質語意改變建立新 ID，並以 `supersedes` 關聯舊 ID。

## User Stories

1. As a 專案擁有者, I want to 從 Requirement 查到相關 Acceptance Criterion, so that 我能理解如何判定完成。
2. As a 專案擁有者, I want to 從 Requirement 查到 Ticket、Evidence、Commit 與 PR, so that 我能看見完整交付路徑。
3. As a 專案擁有者, I want to 從 File 查到它為何被修改, so that 未來維護不必猜測歷史原因。
4. As a 專案擁有者, I want to 從 PR 查到它實現哪些需求, so that Review 有需求脈絡。
5. As a 專案擁有者, I want to 預設只看兩層相關關係, so that 圖譜不會資訊過載。
6. As a 專案擁有者, I want to 依關係類型繼續展開, so that 需要時能深入追蹤。
7. As a Host Agent, I want to 提出附 Evidence 與解釋的推論關係, so that 不明確連結仍可被檢視。
8. As a 專案擁有者, I want to 確認或拒絕推論關係, so that Agent 推論不會自動成為事實。
9. As a 專案擁有者, I want to 在新 Spec Version 前查看 Impact Analysis, so that 我知道哪些工作需重新確認。
10. As a Host Agent, I want to 只讓受影響的未完成 Ticket 與 Test 回到待確認, so that 需求變更不會迫使全專案重做。
11. As a 專案擁有者, I want to 保留舊 Commit 對舊 Spec Version 的關聯, so that 歷史不被新需求改寫。
12. As a 專案擁有者, I want to 讓實質語意改變建立新 ID, so that 同一 ID 不會代表兩種不同要求。

## Implementation Decisions

- Knowledge Graph 是由結構化 Artifact、Evidence、Git 與 GitHub 事實投影的可重建索引，不是主資料庫。
- 流程節點完整涵蓋 Idea 到 PR；程式碼節點只到 Repository、Module 與 File。
- Edge 記錄 explicit、derived 或 inferred 來源，以及離散信心水位與審核狀態。
- Inferred Relationship 未 confirmed 前只可呈現建議，不可驅動阻擋性 workflow transition。
- Project Console 以當前 Requirement、Ticket、PR 或 File 為中心提供最多兩層的 Relevant Subgraph。
- MVP 優先回答 Ticket 追溯、Requirement 完成狀態與 File 變更原因三類查詢。
- Impact Analysis 依穩定 ID 與關係圖只標記受影響的未完成 Ticket 和 Test。
- 新 Spec Version 不改寫舊關聯；實質語意變更用新 ID 和 `supersedes`。

## Testing Decisions

- 主要 seam 是 MCP 查詢與變更 contracts，使用已建立的真實 SQLite 專案紀錄。
- 以端到端 fixture 建立 Spec、Ticket、Evidence、Commit、PR 與 File 關係，驗證三種主要追溯查詢。
- 測試 Relevant Subgraph 的兩層預設、關係類型展開與無權威來源節點不會被捏造。
- 測試 inferred edge 的 unreviewed、confirmed、rejected，以及未確認關係無法阻擋 Ticket 或完成 Requirement。
- 對新增、修改、刪除與 supersede Requirement 執行 Impact Analysis，驗證只影響相關未完成工作且保留歷史。
- Graph projection 可刪除後由權威資料重建並產生相同可觀察查詢結果。

## Out of Scope

- Function、Class、API、Database 或 External Service 級程式碼圖譜。
- 全域架構圖作為主要 UI、無限制圖譜展開與浮點信心分數。
- 未確認推論自動阻擋 PR、關閉 Ticket 或宣告 Requirement 完成。
- 修改歷史 Commit 或讓新 Spec Version 取代舊版本的真實關聯。

## Further Notes

- 本 Spec 依賴 M1 已產生的 Artifact、Evidence、Commit、PR 與 Merge 事實。
- 完成本 Spec 後，M2 才具備查明需求到 File 的追溯能力。
