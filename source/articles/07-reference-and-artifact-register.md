**7. 全部引用与产物总目录**

[阅读入口](README.md) · [上一篇](06-review-and-engineering.md)

本目录把外部来源、研究事实、假设、模型、代码、输出和结论连接起来。覆盖范围是研究 001 中整理前已有的 17 个文件、12 个已引用公开链接，以及本次新增的学习文章和复现产物。新增的 S5 出版社 PDF 链接用于核对书目信息，同样列明。

本目录不声称涵盖该领域的全部文献。源文献实际读取范围以[来源审计](../source-audit.md)为准；未取得全文或原始数据的来源不提升证据等级。

**7.1 专业标准 S1、S2**

| ID | 可核对的引用身份 | 原始入口与读取位置 | 本轮用途与边界 |
|---|---|---|---|
| S1 | ICCE、ASOIF、Leeds Metropolitan University. *International Sport Coaching Framework*, Version 1.2, 2013 | [出版社书目信息](https://us.humankinetics.com/products/international-sport-coaching-framework-version-1-2-pdf)；[ICCE 资源页](https://icce.ws/resources/)；[已读公开节选](https://us.humankinetics.com/blogs/excerpt/all-coaches-should-strive-to-fulfill-these-six-primary-functions)的 Primary Functions 部分 | 界定职责。全书未取得；未断言该版是所有地区唯一现行要求 |
| S2 | SHAPE America. *National Standards for Sport Coaches*，本文译作《体育教练员国家标准》。本轮访问日期 2026-10-23；网页明确版次日期 UNKNOWN | [官方页面](https://shapeamerica.org/standards/coaching/)，已读七类职责、42 项标准；第一篇列出各类概述及条目范围，第三篇保留选定条款的数学对象对应 | 用于职责覆盖与流程研究的参照；七类不是执行顺序。未整套采纳为产品验收标准 |

使用位置：[第 1 篇职责说明](01-question-and-standards.md)、[第 3 篇完整对应](03-model-and-assumptions.md)、[第 6 篇覆盖审核](06-review-and-engineering.md)、[findings.md](../findings.md)。

**7.2 教练研究 S3、S4 与首例 S5**

| ID | 引用身份 | 原始链接 | 已读范围与支持边界 |
|---|---|---|---|
| S3 | Sandbakk、Tønnessen、Bucher Sandbakk、Losnegard、Seiler、Haugen（2025）。*Best-Practice Training Characteristics Within Olympic Endurance Sports as Described by Norwegian World-Class Coaches*. Sports Medicine - Open, 11, 45. DOI: 10.1186/s40798-025-00848-3 | [出版方原文](https://link.springer.com/article/10.1186/s40798-025-00848-3) | 摘要、背景、方法、相关讨论、局限和数据声明；未逐表逐段精读全文。用于实践背景与假设，不作为可拟合的决策日志 |
| S4 | Wouter Timmerman、Mandy Stanley、Annette Raynor、Nathan Lawler、Chris Abbiss（2025）。精英耐力教练训练调整与监测个案研究；中文描述性题名。Journal of Science and Cycling, 14(2), Article 24；会议摘要；2025-11-19 刊载 | [原始两页 PDF](https://www.jsc-journal.com/index.php/JSC/article/download/1024/875/5698) | 两页全文，Methods 与 Results。用于识别信息获取和情境作用；不是完整研究报告，未取得原始记录 |
| S5 | Rune Kjøsen Talsnes、Einar Flaktveit Moxnes、Trond Nystad、Øyvind Sandbakk（2023）。*The return from underperformance to sustainable world-class level: A case study of a male cross-country skier*. Frontiers in Physiology, 13:1089867. DOI: 10.3389/fphys.2022.1089867 | [出版方全文](https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2022.1089867/full)；[出版方 PDF](https://www.frontiersin.org/articles/10.3389/fphys.2022.1089867/pdf) | 方法、结果、讨论、表 1–5及数据声明；PDF 首页补核书目信息。构建局部流程候选，未重分析原始训练数据 |

S4 的中文题名用于辨认主题；英文完整题名可在链接 PDF 首页核对。本目录没有给它虚构 DOI。S5 出版日期为 2023-01-09，卷号与 DOI 中含 2022 不构成年份填写冲突；书目以出版方日期为准。

使用位置：[第 2 篇](02-evidence-and-case.md)、[public-case.md](../public-case.md)、[source-audit.md](../source-audit.md)。S5 的事实仅用于 E1–E5及其明确说明的推断；未把后续表现作为早期决策输入。

**7.3 数学方法 M1、M2**

| ID | 引用身份 | 原始入口与定位 | 本轮用途与边界 |
|---|---|---|---|
| M1 | W. M. P. van der Aalst（1998）。*The Application of Petri Nets to Workflow Management*. Journal of Circuits, Systems and Computers, 8(1), 21–66. DOI: 10.1142/S0218126698000043 | [作者书目第 53 项](https://www.vdaalst.com/publications/publications.html)；[作者 PDF](https://www.vdaalst.com/publications/p53.pdf)，重点 §5.1–5.3；Definition 7 在该 PDF 第 34 页 | 既有流程定义与三项性质。53 页作者文件的 PDF 页码不能直接当作期刊页码；没有验证教练应用 |
| M2 | Leslie Pack Kaelbling、Michael L. Littman、Anthony R. Cassandra（1998）。*Planning and Acting in Partially Observable Stochastic Domains*. Artificial Intelligence, 101, 99–134. DOI: 10.1016/S0004-3702(98)00023-X | [作者 PDF](https://people.csail.mit.edu/lpk/papers/aij98-pomdp.pdf)，已读引言、§2.1、§3.1–3.4 | 不完全信息决策的候选表达。没有复现求解算法，没有估计教练场景的参数和回报 |

使用位置：[第 3 篇模型](03-model-and-assumptions.md)、[第 4 篇推导](04-proof-and-counterexamples.md)、[第 6 篇后续方法边界](06-review-and-engineering.md)、[protocol.md](../protocol.md)。

**7.4 已登记但未作为核心全文证据的资料**

| ID | 已核对入口 | 本轮取得什么 | 没有取得什么 |
|---|---|---|---|
| U1 | Timmerman（2025），[Edith Cowan University 学位论文目录 2974](https://ro.ecu.edu.au/theses/2974/) | 目录与摘要 | 正文；下载报错，直接访问曾返回 403，备用读取服务无额度 |
| U2 | Milbrath（2019），[University of Northern Colorado 学位论文目录 598](https://digscholarship.unco.edu/dissertations/598/) | 目录与摘要 | 正文；下载未成功 |

访问受限没有被解释成材料不存在，也没有被用来推断全文结论。数学文献的首次访问失败与后续成功路径、其他未纳入检索命中和同源样本边界，保留在[来源审计第 5 节](../source-audit.md)。零结果的笔记本查找不构成“用户没有资料”的证据。

**7.5 全部 17 个既有文件**

以下 O 编号只是本组文章的索引，不改变原有 `study.json` 中的 artifact ID。

| 编号 | 文件 | 在研究中的角色 | 审核入口 |
|---|---|---|---|
| O01 | [intent.md](../intent.md) | 保存用户研究目标与公开案例优先指令 | 第 1 篇；检查范围来源 |
| O02 | [question.md](../question.md) | 研究问题、竞争解释、当前边界 | 第 1、6 篇 |
| O03 | [source-audit.md](../source-audit.md) | 所有来源、读取范围、访问问题和缺口 | 第 2、7 篇 |
| O04 | [findings.md](../findings.md) | 标准对应、方法比较及阶段性判断 | 第 1、6 篇；前四节保留筛选阶段状态 |
| O05 | [public-case.md](../public-case.md) | E1–E5与首例材料边界 | 第 2、3 篇；保留建模前记录 |
| O06 | [protocol.md](../protocol.md) | 分析单位、预定性质、反例、失败方式和停止条件 | 第 4 篇；核对是否先于执行形成 |
| O07 | [study.json](../study.json) | 13 项核心产物的绑定、六阶段审阅与定位信息 | 第 6 篇；机器记录不是自动科学证明 |
| O08 | [analysis/model.md](../analysis/model.md) | 符号、来源映射、A1–A4、图示与事先推导 | 第 3、4 篇 |
| O09 | [analysis/model.json](../analysis/model.json) | 程序实际读取的网结构及反例声明 | 第 3、5 篇 |
| O10 | [analysis/verify_model.py](../analysis/verify_model.py) | 枚举、性质检查与结果写出 | 第 5 篇；236 行版本 |
| O11 | [evidence/model-check.json](../evidence/model-check.json) | 原始运行的全部状态、边、性质和见证 | 第 4、5 篇 |
| O12 | [analysis/results.md](../analysis/results.md) | 实际执行、结果、限制、偏离说明与复现命令 | 第 4、6 篇 |
| O13 | [analysis/validation.md](../analysis/validation.md) | C1–C6 的适用范围审核 | 第 6 篇 |
| O14 | [analysis/decision.md](../analysis/decision.md) | 保留候选、继续研究、暂不工程化的决定 | 第 6 篇 |
| O15 | [evidence/gate-check-before-public-case.json](../evidence/gate-check-before-public-case.json) | 公开案例取得前第二阶段 BLOCKED 的历史回执 | 第 6 篇；不能当作最新状态 |
| O16 | [evidence/gate-check.json](../evidence/gate-check.json) | 本轮六阶段 PASS 的最终历史回执 | 第 6 篇；不代表有效性或发布获批 |
| O17 | [analysis/complete-report.md](../analysis/complete-report.md) | 单文件完整叙述版 | 便于一次复制；详细学习使用本文章组 |

若某项结论只指向 O12 的叙述而没有继续指向 O09–O11，审核尚未到达实际计算证据；若真实语义的声明没有回到 O03、O05和 A1–A4，审核仍未到达来源与假设。

**7.6 本次新增的文章与复现产物**

| 编号 | 文件 | 用途 |
|---|---|---|
| N01 | [articles/README.md](README.md) | 统一入口、阅读路径和证据关系图 |
| N02 | [01-question-and-standards.md](01-question-and-standards.md) | 研究对象与专业职责 |
| N03 | [02-evidence-and-case.md](02-evidence-and-case.md) | 材料、推断与未知的区分 |
| N04 | [03-model-and-assumptions.md](03-model-and-assumptions.md) | 数学对象、完整矩阵与假设 |
| N05 | [04-proof-and-counterexamples.md](04-proof-and-counterexamples.md) | 可达图、证明、不变量和错误见证 |
| N06 | [05-code-and-reproduction.md](05-code-and-reproduction.md) | 函数导读、命令、输出比较与定位办法 |
| N07 | [06-review-and-engineering.md](06-review-and-engineering.md) | 证据范围、研究阶段与工程化条件 |
| N08 | [07-reference-and-artifact-register.md](07-reference-and-artifact-register.md) | 本目录；全部引用与产物对应 |
| N09 | [evidence/learning-reproduction.json](../evidence/learning-reproduction.json) | 本次按文章步骤执行产生的完整计算输出 |
| N10 | [evidence/learning-guide-check.json](../evidence/learning-guide-check.json) | 文档链接、来源和产物覆盖、复现比较及归档预期清单 |
| N11 | [研究根目录 README.md](../README.md) | 复制或解压后可直接找到的阅读入口 |

整理后的研究目录共 28 个文件，单篇少于 800 行，各目录不超过 8 个文件。所有计算输入和原始输出均在目录内。新的复现输出不能替代原始输出，两者角色分别列明。

另提供整个研究目录的 ZIP 归档，输出位置为研究项目的 `exports/elite-endurance-coach-study-001.zip`，其中包含上述 28 个文件及其目录关系。归档本身不递归包含自己，也不打包其他研究或全局配置。

**7.7 可选外部工具和未包含的东西**

历史六阶段检查使用的工具位于：

```text
<项目目录>/.agents/skills/research-workflow/scripts/workflow.py
```

该工具未进入便携研究包；模型复算不依赖它。历史回执所用命令可在 O15、O16 回查。外部网页与论文原始文件也没有全部下载进包中，文章保留原链接与读取边界，不把链接等同于原始数据副本。

本次没有新增训练数据、模拟参数、POMDP 求解结果、CI 或生产证据。它们没有被遗漏为“隐藏产物”，而是没有执行或取得。未使用另一位研究者进行独立复核。

**7.8 从主张回到证据的快捷对应**

| 你想审核的主张 | 先读 | 再核对 |
|---|---|---|
| 为什么选这些职责 | 第 1 篇 | S1/S2 原条目、O03/O04 |
| 为什么存在并行和反馈 | 第 2、3 篇 | O05 的 E2/E4、A1/A2 的假设边界 |
| 为什么是 8 个状态、9 条边 | 第 4 篇 | O09、O10、O11 的 `states` 与 `edges` |
| 为什么反例 A、B 应失败 | 第 4 篇 | O06 预期、O10 `variants`、O11 见证 |
| 为什么程序退出码是 0 | 第 5 篇 | O10 `main` 与三个 `matches_expectation` |
| 为什么不能直接工程化 | 第 6 篇 | O13 的 C2–C6、O14 当前决定 |
| 本次是否遗漏引用或文件 | 本篇 | N10 的覆盖及链接核对结果 |
| 本次是否实际复算 | 第 5 篇 | N09 完整输出、N10 比较记录 |

返回：[阅读入口与三条学习路径](README.md)。
