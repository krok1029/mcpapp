# 在 GitHub Actions 重跑開發棧品質檢查

TypeScript Stack Profile 必須為新 Repository 建立最小 GitHub Actions workflow，在每次 PR 的乾淨環境執行安裝、Typecheck、Lint、Test 與 Build。McpApp 將 GitHub Checks 結果保存為遠端 Verification Evidence；CI 未通過時 Ticket 不得完成，修正與再次 Push 仍受既有核准規則約束。
