# 分層測試工作流、Git 與 GitHub 整合

Domain 狀態機、核准、版本與圖譜規則使用 Vitest unit tests；Storage 以共享 contract tests 驗證各 Backend；Git integration tests 在臨時目錄操作真實 Repository；GitHub Adapter 在一般 CI 使用 Fake，少量真實 GitHub E2E 必須明確啟用並使用隔離的 Private Repository。Project Console 使用 Vitest、Testing Library 與 Playwright，並以 MCP Apps `basic-host` 驗證完整 UI 與 write tools。Codex 驗證無 UI 的完整 Agent 工作流；ChatGPT Pro 只驗證目前方案允許的對話、UI 與 read/fetch 相容性。一般 CI 不得任意建立或刪除真實 GitHub 資源。

依 ADR-0059，`basic-host` 測試必須確認 app-only 工具不出現在 model-visible 工具清單，且 Approval Challenge 只能由 Project Console 的 app-only 工具回應。
