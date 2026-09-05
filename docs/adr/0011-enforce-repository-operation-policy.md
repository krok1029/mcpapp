---
status: superseded by ADR-0013
---

# 對 Repository 操作實施分級權限

讀取、搜尋、Git status、Diff 與 Ticket 計畫內的驗證可自動執行；Ticket 核准後，Codex 可在受管專案內新增或修改檔案，並於變更閘門審查整體 Diff。刪除或移動檔案、變更依賴及計畫外指令必須即時確認。MVP 禁止 Push、Force Push、Reset、Clean、Rebase、修改 Repository 外檔案及影響範圍不明的指令。
