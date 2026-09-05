# Red 階段保存為證據而非失敗 Commit

Red 階段記錄測試內容雜湊、指令、輸出與預期失敗原因，不建立獨立失敗 Commit；測試與使其通過的最小實作一起提交。Red 與 Green 必須使用相同測試內容，測試改變時重新取得 Red Evidence；Red 必須因預期缺少的行為而失敗，Refactor 前後則對相同測試集合保持 Green。每個 Commit 都必須通過與本次變更相關的驗證，PR 最終 HEAD 通過完整 CI。
