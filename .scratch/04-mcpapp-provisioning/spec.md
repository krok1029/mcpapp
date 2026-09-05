Status: ready-for-agent
執行順序: 04

# 04 — Repository Provisioning Spec

## Problem Statement

建立本機與 GitHub Repository 會產生真實且可能部分完成的外部副作用。若 Host Agent 自行選擇路徑、帳號、可見性或初始技術棧，專案擁有者可能得到錯誤位置、公開 Repository 或無法重現的初始狀態；失敗後自動清理也可能刪除仍有價值的成果。

## Solution

先建立完整 Repository Plan 並取得核准，再以可冪等重試的 Provisioning Run 建立全新本機目錄、預設 Private 的 GitHub Repository，以及唯一一次直接進入 `main` 的 Bootstrap Commit。實際結果偏離計畫時立即停止並保留部分成果。

### Requirements and Acceptance Criteria

#### REQ-008 — Repository Plan 與 Provisioning

- AC-031：Repository Plan 包含名稱、用途、完整目的路徑、GitHub owner、Private 可見性、專案類型、語言、框架、Runtime、套件管理器、Stack Profile、初始依賴、品質指令、結構輪廓、CI、產物、假設與風險。
- AC-032：核准前顯示實際 GitHub CLI account；未登入時只提示專案擁有者自行登入，不收集 GitHub Token。
- AC-033：Provisioning Run 只產生核准計畫中的內容與唯一 Bootstrap Commit；任何偏離都停止流程。
- AC-034：部分失敗時保留已建立資源、逐步顯示結果並支援冪等重試，不自動刪除或重複建立資源。

## User Stories

1. As a 專案擁有者, I want to 在建立 Repository 前看見完整計畫, so that 我能控制位置與技術選擇。
2. As a 專案擁有者, I want to 核准完整目的路徑, so that McpApp 不會寫入意外位置。
3. As a 專案擁有者, I want to 看見實際 GitHub account, so that 遠端 Repository 不會建立在錯誤 owner 下。
4. As a 專案擁有者, I want to 預設使用 Private visibility, so that 未完成專案不會意外公開。
5. As a 專案擁有者, I want to 沿用 GitHub CLI 登入, so that McpApp 不必收集 Token。
6. As a Host Agent, I want to 從核准 Spec 產生 Repository Plan, so that 初始結構連回已決定需求。
7. As a Host Agent, I want to 只建立計畫內的檔案與依賴, so that Provisioning 不會自行擴張範圍。
8. As a 專案擁有者, I want to 只允許一次 Bootstrap Commit, so that 空白 Repository 能建立 `main` 且後續都走 PR。
9. As a 專案擁有者, I want to 在每個步驟看到結果, so that 失敗時能知道哪些資源已存在。
10. As a 專案擁有者, I want to 從失敗步驟安全重試, so that 不會重複建立 Repository 或 Commit。
11. As a 專案擁有者, I want to 保留部分成果, so that 系統不會以自動清理造成資料損失。
12. As a 專案擁有者, I want to 在清理前另行核准, so that 刪除本機與遠端資源是獨立決策。

## Implementation Decisions

- 受管專案可以在沒有 Repository 時存在；只有核准 Spec 與 Repository Plan 後才能 Provision。
- MVP 只建立全新本機與 GitHub Repository，不接管既有 Repository。
- Repository Plan 是不可含糊的建立契約，實際輸出不得自行接受偏差。
- GitHub 操作只透過已登入的 GitHub CLI，Server 不保存 GitHub credential。
- Provisioning Run 分解成可持久化、可檢查且冪等的步驟。
- Bootstrap Commit 只包含核准的初始結構、領域與 Agent 文件、Spec 快照、品質指令、CI、README 與必要設定。
- Bootstrap Commit 是唯一可直接 Push 至 `main` 的 Agent 建立 Commit，不屬於 Ticket 或 PR。
- TypeScript Stack Profile 提供固定名稱的 Typecheck、Lint、Test 與 Build 指令；不適用項目需明確理由。

## Testing Decisions

- 主要 seam 是 MCP Tool contract 串接真實暫存 Git Repository 與 recording Fake GitHub adapter。
- 驗證沒有 Spec 核准、Plan 核准、GitHub login 或正確目的路徑時無法開始 Provisioning。
- 對每個外部副作用注入中斷，驗證已完成步驟被保留、重試不重複建立，且偏差會停止。
- 以真實 Git 驗證 Bootstrap Commit 內容、branch 與唯一性；一般 CI 不建立真實 GitHub 資源。
- 少量真實 GitHub E2E 必須顯式啟用並使用隔離 Private Repository。

## Out of Scope

- 接管或轉換既有 Repository。
- GitHub 以外的 forge，以及 Public Repository 預設值。
- 自動執行 `gh auth login` 或保存 GitHub Token。
- Provisioning 失敗後自動刪除本機或遠端資源。
- Ticket 功能、一般 Commit、PR、部署與多語言 Stack Profile。

## Further Notes

- 本 Spec 依賴已核准的 Spec Definition Workflow。
- Provisioning 驗收後，後續所有功能變更必須使用一 Ticket、一 Branch、一 PR 的交付流程。
