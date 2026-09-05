# 強制流程契約而非 Skill 套件

McpApp 自身的開發必須遵循 `grill-with-docs → to-spec → to-tickets → implement（搭配 tdd）→ code-review → 驗收` 的 skill chain，詳細規則由 `docs/agents/development-workflow.md` 定義。這組 skills 同時作為受管專案理想工作流的參考 playbook，但不成為 McpApp Server、Project Console 或任何 MCP App Host 的執行時依賴。

產品將 skill chain 的意圖表達為 Host-neutral、可觀察且可驗證的流程契約，包括：逐題收斂且達到 Spec Readiness 的訪談、結構化並經核准的 Spec、可追溯的垂直 Ticket、在已確認 public seams 上產生的 TDD 與 Verification Evidence、針對凍結 Diff 的 Standards／Spec Review，以及完成條件與專案擁有者核准。McpApp 驗證結構化產物、狀態轉移、核准與 Evidence，不接受 Host Agent 自述「已使用某個 skill」作為通過依據，也不觀察或限制 Host Agent 的內部推理方式。

Host Agent 若已安裝相容 skills，Resume Context 或受管 Repository 的 Agent instructions 可以建議使用它們；未安裝同名 skills 的 Host 仍必須能透過相同 MCP Tools 與契約完成工作。這保留本 Repository 的一致開發紀律，同時遵守 ADR-0047 的 Host-neutral 邊界，並避免把本機 Codex 設定誤寫成跨 Host 的產品能力。代價是流程語意不能只存在於 skill 指令中：每項阻擋性規則都必須在產品的領域模型、工具 schema、狀態機或 Evidence 驗證中有明確表達與測試。
