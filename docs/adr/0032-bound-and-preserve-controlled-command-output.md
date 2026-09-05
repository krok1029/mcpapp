# 限制並完整保存受控指令輸出

每次受控執行預設最多產生 10 MB 原始輸出，經 Secret Redaction 後壓縮保存於本機檔案；SQLite 只保存 metadata、摘要、路徑與雜湊。輸出超過上限時立即停止並標記 `OUTPUT_LIMIT_EXCEEDED`，不得截斷後視為完整證據；專案擁有者可以核准較大的單次上限後重跑。MVP 不自動刪除 Evidence。
