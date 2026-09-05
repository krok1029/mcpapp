# 核准與純 UI 互動使用 app-only 工具

M0 將 `respond_approval`、表單提交、分頁與重新整理等由 Project Console 發起的工具標記為 MCP Apps `_meta.ui.visibility: ["app"]`，使其不出現在 model-visible 工具清單。Server 仍驗證本機安裝 Token、Approval Challenge、內容雜湊或 Draft Revision、Work Session 與到期狀態；`respond_approval` 不提供 Agent-visible 替代工具，因此 Codex 遇到 Approval Gate 時必須等待專案擁有者在連到同一 Server 的 `basic-host` Project Console 回應。

一般領域能力仍提供 Agent-visible 工具，UI 專用的表單提交工具只是另一個 transport adapter，必須呼叫相同 application command 與驗證規則，不複製業務邏輯。`basic-host` 驗收必須證明 app-only 工具不對模型列出或開放。這利用標準 MCP Apps visibility 降低 Agent 意外自我核准的機率，但在 Local Owner Trust 下不構成可驗證人類身分的密碼學保證。
