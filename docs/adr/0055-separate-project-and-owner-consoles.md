# 分離 Project Console 與 Owner Console

狀態：M0 不採用；遠端存取前重新評估（見 ADR-0057）。

標準 MCP bridge 上的呼叫不能可靠證明是 Host Agent 還是人類操作，因此嵌入 MCP App Host 的 Project Console 是非特權介面，只呈現受管專案、工作流、Diff 與待處理 Approval Challenge，不能建立 Owner Session、管理 Client Grant 或產生 Approval Proof。MCP tool surface 不提供接受 Challenge 的能力；Project Console 的核准動作只能引導專案擁有者開啟本機 Owner Console。

Owner Console 由 McpApp 本機啟動器開啟，並依 ADR-0056 透過 native broker 操作不暴露於 Secure MCP Tunnel 的非 MCP loopback control endpoint，重新讀取 Challenge 權威內容並完成核准。owner root credential 不得進入 Host、iframe 或任何前端 JavaScript。核准完成後，Project Console 只刷新 Server 狀態；`basic-host` 驗證導引、核准與刷新流程，但本身不是可信核准者。這增加一次本機視窗切換，換取不依賴 Host UI 來源宣告的可驗證信任邊界。
