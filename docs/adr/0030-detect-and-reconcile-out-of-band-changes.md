# 偵測並處置 Out-of-band Change

McpApp 無法禁止 Host Agent 或使用者直接修改 Repository，因此每個受控步驟保存 Git HEAD 與工作樹指紋，並在 Commit、Review 與 PR 閘門前重新比對。發現 Out-of-band Change 時停止流程，由專案擁有者選擇匯入目前 Ticket、排除於本次交付、核准還原或取消 Ticket。受管 Repository 的 `AGENTS.md` 會要求 Host Agent 優先遵循 McpApp 工作流，但安全保證來自差異偵測而非提示詞。
