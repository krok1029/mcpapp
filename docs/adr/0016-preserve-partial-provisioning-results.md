# Repository 建立失敗時保留部分成果

Provisioning Run 失敗時，McpApp 不自動刪除已建立的本機或 GitHub 資源，而是標記 `PROVISIONING_FAILED`、呈現成功與失敗步驟，並讓專案擁有者選擇從失敗處重試或另行核准清理。每個步驟必須可冪等重試，避免重複建立遠端 Repository、覆寫檔案或產生額外 Commit。
