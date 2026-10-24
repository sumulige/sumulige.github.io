# 五个平台里都有这次骑行，为什么仍可能缺数据？

一次室内训练结束，码表保存了一份活动，Zwift也保存了一份；同步之后，Strava和TrainingPeaks里又出现记录。看起来数据已经齐了，实际做分析时却发现：某处有左右平衡，另一处只有总功率；平均功率不同；有的文件记录了暂停，有的界面只给运动时间。此时，先把所有数据排成逐秒表，并不能回答哪份信息更完整。

问题要从希望保留哪一种细节开始。你需要的是活动是否完成、每秒功率、暂停与圈段，还是某个设备的扩展指标？这些信息可能存在于不同层面。拿到文件、读懂字段、正确解释时间、复算某项指标，各自需要证据。Q075原答把它们压缩成接入原始1Hz流并精准去重，承诺超过了已有依据。

## 1. 文件、数据流和平台汇总提供不同的信息

一个平台页面上的本次骑行平均功率，是一个结果。功率时间序列让我们看到它随时间怎样变化。活动文件还可能包含设备、计时器事件、圈段和扩展字段。三者相互关联，却不能从最后一个数字反向推出所有前面的内容。

例如，两秒功率分别为0W和600W，与两秒始终300W，平均值都是300W，总功也都是600J。但是前者峰值为600W，后者只有300W。保存平均值和总功仍然无法知道发生过哪种过程。这是信息汇总本身的限制，不需要假设某个平台计算出错。[完整构造与结果](#/article/series-guide?section=publication)

原始也必须说明相对哪一层。码表导出的心率通常是bpm数值；即便它是文件中最早可取得的心率，也不能仅凭这个身份把它当作光电传感器波形。设备内部处理掉的信息，不会因将文件存入另一个数据库而自动回来。有关心率缺失与伪影，可以接着读[Q072研究](#/article/series-guide?section=publication)。

## 2. 五个平台的出口，不能写成同一条API承诺

以下是2026年10月24日核对的公开说明，表示文档中描述的路径。它们没有验证当前用户或某个产品已经获得资格，也没有验证具体文件字段完整。

| 平台 | 本次确认的路径 | 不能顺势推出的结论 |
|---|---|---|
| Garmin | 当前开发者总览区分Personal与商业层级，列出活动JSON/FIT及不同传输和历史数据条件。 | Health数据与Activity文件不是一个接口概念；文档列有FIT不等于本账户已可取得全部历史。 |
| Wahoo | Cloud API的Workout Summary说明提供活动FIT文件链接，需相应授权和应用条件。 | 有文件链接不证明每个设备字段都保存，也不证明文件与录制端逐字节一致。 |
| Zwift | 官方帮助说明本地活动FIT与网站下载路径。 | 文件出口不能作为已实现第三方公共API的证据。 |
| Strava | API提供活动Streams；网站另有Original等导出方式。 | Streams字段集合不是原文件全部内容，原格式导出也不是Streams端点。 |
| TrainingPeaks | 公开API需商业开发者审批；文件导出、汇总CSV、指标CSV分别说明。 | 导出可用不能证明个人API可用，也不能代替未公开字段契约。 |

这张表分别依据[Garmin现行总览](https://developer.garmin.com/gc-developer-program/overview/)、[Wahoo Cloud API](https://cloud-api.wahooligan.com/)、[Zwift文件说明](https://support.zwift.com/es/locating-your-activity-log-and-workout-files-BykKO63fr)、[Strava API参考](https://developers.strava.com/docs/reference/)与[导出说明](https://support.strava.com/en-us/articles/15401919-how-do-i-export-my-strava-data)，以及[TrainingPeaks API](https://help.trainingpeaks.com/hc/en-us/articles/234441128-TrainingPeaks-API)与[导出说明](https://help.trainingpeaks.com/hc/en-us/articles/204985370-Data-Export)。完整读取范围和网页获取限制放在[来源审计](#/article/series-guide?section=publication)。

其中一个容易过时的认识是Garmin只对商业开发者开放。本次可访问的总览已经列出Personal，供访问自身数据；商业Starter与Enterprise的条件也有区别。旧网址与搜索缓存不能代替当前说明。但发现Personal入口，同样不能替用户完成授权，更不能推导某项健康指标必然可读。

另一个容易误写的结论是Strava会把精细字段全部删除。本次确认的是公开StreamSet没有列HRV与左右平衡；网站Original导出是另一条路径。一个端点没有字段，不能直接描述成所有上传、存储与导出环节都会删除该字段。具体损失发生在哪里，仍需要同一来源文件沿实际路径的对照。

## 3. FIT能容纳细节，不代表每份FIT都是逐秒完整记录

Garmin的FIT说明区分Smart Recording与Every Second：记录可以不等间隔。计时器的开始、停止也有自己的事件；Record记录和圈、活动汇总承担不同功能。开发者字段还涉及来源标识、字段描述和实际值。把文件转成几列功率、心率、踏频，可能保留了分析所需的信息，也可能把另一次分析需要的内容投影掉。[FIT解码说明](https://developer.garmin.com/fit/cookbook/decoding-activity-files/)与[开发者数据说明](https://developer.garmin.com/fit/cookbook/developer-data/)

本批用两个极小输入说明这一点：两者功率与心率记录完全相同，只有一个人为定义的扩展值分别为7和9。如果导出时只保留常见记录，两份输出就完全一样。从这份输出出发，无法确定原来是7还是9。若完整保留两个输入，则仍能区分。这两个情景同时存在：转换并非必然丢失，但常见字段没少不足以证明没有损失。[表示转换分析](#/article/series-guide?section=publication)

因此，保留输入，以后重算和特征可逆需要分开说。前者是保留了计算依据，可以重新运行某个已知方法；后者要求只凭特征结果能够唯一恢复输入。均值通常做不到后者。即使输入保留，若第三方算法、参数或基准没有提供，也不能保证重算出它的专有评分。

## 4. 整合的结论应具体到用途

如果只想统计完成了几次训练，活动身份和同步来源可能是主要问题；如果想比较冲刺峰值，采样与平滑方式就很关键；如果分析暂停前后的恢复过程，计时事件和时间轴又不能省略。没有一张固定的通用表能仅凭字段名称证明覆盖全部用途。

平台已有的汇总指标也不必一律删除。保留它的来源与定义，可以帮助发现与自己复算的差异；是否拿它指导训练，则需要另行判断。它可以是一项需要解释的观测，不能未经核对就被当作不同平台间可互换的真值。

本次得到的是对整合条件的澄清：先确认真实可取得的材料，再识别字段与时间的含义，并让声明具体到已核验的用途。五平台实际权限、文件往返、字段保真和真实重复识别尚未测试，原问题仍为PARTIAL。下一篇继续解释[暂停、去重与指标归一化](#/article/p1-014-02-time-identity-and-normalization)，这些步骤为什么会在文件已经到手后继续改变结论。

[研究入口与复现材料](#/article/series-guide?section=publication)
