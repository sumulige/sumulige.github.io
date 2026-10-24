"""Build explicit P0 reading copies without exporting internal research records."""
from pathlib import Path
from html import escape
from urllib.parse import unquote, quote
import json
import math
import re
import shutil
from markdown_it import MarkdownIt

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT/'source/p0'
OUT = ROOT/'static'
MATH = re.compile(r'\\\[(.*?)\\\]|\\\((.*?)\\\)|\$\$(.*?)\$\$|(?<![\\$])\$(?!\$)([^$\n]+?)(?<!\\)\$(?!\$)', re.S)


def hold_math(text):
    formulas = []

    def replace(match):
        groups = match.groups()
        display = groups[0] is not None or groups[2] is not None
        tex = next(x for x in groups if x is not None)
        # Keep Chinese labels as text, including labels in subscripts.
        tex = re.sub(r'\\text\{[^{}]*\}|[\u4e00-\u9fff]+|—',
                     lambda item: item[0] if item[0].startswith('\\text{') else '\\text{'+item[0]+'}', tex)
        key = f'PUBLISHMATH{len(formulas)}END'
        tag = 'div' if display else 'span'
        formulas.append((key, f'<{tag} class="math-source" data-display="{str(display).lower()}">{escape(tex.strip())}</{tag}>'))
        return '\n\n'+key+'\n\n' if display else key

    return MATH.sub(replace, text), formulas


def sanitize(text):
    return re.sub(r'/Users/[^\s)<>"\x27]+', '[本机路径未公开]', text)


def targets(text):
    prepared, _ = hold_math(text)
    md = MarkdownIt('commonmark', {'html': False}).enable('table')
    for token in md.parse(prepared):
        for child in token.children or []:
            if child.type in ('link_open', 'image'):
                yield child.attrGet('href' if child.type == 'link_open' else 'src')


def import_articles(research):
    paths = sorted(p for d in research.glob('*-p0-*') if int(d.name[:3]) <= 56
                   for p in (d/'articles').glob('*.md'))
    if len(paths) != 162:
        raise ValueError(f'Expected 162 approved articles, found {len(paths)}')
    manifest = {'articles': [], 'public_files': {}, 'scope': 'P0 batches 004–056; 057 excluded'}
    SOURCE.mkdir(parents=True, exist_ok=True)
    selected = set(paths)
    for path in paths:
        relative = path.relative_to(research)
        study = relative.parts[0]
        text = path.read_text()
        title = text.splitlines()[0].lstrip('#').strip().strip('*')
        public = re.sub(r'(?<=\]\()/Users/[^)]+(?=\))', '#unpublished', text)
        public = sanitize(public)
        dest = SOURCE/relative
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(public)
        manifest['articles'].append({'id': f'p0-{study[:3]}-{path.stem}', 'path': relative.as_posix(),
                                     'title': title, 'study': study, 'math_count': len(hold_math(public)[1])})
        for href in targets(text):
            if not href or href.startswith(('http://', 'https://', '#', '/')):
                continue
            target = (path.parent/unquote(href.split('#')[0])).resolve()
            if not target.is_relative_to(research) or not target.is_file() or target in selected:
                continue
            is_data = 'execution' in target.parts and target.suffix in ('.csv', '.json', '.npz')
            is_figure = target.suffix in ('.png', '.svg', '.jpg', '.jpeg', '.webp')
            if not (is_data or is_figure) or 'verification' in target.name:
                continue
            name = target.relative_to(research).as_posix()
            url = 'downloads/p0/'+name
            destination = OUT/url
            destination.parent.mkdir(parents=True, exist_ok=True)
            if target.suffix in ('.json', '.csv', '.svg'):
                destination.write_bytes(sanitize(target.read_bytes().decode('utf-8')).encode('utf-8'))
            else:
                shutil.copy2(target, destination)
            manifest['public_files'][name] = url
    (SOURCE/'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n')
    print(f'Imported {len(paths)} articles and {len(manifest["public_files"])} referenced numerical/figure files.')


