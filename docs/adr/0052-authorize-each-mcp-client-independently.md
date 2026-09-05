# 分別授權每個 MCP Client

狀態：M0 不採用；遠端存取前重新評估（見 ADR-0057）。

McpApp 不讓 Host 共用一把安裝 Token。安裝時建立的 owner root credential 只保存在作業系統 credential store，用來配對 Client 與管理 Grant；Codex、MCP Apps `basic-host` 及 Secure MCP Tunnel 路徑各自取得具有穩定 Client 身分、最小權限範圍且可獨立撤銷與輪替的 Client Grant。MVP 的 ChatGPT Pro 路徑只取得 read 權限；Codex 與 `basic-host` 才能取得 work 權限。

遠端 OAuth identity 必須映射至相同 Client Grant 模型，不建立另一套權限事實來源。Secret 只以不可還原形式保存於 Server，或保存在作業系統 credential store，不得以明文進入 SQLite、Repository、Evidence 或日誌；owner root credential 只能由 ADR-0056 定義的 native broker 取用。MCP client metadata 只作稽核，不能建立 Client 身分或提升權限。這增加配對、撤銷與輪替流程，但避免單一共享秘密外洩後危及所有 Host，並讓 Work Session 的持有與交接可歸因至穩定 Client。

Client Grant 只授權 Client 能力，不能代表專案擁有者接受 Approval Gate；核准身分與證據依 ADR-0053 分離處理。
