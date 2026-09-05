Status: ready-for-agent
執行順序: 06

# 06 — Controlled Implementation and Evidence Spec

## Problem Statement

Agent 可以產生程式碼與測試，但任意 Shell、無限制檔案寫入和沒有實際輸出的完成宣告無法提供可信交付。具有本機檔案能力的 Host 也可能直接修改 Repository，使 McpApp 保存的狀態與真實工作樹不一致。

## Solution

提供受 Active Ticket、允許路徑、基準內容與核准政策限制的受控 Repository 操作，以及只能執行 Stack Profile 品質指令的受控驗證。所有自動化結果保存為 Verification Evidence；可自動化行為採 TDD。Commit 前比較實際 Git 狀態，並讓專案擁有者處置 Out-of-band Change。

### Requirements and Acceptance Criteria

#### REQ-010 — 受控 Repository 操作

- AC-040：Agent-visible 工具提供受 Active Ticket 約束的讀取、搜尋、套用 Patch、狀態與 Diff，不提供任意 Shell 或通用 Git。
- AC-041：每次寫入驗證受管 Repository、允許路徑、基準內容與路徑逸出，並保存輸入、結果、Git HEAD 與工作樹指紋。
- AC-042：刪除、移動、依賴變更與其他 High-risk Operation 必須取得額外即時核准。
- AC-043：Build 與驗證只能執行 Stack Profile 核准的命令；計畫外命令不能自行執行。
- AC-044：Force Push、Reset、Clean、Rebase 與受管 Repository 外寫入在 MVP 被拒絕。

#### REQ-011 — Verification Evidence 與 TDD

- AC-045：受控工具保存指令、工作目錄、時間、結束碼、經遮罩輸出、Git HEAD、工作樹狀態與 Stack Profile。
- AC-046：Host Agent 文字宣告不能單獨成為自動化 Evidence；人工或視覺驗證必須由專案擁有者明確確認。
- AC-047：可自動化行為變更保存預期失敗的 Red、最小實作通過的 Green，以及適用時前後皆 Green 的 Refactor Evidence。
- AC-048：Red 與 Green 使用相同測試內容；測試改變時重新取得 Red Evidence；Red 不建立獨立失敗 Commit。
- AC-049：文件、設定與純樣式可使用 Build、Typecheck、Lint、視覺或人工 Evidence；Research 與 Prototype 不強迫無意義測試。
- AC-050：每次受控執行原始輸出預設上限 10 MB；超限停止並標記 `OUTPUT_LIMIT_EXCEEDED`，不可截斷後視為通過。

#### REQ-012 — Commit 與 Out-of-band Change

- AC-051：Commit 前顯示累積 Diff、Verification Evidence、Commit 摘要與 Git 狀態，並取得專案擁有者核准。
- AC-052：每個 Commit 通過相關驗證，並可追溯至 Active Ticket、Spec Version 與 Evidence。
- AC-053：在 Commit、Review 與 PR 閘門前重新比對 Git HEAD 與工作樹指紋；發現 Out-of-band Change 時停止。
- AC-054：專案擁有者可選擇把未提交變更納入 Active Ticket、排除本次交付、核准還原或取消 Ticket。
- AC-055：專案擁有者直接 Commit 以 Manual Change 如實記錄，不補造 Ticket、PR 或測試 Evidence。

## User Stories

