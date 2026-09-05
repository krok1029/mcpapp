---
status: superseded by ADR-0013
---

# 使用五個人工核准閘門

McpApp 在 Spec、Repository 建立、Ticket、程式變更與 Commit 設置人工核准閘門。受管專案先以資料庫中的草稿存在，直到 Spec 核准且開發棧與完整目的路徑均獲確認後，才建立全新的 Repository。Codex 可在其他閘門之間連續執行工作並保存證據，失敗時停止並說明原因。
