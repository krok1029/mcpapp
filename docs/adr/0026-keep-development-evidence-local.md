# 開發證據預設只保存在本機

MVP 採 local-first：SQLite、完整驗證輸出、工作流紀錄與知識圖譜只留在本機，只有經核准的 Git Commit、PR 內容、PR Label 與 GitHub Actions 必要檔案可以傳送到 GitHub。Evidence 寫入前必須遮罩疑似祕密，PR 只引用 Evidence ID 與摘要；偵測到 credential、token 或其他疑似祕密時阻止 Commit 與 PR。未來遷移 Supabase 必須由專案擁有者主動啟用。