1. As a Host Agent, I want to 透過受控讀取與搜尋理解 Repository, so that 不具本機檔案能力時仍能工作。
2. As a Host Agent, I want to 用帶基準內容的 Patch 修改檔案, so that stale patch 不會覆寫新內容。
3. As a 專案擁有者, I want to 把寫入限制在受管 Repository 與 Active Ticket, so that Agent 不會擴張範圍。
4. As a 專案擁有者, I want to 對刪除、移動與依賴變更即時核准, so that 高風險副作用不被一般 Ticket 授權涵蓋。
5. As a Host Agent, I want to 執行 Stack Profile 核准的品質指令, so that 驗證具有一致名稱與意義。
6. As a 專案擁有者, I want to 保存實際命令輸出與 Git 指紋, so that Agent 自述不能取代證據。
7. As a 專案擁有者, I want to 看見 Red 因缺少預期行為而失敗, so that 測試能證明是 test-first。
8. As a Host Agent, I want to 把 Red 測試與最小 Green 實作一起提交, so that 每個 Commit 都保持可驗證。
9. As a Host Agent, I want to 對文件與樣式採合適 Evidence, so that 不必製造沒有價值的測試。
10. As a 專案擁有者, I want to 阻止過大的不完整輸出被視為通過, so that Evidence 保持可檢查。
11. As a 專案擁有者, I want to 在 Commit 前查看 Diff 與 Evidence, so that 我知道自己核准什麼。
12. As a Host Agent, I want to 在每個 Commit 後保留 Ticket 與 Evidence 關聯, so that Review 能取得完整輸入。
13. As a 專案擁有者, I want to 偵測工作流外修改, so that 真實工作樹不會和 McpApp 狀態分叉。
14. As a 專案擁有者, I want to 選擇如何處置未提交修改, so that 系統不會擅自還原或納入。
15. As a 專案擁有者, I want to 把直接 Commit 記為 Manual Change, so that 缺少的 Ticket 或 Evidence 不會被捏造。

## Implementation Decisions

- MCP Server 暴露高階領域工具與窄介面 Repository 操作，不提供 generic shell 或 generic Git。
- Host Agent 負責理解與產生 Patch；McpApp 驗證並執行，因此仍是控制層而非 Agent Runtime。
- 寫入工具驗證基準內容、路徑、Active Ticket 範圍與高風險政策。
- 受控驗證只允許 Stack Profile 中核准且具實際意義的固定品質指令。
- Evidence 原始輸出先 Secret Redaction、壓縮並保存在本機；SQLite 保存 metadata、摘要、路徑與雜湊。
- Red 記為 Evidence 而不是失敗 Commit；測試內容改變時原 Red 不再證明新測試。
- 每個 Commit 是可獨立核准的小型單位，但 Ticket Review 使用累積 Diff。
- 每個受控步驟保存 Git HEAD 與工作樹指紋；Host 直接寫入靠差異偵測而非提示詞防護。
- Manual Change 只描述真實來源與證據缺口，不建立虛構工作流歷史。

## Testing Decisions

- 主要 seam 是 MCP Tool contracts，搭配真實暫存 Git Repository 與真實暫存 SQLite。
- 對路徑逸出、stale base、Ticket 外檔案、未核准 High-risk Operation 與禁止 Git 操作做負向整合測試。
- 以真實測試命令建立 Red、Green、Refactor Evidence，驗證內容雜湊、輸出、狀態與 Commit eligibility。
- 對 10 MB 上限、Secret Redaction、非零 exit、被中止與輸出保存失敗測試不可誤判通過。
- 直接修改暫存 Repository 以測試 Out-of-band Change 的四種處置與 Manual Change。
- Mock 只用於時間、隨機性或不可安全重現的外部邊界，不 mock 核心狀態機與 Git public behavior。

## Out of Scope

- 任意 Shell、通用 Git、Repository 外寫入與未核准的高風險操作。
- 用 Host Agent 自述或聊天紀錄作 Verification Evidence。
- 為文件、設定、純樣式、Research 或 Prototype 強制建立無意義測試。
- Review Finding、Push、PR 建立、CI 結果與 Merge。
- 自動處置或隱藏 Out-of-band Change。

## Further Notes

- 本 Spec 依賴核准且已啟動的 Ticket。
- Local Records Spec 會完成完整資料位置、Secret Redaction 與保存生命週期；本 Spec 必須先依同一安全契約產生 Evidence。
