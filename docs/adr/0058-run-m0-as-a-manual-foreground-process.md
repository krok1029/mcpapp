# M0 以前景程序手動執行 McpApp Server

M0 由專案擁有者使用 Repository 內單一開發指令，手動啟動 McpApp Server 與所需的 UI build/watch；Server 作為獨立於 Host 的前景程序，在該次開發工作期間持續供 Codex 與 MCP Apps `basic-host` 共用。第一次啟動建立 ADR-0057 定義的本機 Token 檔案；若 Server 未執行，Host 必須清楚回報 McpApp unavailable。

M0 仍實作單一實例鎖、graceful shutdown 與重啟後工作流狀態復原，但不建立作業系統背景 service、登入自啟、tray、桌面安裝器或自動更新。這保留單一 Server 與持久狀態模型，同時把產品尚未驗證前的封裝及程序管理成本延後。
