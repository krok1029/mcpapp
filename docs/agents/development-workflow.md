# McpApp 開發流程

McpApp 自身的功能開發採用下列 skill chain：

```text
grill-with-docs
  → to-spec
  → to-tickets
  → implement
      ↳ tdd
  → code-review
  → Verification Evidence 與專案擁有者驗收
```

本流程不得略過中間階段，也不能把 code-review、測試、Verification Evidence 或專案擁有者核准互相替代。

## 適用邊界

這組 skill chain 是開發 McpApp Repository 的強制流程，也是設計受管專案工作流時的參考 playbook；它不是 McpApp Server 的執行時依賴。產品必須依 ADR-0061 實作並驗證對應的流程契約與可觀察產物，不能要求 MCP App Host 安裝同名 skills，也不能以 Host Agent 宣稱「已使用 skill」取代 Verification Evidence。

Host Agent 若具備這些 skills，Resume Context 或受管 Repository 的 Agent instructions 可以指示它們協助完成工作；若不具備，仍可透過相同 MCP Tools、結構化產物、核准閘門與 Evidence 完成相同流程。McpApp 只判斷輸出、狀態轉移與證據是否符合契約，不判斷 Host Agent 內部如何推理或編排。

## 1. 訪談與領域文件

- 使用 `grill-with-docs`，一次只問一個決策問題，且每題提供推薦答案。
- 可從 Repository、工具或官方文件查明的事實應自行查證，不詢問專案擁有者。
- 使用 `domain-modeling` 即時維護 `CONTEXT.md`；只在符合其門檻時新增 ADR。
- 尚未達成共同理解前，不進入 Spec 或實作。

## 2. Spec

- 達到 Spec Readiness 後使用 `to-spec`，只綜整已確認內容，不重新訪談。
- 在寫 Spec 前，先提出最高、最少且可觀察的測試 seams，取得專案擁有者確認。
- 依 `to-spec` 模板建立 `.scratch/<feature-slug>/spec.md`，狀態使用 `ready-for-agent`。
- Spec 必須使用 `CONTEXT.md` 的領域詞彙並遵守相關 ADR。

## 3. Tickets

- 使用 `to-tickets` 將核准 Spec 拆成可在單一全新 context window 完成、可獨立展示或驗證的 tracer-bullet 垂直切片。
- 每張 Ticket 必須列出真正阻擋它的 edges；不得按 schema、backend、frontend 等技術層水平拆票。
- 先向專案擁有者確認粒度、依賴、合併或拆分，再依 `docs/agents/issue-tracker.md` 發布為一票一檔。
- 實作只從未被阻擋的 frontier Ticket 開始，開始前標記為 `claimed`。

## 4. 實作與 TDD

- 使用 `implement` 執行已核准的 Spec 與 Ticket，不能自行擴張範圍。
- 依 `tdd` 只在 Spec 階段已確認的 public seams 上測試；測試外部可觀察行為，不測 private implementation details。
- 可自動化描述的行為採逐個垂直切片 Red → Green：一個失敗測試、一份最小實作，再進入下一個切片。
- 不先批次寫完所有測試，也不在 Green 階段加入推測性抽象。
- Mock 只放在外部系統、時間、隨機性或必要的檔案系統等 system boundaries；優先使用真實 public interface。
- 文件、設定、純樣式或探索工作仍需 Verification Evidence，但不為形式強迫建立沒有失敗意義的測試。
- 實作期間定期執行相關單檔測試與 typecheck，結束時執行完整測試、lint、typecheck 與 build。

## 5. Commit 與 code-review

`implement` skill 原本的「先 code-review、最後 Commit」順序不適用本專案，因為 `code-review` 只審查固定點與 `HEAD` 之間的已提交差異，而 McpApp 又要求 Commit Approval Gate。本節是明確的專案覆寫規則。

1. Ticket 開始時保存當時的 `HEAD`，作為該 Ticket 的 review fixed point。
2. 完成一個可提交單位後，向專案擁有者呈現 Diff 與 Verification Evidence。
3. 只有取得 Commit 核准後才能建立 Commit。
4. Commit 後使用 `code-review`，以 Ticket 開始時保存的 fixed point 執行 `git diff <fixed-point>...HEAD`。
5. Standards 與 Spec 兩軸依 `code-review` 規則由平行 sub-agents 獨立審查，再分欄彙整，不互相掩蓋或重新排序。
6. Finding 若需修正，回到適用的 TDD cycle；修正再次經 Commit 核准、建立追加 Commit，並對新 `HEAD` 重跑兩軸 review。

不得建立未核准的暫存 Commit、事後補核准、amend 掩蓋已審查內容，或用未提交 working tree 取代 `code-review` 所需的固定 Diff。

## 6. 驗收

Ticket 只有在下列條件全部成立後才能進入 PR 發布核准：

- Ticket Acceptance Criteria 均有可檢查結果。
- 相關與完整品質指令已實際通過並保存 Verification Evidence。
- Standards review 與 Spec review 沒有未處置的阻擋 Finding。
- 實際 Diff、Commit、Spec 與 Ticket 的關聯可追溯。
- GitHub Actions 通過；不適用時必須有核准且可查明的理由。
- 專案擁有者核准 PR 的 remote、branch、Commit、Diff、標題、內文與 Labels。

Agent 可以建立或更新 PR，但只有專案擁有者可以 Merge。McpApp 記錄 Merge Commit 後，Ticket 才能標記完成。
