Status: ready-for-agent
執行順序: 09

# 09 — Local Records and Project Lifecycle Spec

## Problem Statement

完整測試輸出、工作流狀態與圖譜可能包含本機路徑、原始碼或 credential。若資料預設上傳或誤 Commit，local-first 的隱私承諾就失效。另一方面，沒有可攜匯出與安全封存，專案擁有者也無法保存或移轉自己的開發紀錄。

## Solution

M0／MVP 使用單一 SQLite Backend，將完整 Evidence 與執行資料留在本機並執行 Secret Redaction。資料位置可經驗證後搬移；已 Provision 專案只 Archive，不自動刪除。專案擁有者可手動匯出具 schema version 與內容雜湊的 Project Record Bundle。

### Requirements and Acceptance Criteria

#### REQ-018 — Local-first、Secret Redaction 與資料生命週期

- AC-079：M0／MVP 只有一個啟用的 SQLite Storage Backend，不實作 PostgreSQL、雙寫或持續同步。
- AC-080：開發期間執行資料保存在 gitignored 本機資料目錄；正式安裝預設使用作業系統的使用者應用資料目錄。
- AC-081：Evidence 寫入與匯出前執行 Secret Redaction；偵測到 credential、Token 或其他疑似祕密時阻止 Commit 與 PR。
- AC-082：資料目錄搬移時停止新工作、複製並以檔案數量、大小與雜湊驗證後才切換；不自動合併既有目的資料。
- AC-083：已 Provision 的受管專案在 MVP 只能 Archive 與 Unarchive，不刪除 SQLite 紀錄、本機目錄或 GitHub Repository。

#### REQ-019 — Project Record Bundle

- AC-084：匯出包含 schema version、內容雜湊、結構化產物、核准、Evidence 摘要與圖譜關係的 JSON Bundle。
- AC-085：專案擁有者選擇匯出位置，並可選擇是否包含完整大型 log。
- AC-086：匯出前再次執行 Secret Redaction；Bundle 不會自動 Commit。
- AC-087：MVP 明確不承諾由 Bundle 完整匯入或還原。

## User Stories

1. As a 專案擁有者, I want to 讓完整 Evidence 預設留在本機, so that 私密輸出不會自動上傳。
2. As a 專案擁有者, I want to 只使用 SQLite, so that 第一階段資料架構保持簡單且可理解。
3. As a 專案擁有者, I want to 將開發執行資料排除於 source Repository, so that 資料庫和 log 不會被誤 Commit。
4. As a 專案擁有者, I want to 在 Evidence 寫入前遮罩疑似祕密, so that 查詢紀錄不會洩漏 credential。
5. As a 專案擁有者, I want to 在偵測到祕密時阻止 Commit 與 PR, so that 敏感內容不會送到 GitHub。
6. As a 專案擁有者, I want to 選擇新的資料位置, so that 我能管理磁碟與備份策略。
7. As a 專案擁有者, I want to 在搬移後驗證檔案數量、大小與雜湊, so that 系統不會切換到不完整副本。
8. As a 專案擁有者, I want to 保留原資料直到另行確認刪除, so that 搬移失敗可以復原。
9. As a 專案擁有者, I want to Archive 已 Provision 專案, so that 停止 Agent 工作但仍保留追溯資料。
10. As a 專案擁有者, I want to Unarchive 專案, so that 之後可以繼續新的 Milestone。
11. As a 專案擁有者, I want to 匯出具 schema version 與雜湊的 Bundle, so that 紀錄可攜且可檢查完整性。
12. As a 專案擁有者, I want to 選擇是否包含大型 log, so that 可攜性與完整度由我權衡。
13. As a 專案擁有者, I want to 在匯出時再次執行 Secret Redaction, so that 舊資料不會繞過目前規則。
14. As a 專案擁有者, I want to 明確知道 Bundle 不是完整備份還原, so that 不會依賴不存在的保證。

## Implementation Decisions

- SQLite 保存結構化工作流與 Evidence metadata；大型原始輸出經遮罩與壓縮後保存在本機檔案。
- M0／MVP 不建立 PostgreSQL schema、adapter、同步或跨資料庫 contract suite。
- 開發資料與正式安裝資料使用適合環境的本機目錄，原始碼 Repository 只保存設計與程式碼。
- Secret Redaction 是 Evidence 寫入、Commit／PR eligibility 與匯出的共同政策。
- 搬移資料位置是停止新工作的受控操作，先複製與驗證再切換；目的地已有 McpApp 資料時拒絕自動 merge。
- 未 Provision 且無外部資源的草稿可經確認刪除；已 Provision 專案在 MVP 只能 Archive。
- Archived Project 停止 Agent 工作，但保留查詢、匯出與 Unarchive。
- Project Record Bundle 是 versioned JSON export，包含摘要與關聯；大型 log 為選用內容。
- Bundle 不自動 Commit，也不提供完整 import／restore 保證。

## Testing Decisions

- 主要 seam 是 MCP Tool contracts，使用真實暫存 SQLite 與暫存本機資料目錄。
- 以代表性 credential、Token、本機路徑與普通文字驗證 redaction、false-positive 處置及 Commit／PR 阻擋。
- 測試資料搬移的成功、來源保留、雜湊不符、中途失敗與目的地已有資料拒絕。
- 測試 Archive 停止變更工具但保留 read、trace、export 與 Unarchive 能力。
- 匯出後驗證 schema version、內容雜湊、選用 log、再次 redaction，以及不產生 Git change。
- 不建立 PostgreSQL 測試；SQLite 與檔案格式只由公開讀寫與匯出結果驗證。

## Out of Scope

- PostgreSQL、Supabase、雙寫、持續同步與雲端 Evidence 儲存。
- 已 Provision 專案、本機 Repository 或 GitHub Repository 的自動刪除。
- 自動 merge 兩個 McpApp 資料目錄。
- Bundle 自動 Commit、完整 import、restore 或災難復原保證。
- 自動 Evidence retention／刪除政策。

## Further Notes

- 本 Spec 依賴 Traceability Spec，因為 Bundle 需包含完整 Artifact 關聯與圖譜摘要。
- 若未來新增遠端 Storage Backend，必須另行決策一次性 Migration、安全模型與驗收範圍。
