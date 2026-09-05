# 領域物件使用穩定且不重用的 ID

Requirement、Acceptance Criterion、Ticket 與 Evidence 在資料庫使用不可變全域 ID，在 UI 與文件使用專案內可讀且永不重用的流水號，例如 `REQ-001`、`AC-001`、`TICKET-001` 與 `EVD-001`。文字修正可保留 ID；行為或驗收語意實質改變時建立新 ID，並以 `supersedes` 關係連回舊項目。每個 Spec Version 只引用當時有效的 ID 集合，不改寫歷史。
