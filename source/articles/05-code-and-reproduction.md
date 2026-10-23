**5. 读懂代码并亲自复现**

[阅读入口](README.md) · [上一篇](04-proof-and-counterexamples.md) · [引用与产物总目录](07-reference-and-artifact-register.md)

本篇面向希望亲自运行、审核计算的人。模型输入是[model.json](../analysis/model.json)，程序是[verify_model.py](../analysis/verify_model.py)，原始完整输出是[model-check.json](../evidence/model-check.json)。本次整理增加[复现输出](../evidence/learning-reproduction.json)和[交付核对记录](../evidence/learning-guide-check.json)，与原始研究分开保存。

**5.1 运行条件与目录**

当前使用的 `python3` 为 3.14.7。程序仅导入 Python 标准库，没有需要安装的第三方依赖。本例在本地运行；没有连接运动员数据、浏览器、远端系统或常驻服务器。

复制归档后，应保留整个研究文件夹：

```text
001-elite-endurance-coach/
    analysis/model.json
    analysis/verify_model.py
    evidence/model-check.json
    evidence/learning-reproduction.json
    evidence/learning-guide-check.json
    articles/...
    其他研究记录
```

模型计算不依赖原机器的绝对路径；命令中的目录应换成你的解压位置。下面先给出本机命令，再给出位于研究目录时的相对路径命令。没有为其他 Python 版本或操作系统逐一运行兼容性测试。

**5.2 输入文件每一部分是什么意思**

| JSON 字段 | 当前作用 | 审核注意点 |
|---|---|---|
| `name`、`kind` | 说明研究对象 | 名称不会使程序自动验证语义 |
| `places` | 决定 token 向量的排列 | 状态里的每个分量按此列表解释 |
| `start`、`finish` | 构造单 token 初态和规范终态 | 本脚本不从输入读取任意初始 token 分布 |
| `invariant_weights` | 提供要核对的权重向量 | 程序检验保持性，不自动寻找权重 |
| `transitions` | 每项行动的 ID、输入与输出位置 | 所有输入均需有 token；发生时各消耗、产生一个 |
| `predeclared_counterexamples` | 指定两个预先定义的修改和预期结果 | 修改操作在程序中实现，不接受任意新操作名称 |

输入中的 `expected` 是预期，不是事实。事实来自每个对象的实际分析结果。两者是否相符另由 `matches_expectation` 记录。

**5.3 按函数阅读程序**

以下行号对应现有 236 行版本；如果以后代码变化，应以函数名重新定位。

| 函数或入口 | 行号 | 做什么 | 不能证明什么 |
|---|---:|---|---|
| `closure` | 12–20 | 沿给定邻接关系找所有可到达节点 | 邻接关系是否符合现实 |
| `validate` | 23–42 | 检查名称、输入输出引用及本例支持的格式 | 完整通用格式规范、所有可能输入类型 |
| `structure` | 45–67 | 检查入口、出口和贯通路径 | token 的动态完成性质 |
| `cycle_witness` | 70–101 | 在可达图中找一个避开终态的有向循环 | 每次实际运行都会循环 |
| `analyze` | 104–188 | 枚举标识、核对性质、生成见证 | 教练语义或行动效果 |
| `variants` | 191–202 | 产生原候选及两份深复制后的反例 | 任意模型修改语言 |
| `main` | 205–232 | 解析参数、逐个分析、写出 JSON、决定退出码 | 输出里的每个模型都通过 |
| 脚本入口 | 235–236 | 运行 `main` 并返回退出码 | 独立外部审查 |

完整代码保持在一个文件中，可从[这里打开](../analysis/verify_model.py)。文章解释调用关系，不复制第二份实现，以免两份代码逐渐不同。

**5.4 核心枚举怎样工作**

`analyze` 先把 p0 至 p7 映射成向量下标，再构造初态和规范终态。`pending` 是待处理队列，`parents` 记录已遇到的状态及第一次到达它的前驱。

每取出一个状态，程序都尝试全部转移。输入位置全部有 token 时，先消耗输入，再产生输出。如果新标识未见过，就放入队列；无论是否见过，都记录该条转移边。队列清空意味着没有遗漏当前集合中任何已启用转移的后继。

这也解释了为什么反馈回路不会让枚举本身无限运行：回路再次回到同一 token 向量时，不会重复排入队列。这里有限的是可达状态集合，可能无限的是执行序列。

如果遇到尚未见过的状态而数量已到 `--max-states`，程序会停止继续扩展，并把完整性标为假。此时三个主要性质设为 `null`，整体为 `INCOMPLETE`，不能据已见部分报告通过。默认 10,000 是计算上限，不是科学质量门槛。

**5.5 三项检查怎样从完整图得到**

1. **`option_to_complete`：** 反转所有边，从规范终态找其全部前驱；只有全部可达状态都在这个集合中，才有从每个状态完成的路径。
2. **`proper_completion`：** 查找已经在终点有 token、却不等于规范终态的标识。找到一个就给出相应路径。
3. **`no_dead_transitions`：** 用全部声明转移减去可达边中出现过的转移。差集为空，说明不存在从初态永远无法发生的转移。

