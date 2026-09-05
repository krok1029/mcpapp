# 沿用 GitHub CLI 的登入狀態

MVP 只透過專案擁有者已登入的 `gh` CLI 存取 GitHub，不收集、顯示或保存 GitHub Token。McpApp 在建立 Repository 與發布 PR 前檢查登入狀態，並在核准畫面顯示實際 account；尚未登入時只提示使用者自行完成 `gh auth login`。
