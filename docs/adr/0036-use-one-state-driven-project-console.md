# MCP App 使用單一狀態驅動的 Project Console

MVP 使用一個 React + Vite UI Resource 作為 Project Console，由 MCP Tool 回傳的工作流狀態決定顯示 Project Overview、Spec Editor／Version Diff、Repository Plan、Backlog Map／Ticket Review、Execution Evidence、Diff／Review Findings、PR Publish 或 Traceability Subgraph。所有工具共用同一 UI bundle 與結構化 contracts，不建立獨立 Next.js 網站。

Spec Editor 依 ADR-0022 使用 debounced autosave，且在切換狀態或開始核准前必須先保存最新 Draft Revision。