前驱记录只需保留第一次到达路径，就能为某个问题状态提供可复查的见证；它不表示现实中只有这一种到达方式。

`cycle_witness` 另用路径搜索找回路；`observed_max_tokens_per_place` 报告已枚举状态中的最大值。若枚举不完整，后者只是已观察到的范围，不能当作整个模型的上界。

**5.6 三种“成功”不能混为一谈**

| 输出 | 实际含义 |
|---|---|
| 某个对象的 `status: PASS` | 完整枚举、WF-net 结构成立，且三项形式性质全部为真 |
| 某个对象的 `matches_expectation: true` | 该对象实际结论与预设的 PASS 或 FAIL 相符 |
| 程序退出码为 0 | 三个对象全部符合各自预期 |

因此，正常结果包含一个 PASS 和两个 FAIL。两个错误模型都失败，正是这次程序执行成功的一部分。权重不变量和循环见证是额外报告项，没有被直接加入 `PASS` 条件；不要自行替换程序的判定含义。

若某个对象不符合预期，`main` 返回 1。参数解析、文件读取、输入格式或输出写入错误也可能导致非零退出；要看具体错误，不能一律解释为模型反例。

**5.7 亲自执行一次**

先进入现有研究目录；如果已复制到其他位置，只替换这一行的路径：

```bash
cd <项目目录>/research-workflow/studies/001-elite-endurance-coach
```

然后运行：

```bash
python3 analysis/verify_model.py \
  --model analysis/model.json \
  --output /tmp/elite-endurance-coach-001-recheck.json
```

预期终端摘要为：

| case | status | state_count | edge_count | matches_expectation |
|---|---|---:|---:|---|
| candidate | PASS | 8 | 9 | true |
| counterexample_A | FAIL | 8 | 9 | true |
| counterexample_B | FAIL | 7 | 8 | true |

完整状态、边和见证写在输出 JSON 中。不要仅核对这个摘要：同样的计数可能对应不同的 token 分布，第 4 篇的反例 A 已展示这一点。

**5.8 与原始记录作语义比较**

在同一研究目录执行下面的只读比较。它核对整个 `cases`，并保留格式、方法和范围一致性；时间与模型文件绝对路径允许因复现环境不同而变化。

```bash
python3 - <<'PY'
import json
from pathlib import Path

original = json.loads(Path('evidence/model-check.json').read_text())
replay = json.loads(Path('/tmp/elite-endurance-coach-001-recheck.json').read_text())
fields = ('format', 'method', 'scope', 'cases')
checks = {key: original[key] == replay[key] for key in fields}
print(json.dumps(checks, ensure_ascii=False, indent=2))
raise SystemExit(0 if all(checks.values()) else 1)
PY
```

所有值应为 `true`。这里比较的是解析后的模型结果，不是文件字节、生成时间或文件摘要。本次整理实际使用相同字段完成比较；结果保存于[交付核对记录](../evidence/learning-guide-check.json)。

**5.9 若不一致，先查什么**

| 现象 | 优先核对 | 不应立即得出的结论 |
|---|---|---|
| 只出现 `created_utc` 或 `model_file` 差异 | 是否仅为时间和存放位置变化 | 数学结果已经改变 |
| `INCOMPLETE` | 状态上限、输入结构是否改变 | 三项性质已通过或已被完全否定 |
| 状态编号变化 | 模型中位置、转移顺序是否改变；核对 token 和边 | 编号不同必然代表语义不同 |
| `Unrecognized predeclared counterexample` | 是否写入了脚本尚未实现的修改名称 | 脚本支持任意扩展 |
| 文件找不到 | 当前目录、模型和输出路径 | 研究结论失败 |
| 完整图与原始记录不同 | 保存差异，核对输入、代码和实际命令 | 先改预期让它通过 |

本次交付没有为了展示所有错误而逐项再运行这些情况。表格是根据当前代码解释的定位办法；实际复现只运行原候选和两个既定反例。

**5.10 可选的研究记录检查与可移植性**

[gate-check.json](../evidence/gate-check.json)记录了研究材料和六阶段审阅的检查。它使用项目外部于本研究文件夹的 Skill 工具：

```text
<项目目录>/.agents/skills/research-workflow/scripts/workflow.py
```

这项工具不是模型计算依赖，也未打包到研究归档。它还核对 `study.json` 中保存的文件观察信息；文件复制或重新审阅后，大小、修改时间及记录可能需要按其流程重新确认。不能期待在另一台机器解压后，历史门禁回执自动成为一次新的通过。

模型计算可以只用本研究目录复现。历史流程回执用于审核当时材料链，科学结论仍以模型及来源的对应证据为准。第 6 篇进一步解释为什么六阶段 PASS 不代表全部研究目标已经完成。

下一篇：[审核结论与工程化边界](06-review-and-engineering.md)。
