# sumulige.com

个人网站与教练工作流研究系列。生产发布由 Cloudflare Pages 的 `sumulige-github-io` 项目完成，连接本仓库 `master` 分支。

## 内容与公开范围

1. 七篇文章及阅读指南位于 `source/articles/`。只修改网站副本，原研究目录独立保留。
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

## P0文章增量（待发布）

新增53组、162篇文章及阅读索引，来自已完成的004—056批；057未完成材料不发布。网站副本位于 `source/p0/`，原始研究保留不变。文内引用的数值结果与配图使用 `source/p0/manifest.json` 的显式清单；内部阶段记录、审计、历史原答和过程验收不导出。

在已有构建环境运行 `python tools/build.py`。首次导入可运行 `python tools/p0.py --research <研究studies目录>`。新增解析支持原稿的两类数学分隔符，生成稳定文章地址、跨文链接、批次索引和本地附件地址。现有八个阅读条目保持内容不变。

本次发布仍需具体版本的master推送确认与有效GitHub认证；本地验证不能代替Cloudflare部署与正式域名回读。
