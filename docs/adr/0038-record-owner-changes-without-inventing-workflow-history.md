# 如實保存專案擁有者的 Manual Change

受管 Repository 不強制保護 `main`，專案擁有者可以自行修改或直接 Commit。McpApp 偵測到未提交變更時，可由擁有者選擇匯入 Active Ticket 或建立 Manual Change；偵測到直接位於 `main` 的 Commit 時，則連結實際 Commit、File 與擁有者提供的原因。系統不得補造 Ticket、PR 或測試證據，缺少的驗證必須明示；Host Agent 對 Requirement 影響只能先建立未確認的 Inferred Relationship。
