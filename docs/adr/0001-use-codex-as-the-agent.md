# 使用 Codex 作為開發 Agent

狀態：已由 ADR-0047 取代。

MVP 直接使用 Codex Desktop 內建的 Agent 執行需求分析、程式修改與 Review；McpApp 只負責工作流控制、人工核准、安全工具、執行證據與知識圖譜。這項邊界犧牲了跨 Host 的獨立執行能力，但避免在第一版重建模型迴圈、對話記憶與檔案操作能力。
