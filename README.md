# sumulige.com

个人网站与教练工作流研究系列。生产发布由 Cloudflare Pages 的 `sumulige-github-io` 项目完成，连接本仓库 `master` 分支。

## 内容与公开范围

1. 新增107篇训练数据与决策研究文章位于 `source/p1/`，保留正文及外部来源；内部附件仅显示未公开说明。原七篇文章及阅读指南位于 `source/articles/`。只修改网站副本，原研究目录独立保留。
2. 公开附件仅四项：模型输入、验证程序、原始计算结果和复现结果。位于 `static/downloads/study-001/`，ZIP 使用相同目录关系。
3. 聊天摘录、来源审计、阶段记录等附件未公开，文内入口明确标记并指向公开范围说明。
4. 公开副本移除了本机绝对路径。结果 JSON 仅将 `model_file` 改为相对路径；计算字段保持不变。
5. 原稿“完整研究包”的叙述描述原研究目录，本站提供的是四附件复现包。

## 更新文章

```sh
npm ci --ignore-scripts
python3 -m venv .build-venv
.build-venv/bin/python -m pip install -r tools/requirements.txt
.build-venv/bin/python tools/build.py
python3 -m http.server 8771 --bind 127.0.0.1 --directory static
```

构建脚本生成 `static/content.js`，复制项目中锁定的 KaTeX 与 Mermaid 浏览器资源，并重新生成 ZIP。站点不使用第三方 CDN。浏览器检查结束后停止本地服务器。

## 发布

Cloudflare 现有构建命令为 `hugo`，输出目录为 `public`。根配置禁用 Hugo 自动生成页面，使用 `static/` 中已构建的站点。旧文章、旧模板及已提交的旧 `public/` 输出移除；历史可在 Git 中追溯。

原 GitHub Pages 工作流改为仅手动触发，生产发布以 Cloudflare 为准。提交和推送前检查确切路径与差异；推送必须得到该版本与目标分支的明确批准。

## 复现模型

下载 ZIP 并进入解压后的 `study-001` 目录：

```sh
python3 analysis/verify_model.py --model analysis/model.json --output /tmp/model-reproduction.json
```

比较 `cases` 与已发布结果的计算字段。预期为候选 PASS、两个反例 FAIL，且三者 `matches_expectation` 都为 true。该形式检验不代表实际教练决策有效或训练效果已验证。

## 验证边界

网页、链接、渲染与公开附件范围的检查不替代论文主张的独立学术审核。发布前核对本地证据，发布后分别回读 GitHub 提交、Pages 部署和域名 HTTPS。

## P0文章与2026-10-26增量

004—056批162篇及阅读索引已于2026-10-24发布（master/c87c312）；此前“待发布”文字为历史遗漏。本次新增057三篇、058三篇与065公开证据汇总，共7篇，合计169篇P0文章、56组阅读入口，全站285条阅读入口。

058公开稿增加后续口径说明；065明确原论文计算复现未完成。新增附件仅057四张、058三张汇总CSV，不发布个体行、作者稿全文、询证草稿、内部来源审计或阶段记录。原研究目录不变。

使用现有环境运行 `.build-venv/bin/python tools/build.py`。`tools/p0.py`的首次导入命令仅适用于历史004—056批，不可用于覆盖当前增量清单。增量以 `source/p0/manifest.json` 显式列举。

本次增量为本地候选；最终推送需该版本master批准及有效GitHub认证。部署与域名回读另行记录，不以本地构建宣称上线。
