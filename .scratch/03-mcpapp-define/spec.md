Status: ready-for-agent
執行順序: 03

# 03 — Spec Definition Workflow Spec

## Problem Statement

模糊想法若只留在聊天裡，Host Agent 無法可靠判斷何時已經理解需求，專案擁有者也無法精確知道自己核准了什麼。當 Project Console 與 Host Agent 同時編輯草稿時，簡單的最後寫入者勝出還會造成需求遺失。

## Solution

提供從對話訪談、Spec Readiness、結構化草稿、樂觀鎖共同編輯，到不可變 Spec Version 核准的完整 Define 流程。Requirement 與 Acceptance Criterion 使用穩定 ID，所有核准都綁定已保存的最新 Draft Revision。

### Requirements and Acceptance Criteria

#### REQ-002 — 訪談與 Spec Readiness

- AC-005：Readiness Checklist 涵蓋目標使用者、問題、範圍、核心情境、Requirement、Acceptance Criterion、Repository Plan 限制、矛盾與重大風險。
- AC-006：阻擋 Repository 建立或第一張 Ticket 的 Open Question 在核准前全部解決。
- AC-007：非阻擋 Open Question 可明確保留，但不得誤示為已決定。
- AC-008：Project Console 顯示逐步成形的結構化 Spec，不以聊天逐字稿取代。

#### REQ-003 — 結構化、版本化的 Spec

- AC-009：可核准 Spec 包含願景、目標使用者、問題、目標、非目標、核心情境、Requirement、Acceptance Criterion、限制、假設、Open Question 與成功條件。
- AC-010：Requirement 與 Acceptance Criterion 使用專案內可讀且永不重用的穩定 ID。
- AC-011：核准建立不可原地覆寫的 Spec Version，並產生 Git 可攜的人類可讀快照。
- AC-012：核准後的語意變更建立新草稿與新 Spec Version，不改寫歷史或既有 Commit 關聯。

#### REQ-004 — 安全的草稿共同編輯

- AC-013：每次更新帶入讀取時的 Draft Revision；stale write 被拒絕且不改變 Server 內容。
- AC-014：Project Console 約一秒 debounced autosave，離開畫面或建立 Challenge 前 flush 修改。
- AC-015：衝突時停止 autosave、保留本機輸入，並以 Base、Mine、Current 顯示欄位級三方解決。
- AC-016：Requirement 與 Acceptance Criterion 依穩定 ID 比對；同一項目的刪除與修改視為衝突。
- AC-017：核准只綁定成功保存的最新 Draft Revision；內容再次改變會使 Challenge 失效。

#### REQ-005 — Spec 核准閘門

- AC-018：MVP 的六種核准閘門中，Define 流程實施 Spec 核准並提供後續閘門共用的契約。
- AC-019：Approval Challenge 綁定操作、受管專案、Work Session、內容 Revision 或雜湊及到期狀態，且不可重放。
- AC-020：內容改變、Challenge 過期或已使用時，Server 拒絕核准與後續操作。
- AC-021：核准結果保存為 Approval Proof 與 Evidence，不向 Host Agent 回傳可轉交的核准秘密。

## User Stories

1. As a 專案擁有者, I want to 從一句想法開始訪談, so that 不必先準備正式需求文件。
2. As a 專案擁有者, I want to 一次回答一個重要問題, so that 決策負擔保持清楚。
3. As a Host Agent, I want to 依 Readiness Checklist 判斷訪談是否完成, so that 不靠主觀百分比或固定題數。
4. As a 專案擁有者, I want to 保留非阻擋 Open Question, so that 不必為不影響首張 Ticket 的事情延遲進度。
5. As a 專案擁有者, I want to 在 Project Console 查看與編輯 Spec, so that 核准內容是結構化產物。
6. As a 專案擁有者, I want to 讓輸入自動保存, so that 不必每次手動提交欄位。
7. As a 專案擁有者, I want to 在核准前強制 flush, so that Challenge 不會綁定舊草稿。
8. As a 專案擁有者, I want to 在衝突時保留 Mine, so that 本機輸入不會消失。
9. As a 專案擁有者, I want to 逐欄選擇 Mine、Current 或手動內容, so that 重疊修改能由我決定。
10. As a Host Agent, I want to 使用穩定 Requirement ID, so that 後續 Ticket 可以長期追溯。
11. As a 專案擁有者, I want to 核准不可變 Spec Version, so that 歷史內容不會被事後改寫。
12. As a 專案擁有者, I want to 讓過期 Challenge 自動失效, so that 我只會核准實際看過的內容。
13. As a Host Agent, I want to 取得核准後的 Spec 快照, so that Repository Planning 使用明確基準。
14. As a 專案擁有者, I want to 在語意改變時建立新版本, so that 舊 Commit 的需求關聯仍然真實。

## Implementation Decisions

- 訪談在 Host 對話進行，Project Console 同步呈現結構化草稿；聊天不是事實來源。
- Readiness 依明確 checklist，不用完成百分比或固定問卷。
- Artifact 先保存結構化資料，核准後再輸出人類可讀快照。
- Requirement 與 Acceptance Criterion 使用不可重用的可讀流水號及不可變全域身分。
- Draft Revision 單調遞增；每次寫入都採 optimistic concurrency。
- autosave 約一秒 debounce，衝突後停止自動重試，避免 last-write-wins。
- 三方解決以穩定項目 ID 比對，M0 不做文字內逐字 merge。
- Approval Challenge 與 Proof 使用 Host Console Spec 定義的 app-only 與 Local Owner Trust 邊界。
- 核准版本不可原地修改；後續變更建立新 draft，Impact Analysis 由 Traceability Spec 完成。

## Testing Decisions

- 主要 seam 是 Streamable HTTP MCP Tool contracts，搭配真實暫存 SQLite 測試完整 Define 狀態轉移。
- Project Console 經 `basic-host` 測試輸入、debounced autosave、離開前 flush、核准與版本差異。
- 以兩個 Client 對同一 Draft Revision 寫入，驗證 stale rejection 與 Base／Mine／Current 解決結果。
- 以穩定 ID 測試新增、刪除、重排、修改與刪改衝突，不觀察資料表或 React state。
- 測試 Challenge 在 revision 改變、過期與使用後失效，以及成功核准只產生一個 Spec Version。

## Out of Scope

- 固定問卷、以聊天逐字稿作為 Spec，以及自動核准。
- 文字內逐字 merge、last-write-wins 與無 revision 的草稿更新。
- Repository 建立、Ticket、實作、Review、PR 與圖譜；由後續 Specs 負責。
- 多人身分與遠端核准。

## Further Notes

- 本 Spec 依賴 Runtime Foundation 與 Host-neutral Project Console。
- 完成本 Spec 即完成 M0 Define；M0 必須能以 `basic-host` 示範並在 Server 重啟後恢復。
