# 透過原生桌面殼層代理專案擁有者操作

狀態：M0 不採用；遠端存取前重新評估（見 ADR-0057）。

Owner Console 必須在受控的原生桌面殼層中呈現；可以重用 React UI，但所有建立 Owner Session、管理 Client Grant 與回應 Approval Challenge 的特權操作，都由 native broker 取用作業系統 credential store 中的 owner root credential，並直接呼叫非 MCP loopback control endpoint。前端 JavaScript 只傳遞專案擁有者的操作意圖，不得取得 root credential、可重放的 Owner token 或直接呼叫特權端點。

一般瀏覽器、MCP App iframe 與 Project Console 即使能顯示相同資訊，也不能完成核准或 Grant 管理。Owner Console 每次啟動都需要明確解鎖；native broker 在平台支援時使用作業系統的 user-presence 驗證，缺少該能力的平台必須另有經核准的安全退化方案。這引入桌面封裝與 native bridge 的維護成本，換取 owner credential 不暴露於 Host Agent 或網頁執行環境的可驗證邊界。