def render_article(entry, manifest):
    path = SOURCE/entry['path']
    text = '\n'.join(path.read_text().splitlines()[1:])
    text, formulas = hold_math(text)
    md = MarkdownIt('commonmark', {'html': False}).enable('table')
    tokens = md.parse(text)
    ids = {a['path']: a['id'] for a in manifest['articles']}
    studies = {a['study'] for a in manifest['articles']}
    toc = []
    for i, token in enumerate(tokens):
        if token.type == 'heading_open':
            anchor = 'section-'+str(len(toc)+1)
            token.attrSet('id', anchor)
            token.attrSet('tabindex', '-1')
            toc.append({'id': anchor, 'text': tokens[i+1].content, 'level': int(token.tag[1:])})
        if token.type == 'th_open':
            token.attrSet('scope', 'col')
        for child in token.children or []:
            if child.type not in ('link_open', 'image'):
                continue
            attr = 'href' if child.type == 'link_open' else 'src'
            href = child.attrGet(attr)
            if href.startswith(('http://', 'https://')):
                if child.type == 'link_open':
                    child.attrSet('target', '_blank')
                    child.attrSet('rel', 'noopener noreferrer')
                continue
            target = (path.parent/unquote(href.split('#')[0])).resolve()
            key = target.relative_to(SOURCE).as_posix() if target.is_relative_to(SOURCE) else ''
            if key in ids:
                child.attrSet(attr, '#/article/'+ids[key])
            elif key in manifest['public_files']:
                child.attrSet(attr, quote(manifest['public_files'][key], safe='/'))
                if child.type == 'link_open':
                    child.attrSet('download', '')
            elif target.name == 'README.md' and key.split('/')[0] in studies:
                child.attrSet(attr, '#/article/p0-guide?section=study-'+key[:3])
            else:
                if child.type == 'image':
                    raise ValueError(f'Unresolved image {entry["id"]}: {href}')
                child.attrSet(attr, '#/article/p0-guide?section=publication')
                child.attrSet('class', 'unpublished-reference')
                child.attrSet('title', '该内部研究材料未公开，查看公开范围')
    html = md.renderer.render(tokens, md.options, {})
    for key, value in formulas:
        html = html.replace('<p>'+key+'</p>', value).replace(key, value)
    html = html.replace('<table>', '<div class="table-scroll" tabindex="0" role="region" aria-label="文章数据表"><table>').replace('</table>', '</table></div>')
    html = re.sub(r'<p>(<img [^>]+>)</p>', r'<figure>\1</figure>', html)
    return {'id': entry['id'], 'title': entry['title'], 'description': '', 'topic': '训练研究与决策',
            'minutes': max(1, math.ceil(len(text)/500)), 'body': html, 'toc': toc}


def build_articles():
    manifest = json.loads((SOURCE/'manifest.json').read_text())
    articles = [render_article(a, manifest) for a in manifest['articles']]
    html = '<section class="publication-note"><h2 id="publication" tabindex="-1">公开范围与阅读边界</h2><p>这里收录53组、162篇已完成的研究文章。正文解释数学构造、文献依据与适用限制；计算通过不等于真实训练效果已经验证。未完成的第057组不在本次发布范围。</p><p>文内引用的计算结果、数据表和配图可下载。内部聊天、来源审计、阶段记录、过程验收与历史原答未公开，对应链接返回本说明。公开副本移除了本机路径，数值与研究结论保留。</p><p>以下按研究顺序组织。同组文章可连续阅读，跨组引用用于补充已有论证，并不表示162个独立问题已全部解决。</p></section>'
    toc = [{'id': 'publication', 'text': '公开范围与阅读边界', 'level': 2}]
    for study in dict.fromkeys(a['study'] for a in manifest['articles']):
        entries = [a for a in manifest['articles'] if a['study'] == study]
        heading = f'{study[:3]} · {entries[0]["title"]}'
        anchor = 'study-'+study[:3]
        html += f'<h2 id="{anchor}" tabindex="-1">{escape(heading)}</h2><ol>'
        html += ''.join(f'<li><a href="#/article/{a["id"]}">{escape(a["title"])}</a></li>' for a in entries)
        html += '</ol>'
        toc.append({'id': anchor, 'text': heading, 'level': 2})
    return articles+[{'id': 'p0-guide', 'title': '训练研究与决策：阅读索引', 'description': '',
                     'topic': '训练研究与决策', 'minutes': 5, 'body': html, 'toc': toc}]


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--research', type=Path, required=True)
    import_articles(parser.parse_args().research.resolve())
