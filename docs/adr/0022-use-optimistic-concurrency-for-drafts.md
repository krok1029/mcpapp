# 草稿使用樂觀鎖避免靜默覆寫

每份 Spec 草稿具有遞增 Draft Revision，MCP App UI 與 Host Agent 更新時都必須帶上讀取時的 Revision。若版本已改變，系統拒絕覆寫並顯示欄位級差異，由專案擁有者解決衝突；不採用最後寫入者勝出，以免靜默遺失 Requirement 或 Acceptance Criterion。

Project Console 採用約一秒的 debounced autosave：欄位先更新本機 UI，停止輸入後把一批變更連同目前 Draft Revision 提交，成功後接收下一個 Revision。遇到衝突時停止 autosave且不得自動重試覆寫；離開編輯畫面或建立 Approval Challenge 前必須先 flush 尚未提交的變更，核准只能綁定已成功保存的最新 Revision。意外重載最多允許遺失尚未到 debounce 時點的本機輸入。

Revision 衝突時保留本機輸入，並以原先讀取的 Base、本機 Mine 與 Server 最新 Current 顯示欄位級三方解決；處理完成前停止編輯與 autosave。不重疊的欄位變更保留雙方結果，同一欄位兩邊都變更時必須逐欄選擇 Mine、Current 或手動內容；Requirement 與 Acceptance Criterion 依穩定 ID 而非陣列位置比對，刪除與修改同一項一律視為衝突。解決結果以最新 Server Revision 整份重新提交，若期間再次變更則重新解決；M0 不做文字內逐字合併或 last-write-wins。
