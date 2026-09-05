# 使用 Drizzle ORM 實作 Storage Adapter

M0／MVP 使用 Drizzle ORM 與 SQLite；Domain 與 Application 層不直接依賴 Drizzle。MVP 不建立 PostgreSQL schema、migration adapter 或共享的跨資料庫 contract test suite。

未來若依 ADR-0017 決定新增 Supabase PostgreSQL Backend，可使用 Drizzle PostgreSQL dialect；由於 SQLite 與 PostgreSQL 沒有共通 table object，屆時應各自維護 schema 與 migration adapter，並以共享 contract 測試驗證替換後的行為一致。這是未來設計方向，不是 MVP 交付範圍。
