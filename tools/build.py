"""Build the approved research series; only explicit attachments are published."""
from pathlib import Path
from html import escape
import json
import math
import re
import shutil
import zipfile
from markdown_it import MarkdownIt
from p0 import build_articles

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'source' / 'articles'
OUT = ROOT / 'static'
PUBLIC_FILES = {
    '../analysis/model.json': 'analysis/model.json',
    '../analysis/verify_model.py': 'analysis/verify_model.py',
    '../evidence/model-check.json': 'evidence/model-check.json',
    '../evidence/learning-reproduction.json': 'evidence/learning-reproduction.json',
}
FILES = sorted(SOURCE.glob('0*.md'))
IDS = {p.name: p.stem for p in FILES} | {'README.md': 'series-guide'}


def render(path):
    text = path.read_text()
    lines = text.splitlines()
    title = lines.pop(0).strip('*')
    text = '\n'.join(lines)
    # Source uses whole-line bold section labels; promote only those labels.
    text = re.sub(r'^\*\*(\d+(?:\.\d+)*\.? .+?)\*\*$', r'## \1', text, flags=re.M)
    maths = []
    def hold(match):
        display = match.group(1) is not None
        tex = match.group(1) if display else match.group(2)
        key = f'MATHPLACEHOLDER{len(maths)}END'
        tag = 'div' if display else 'span'
        maths.append((key, f'<{tag} class="math-source" data-display="{str(display).lower()}">{escape(tex.strip())}</{tag}>'))
        return '\n\n' + key + '\n\n' if display else key
    text = re.sub(r'\\\[(.*?)\\\]|\\\((.*?)\\\)', hold, text, flags=re.S)
    md = MarkdownIt('commonmark', {'html': False}).enable('table')
    tokens = md.parse(text)
    toc = []
    for i, token in enumerate(tokens):
        if token.type == 'heading_open':
            label = tokens[i+1].content
            number = re.match(r'\d+(?:\.\d+)*', label)
            anchor = 'section-' + (number.group() if number else str(len(toc)+1))
            token.attrSet('id', anchor)
            token.attrSet('tabindex', '-1')
            toc.append({'id': anchor, 'text': label, 'level': 2})
        if token.type == 'th_open':
            token.attrSet('scope', 'col')
        for child in token.children or []:
            if child.type == 'link_open':
                href = child.attrGet('href')
                if href.startswith(('https://', 'http://')):
                    child.attrSet('target', '_blank')
                    child.attrSet('rel', 'noopener noreferrer')
                elif href in IDS:
                    child.attrSet('href', '#/article/' + IDS[href])
                elif href in PUBLIC_FILES:
                    child.attrSet('href', 'downloads/study-001/' + PUBLIC_FILES[href])
                    child.attrSet('download', '')
                else:
                    child.attrSet('href', '#/article/series-guide?section=publication')
                    child.attrSet('class', 'unpublished-reference')
                    child.attrSet('title', '该研究附件未公开，查看发布范围')
    html = md.renderer.render(tokens, md.options, {})
    for key, value in maths:
        html = html.replace('<p>'+key+'</p>', value).replace(key, value)
    html = html.replace('<table>', '<div class="table-scroll" tabindex="0" role="region" aria-label="文章数据表"><table>').replace('</table>', '</table></div>')
    html = re.sub(r'<pre><code class="language-mermaid">(.*?)</code></pre>', r'<div class="diagram-scroll" tabindex="0" role="region" aria-label="流程图，可横向滚动"><pre class="mermaid">\1</pre></div>', html, flags=re.S)
    if path.name == 'README.md':
        notice = '<section class="publication-note"><h2 id="publication" tabindex="-1">本次公开范围</h2><p>本站发布七篇系列文章及阅读指南。模型代码、模型输入、原始计算结果与复现结果可下载；聊天摘录、来源审计、阶段记录及其他内部研究附件未公开。文中指向这些附件的链接会返回本说明。</p><p>原稿中的“完整研究包”和内部记录数量描述原研究目录；本站下载包仅包含下列四个公开附件。公开副本将本机绝对路径改为相对路径，计算结果保持不变。</p><p><a href="downloads/study-001.zip" download>下载复现包（ZIP）</a></p><ul>'
        notice += ''.join(f'<li><a href="downloads/study-001/{name}" download>{name}</a></li>' for name in PUBLIC_FILES.values())
        notice += '</ul></section>'
        html = notice + html
        toc.insert(0, {'id': 'publication', 'text': '本次公开范围', 'level': 2})
    return {'id': IDS[path.name], 'title': title, 'description': '', 'topic': '教练工作流研究',
            'minutes': max(1, math.ceil(len(text)/500)), 'body': html, 'toc': toc}


def main():
    articles = [render(p) for p in FILES] + [render(SOURCE/'README.md')]
    if (ROOT/'source/p0/manifest.json').exists():
        articles += build_articles()
    (OUT/'content.js').write_text('window.SITE_CONTENT = ' + json.dumps({'articles': articles, 'projects': [], 'books': []}, ensure_ascii=False) + ';\n')
    assets = OUT/'assets'
    assets.mkdir(exist_ok=True)
    katex = ROOT/'node_modules/katex'
    for name in ['katex.min.js', 'katex.min.css']:
        shutil.copy2(katex/'dist'/name, assets/name)
    shutil.copytree(katex/'dist/fonts', assets/'fonts', dirs_exist_ok=True)
    shutil.copy2(katex/'LICENSE', assets/'KaTeX-LICENSE.txt')
    shutil.copy2(ROOT/'node_modules/mermaid/dist/mermaid.min.js', assets/'mermaid.min.js')
    shutil.copy2(ROOT/'node_modules/mermaid/LICENSE', assets/'Mermaid-LICENSE.txt')
    with zipfile.ZipFile(OUT/'downloads/study-001.zip', 'w', zipfile.ZIP_DEFLATED) as bundle:
        for name in PUBLIC_FILES.values():
            bundle.write(OUT/'downloads/study-001'/name, 'study-001/'+name)
    print(f'Built {len(articles)} reading entries; existing series and explicit public attachments preserved.')


if __name__ == '__main__':
    main()
