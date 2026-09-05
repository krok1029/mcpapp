---
status: superseded by ADR-0006
---

# 使用四個人工核准閘門

McpApp 只在 Spec、Ticket、程式變更與 Commit 設置人工核准閘門。Codex 可連續執行 Red、Green 與 Refactor 並保存證據，失敗時停止並說明原因，但不要求每一步都由專案擁有者確認。這在保留關鍵決策控制權的同時，避免 TDD 流程因過多互動而失去效率。
