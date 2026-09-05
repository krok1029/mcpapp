# 受管 Repository 使用固定文件配置

受管 Repository 在根目錄保存 `AGENTS.md` 與只含 Glossary 的 `CONTEXT.md`，於 `docs/specs/<milestone-id>/vNNN.md` 保存不可覆寫的 Spec Version、`docs/tickets/<ticket-id>.md` 保存核准 Ticket 與最終交付摘要、`docs/adr/` 保存少量架構決策，並於 `.github/workflows/ci.yml` 提供 Stack Profile CI。完整原始 Evidence 保留在本機 Storage，不全部寫入 Git。
