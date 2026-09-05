# 未確認的圖譜推論不得驅動阻擋性決策

每條知識圖譜 Edge 分別記錄來源（explicit、derived、inferred）、信心水位（high、medium、low）與審核狀態（unreviewed、confirmed、rejected）。Inferred Relationship 必須附上 Evidence 與解釋；未經專案擁有者確認前可以呈現建議，但不能令 Ticket 失效、阻擋 PR 或宣告 Requirement 完成。系統不使用無法校準的浮點信心分數。
