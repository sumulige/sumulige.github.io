(() => {
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const shapes = {
    home: '<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
    writing: '<path d="M6 3h12v18H6zM9 8h6M9 12h6M9 16h4"/>',
    project: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 17h7m-3.5-3.5v7"/>',
    book: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15"/>',
    person: '<circle cx="12" cy="7" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    up: '<path d="M6 18 18 6H6m12 0v12"/>',
    copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[name] || shapes.arrow}</svg>`;
  const articles = () => window.SITE_CONTENT.articles;
  const searchCache = new WeakMap();
  const projectsData = () => window.SITE_CONTENT.projects || [];
  const booksData = () => window.SITE_CONTENT.books || [];
  const pathTo = (a, back = '') => `#/article/${a.id}${back ? '?back=' + encodeURIComponent(back) : ''}`;
  const topicLink = topic => '#/articles?topic=' + encodeURIComponent(topic);
  const meta = a => `<span>${e(a.topic)}</span><span class="meta-dot">·</span><span>约 ${a.minutes} 分钟</span>`;
  const footer = () => `<footer class="page-footer"><span>sumulige</span></footer>`;
  function sidebar(page) {
    const items = [['','home','首页'],['articles','writing','文章']];
    const active = page === 'article' ? 'articles' : page === 'project' ? 'projects' : page;
    return `<a href="#/" class="brand">sumulige<span>.</span></a>
      <button class="search-trigger" data-action="search">${icon('search')}<span>搜索</span><kbd aria-hidden="true">/</kbd></button>
      <nav aria-label="主要导航">${items.map(([slug, shape, label]) => `<a href="#/${slug}" ${active === slug ? 'aria-current="page"' : ''}>${icon(shape)}<span>${label}</span></a>`).join('')}</nav>`;
  }
  function searchableArticle(a) {
    if (!searchCache.has(a)) {
      const source = document.createElement('template');
      source.innerHTML = a.body;
      source.content.querySelectorAll('p,li,h2,h3,h4,td,th,figcaption,pre').forEach(node => node.append(' '));
      const body = source.content.textContent.replace(/\s+/g, ' ').trim();
      searchCache.set(a, {body, all: `${a.title} ${a.description} ${a.topic} ${body}`.toLocaleLowerCase()});
    }
    return searchCache.get(a);
  }
  function matchExcerpt(a, query) {
    if (!query) return '';
    const body = searchableArticle(a).body;
    const at = body.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
    if (at < 0) return `<p class="search-excerpt">${e(a.description)}</p>`;
    const start = Math.max(0, at - 36);
    const end = Math.min(body.length, at + query.length + 88);
    return `<p class="search-excerpt">${start ? '…' : ''}${e(body.slice(start, at))}<mark>${e(body.slice(at, at + query.length))}</mark>${e(body.slice(at + query.length, end))}${end < body.length ? '…' : ''}</p>`;
  }
  function articleRow(a, back = '', level = 3, query = '') {
    const heading = `h${level}`;
    return `<a class="article-row" data-article-id="${e(a.id)}" href="${pathTo(a, back)}"><div><div class="meta">${meta(a)}</div><${heading}>${e(a.title)}</${heading}>${matchExcerpt(a, query)}</div><span class="row-arrow">${icon('arrow')}</span></a>`;
  }
  function pageIntro(title, description = '') {
    return `<header class="page-intro"><h1>${title}</h1>${description ? `<p>${description}</p>` : ''}</header>`;
  }
  function projectPreview(project) {
    const art = project.visual === 'personal-site' ? `<div class="mini-browser"><div class="mini-rail"><i></i><i></i><i></i><i></i></div><div class="mini-main"><b>sumulige<span>.</span></b><div class="mini-heading">你好，我是 sumulige。</div><div class="mini-line"></div><div class="mini-line short"></div><div class="mini-block"><i></i><i></i></div></div></div>` : `<div class="project-wordmark">${e(project.title)}</div>`;
    return `<a class="project-card" href="#/project/${encodeURIComponent(project.id)}"><div class="project-art" aria-hidden="true">${art}</div><div class="project-card-body"><span class="meta">${e(project.topic)} <span class="meta-dot">·</span> ${e(project.status)}</span><h2>${e(project.title)} ${icon('up')}</h2><p>${e(project.description)}</p></div></a>`;
  }
  function home() {
    const entries = articles().filter(a => a.id.startsWith("p0-") && a.id !== "p0-guide").slice(0,8);
    return `<div class="page home-page"><section class="home-intro"><div><h1>sumulige<span class="blue">。</span></h1><p>研究与写作</p></div></section><section class="series-intro"><span class="eyebrow">53组 · 162篇文章</span><h2>训练研究与决策</h2><p>从测量与模型，到证据、选择和适用边界。</p><a class="button" href="#/article/p0-guide">阅读索引 ${icon("arrow")}</a></section><section class="series-intro"><span class="eyebrow">研究 001 · 七篇系列</span><h2>精英耐力教练工作流</h2><p>从专业职责与公开案例，走向可以检查的模型。</p><a class="button" href="#/article/series-guide">阅读指南 ${icon("arrow")}</a></section><section class="recent-section"><div class="section-heading"><h2>文章</h2><a href="#/articles">全部 ${icon('arrow')}</a></div>${entries.length ? `<div class="article-list">${entries.map(a=>articleRow(a)).join('')}</div>` : '<div class="empty-state"><h2>内容整理中</h2></div>'}</section>${footer()}</div>`;
  }
  function filterArticles(params) {
    const q = (params.get('q') || '').trim().toLocaleLowerCase();
    const topic = params.get('topic') || '';
    return articles().filter(a => (!topic || a.topic === topic) && (!q || searchableArticle(a).all.includes(q)));
  }
  function selection(params) {
    const found = filterArticles(params);
    const size = 8;
    const pages = Math.max(1, Math.ceil(found.length / size));
    const requested = Math.floor(Number(params.get('page')) || 1);
    const page = Math.min(pages, Math.max(1, requested));
    return {found, size, pages, page};
  }
  function resultSummary(params) {
    const {found, pages, page} = selection(params);
    return `${found.length} 篇文章${pages > 1 ? ` · 第 ${page} / ${pages} 页` : ''}`;
  }
  function results(params) {
    const {found, size, pages, page} = selection(params);
    const back = '#/articles' + (params.size ? '?' + params.toString() : '');
    return `${found.length ? `<div class="article-list">${found.slice((page-1)*size,page*size).map(a=>articleRow(a,back,2,(params.get('q') || '').trim())).join('')}</div>` : `<div class="empty-state">${icon('search')}<h2>未找到文章</h2><button class="button secondary" data-action="reset-filters">清空筛选</button></div>`}${pages > 1 ? `<nav class="pagination" aria-label="文章分页"><button data-page="${page-1}" ${page === 1 ? 'disabled' : ''}>上一页</button><span>第 ${page} / ${pages} 页</span><button data-page="${page+1}" ${page === pages ? 'disabled' : ''}>下一页</button></nav>` : ''}`;
  }
  function library(params) {
    const topics = [...new Set(articles().map(a=>a.topic))];
    return `<div class="page">${pageIntro('文章')}<label class="search-box">${icon('search')}<span class="sr-only">搜索文章标题与正文</span><input id="article-search" name="q" type="search" placeholder="搜索标题或正文" value="${e(params.get('q') || '')}" autocomplete="off"><kbd aria-hidden="true">/</kbd></label><div class="topic-filters" role="group" aria-label="文章主题">${['',...topics].map(t=>`<button data-topic="${e(t)}" aria-pressed="${(params.get('topic') || '') === t}">${e(t || '全部')}</button>`).join('')}</div><div id="result-count" class="result-count" role="status" aria-live="polite" aria-atomic="true" tabindex="-1"></div><div id="article-results">${results(params)}</div>${footer()}</div>`;
  }
  const tocLinks = a => a.toc.filter(t=>t.level<=3).map(t=>`<a class="toc-level-${t.level}" href="${pathTo(a)}?section=${encodeURIComponent(t.id)}" data-section="${e(t.id)}">${e(t.text)}</a>`).join('');
  const relatedArticles = a => { const list = articles().filter(x => x.topic === a.topic && !['series-guide','p0-guide'].includes(x.id)); const at = list.findIndex(x => x.id === a.id); return at < 0 ? list.slice(0,2) : [list[at-1],list[at+1]].filter(Boolean); };
  function feedback() {
    return `<section class="feedback"><h2><label for="feedback-text">阅读反馈</label></h2>
      <textarea id="feedback-text" name="feedback" rows="4" maxlength="1600" placeholder="你的尝试或疑问" aria-describedby="feedback-help feedback-error"></textarea>
      <p id="feedback-error" class="field-error"></p>
      <div class="feedback-actions"><button class="button" data-action="save-feedback">保存草稿</button><button class="text-button" data-action="clear-feedback">清除草稿</button><button class="text-button" data-action="undo-feedback" hidden>撤销清除</button></div>
      <p id="feedback-state" class="feedback-state" role="status" aria-live="polite" aria-atomic="true"></p>
      <small id="feedback-help">仅存本机，不会发送。</small></section>`;
  }
  function article(id, params) {
    const a = articles().find(x=>x.id===id);
    if (!a) return missing();
    const back = params.get('back');
    const backHref = back?.startsWith('#/articles') ? back : '#/articles';
    return `<div class="page reading-page"><div class="reading-top"><a data-list-return href="${e(backHref)}">← 文章</a><button class="text-button" data-action="share">${icon('copy')} ${location.protocol==='file:' ? '复制标题' : '复制链接'}</button><p id="share-state" role="status" aria-live="polite"></p></div>
      <header class="article-header"><a class="eyebrow" href="${topicLink(a.topic)}">${e(a.topic)}</a><h1>${e(a.title)}</h1><p>${e(a.description)}</p><div class="article-author"><span class="avatar-letter" aria-hidden="true">s.</span><span>sumulige <span class="muted">· 约 ${a.minutes} 分钟</span></span></div><p class="source-note">研究记录 · 形式验证不等于真实决策或训练效果验证</p></header>
      ${a.toc.length ? `<details class="mobile-toc"><summary>文章目录</summary><nav aria-label="文章目录">${tocLinks(a)}</nav></details>` : ''}
      <div class="reading-layout"><div><article class="prose" aria-label="文章正文">${a.body}</article>${feedback()}<div class="related"><h2>继续阅读</h2>${relatedArticles(a).map(x=>articleRow(x)).join('')}</div></div>
      <aside class="toc" aria-label="文章目录"><span>目录</span>${tocLinks(a)}<button class="text-button" data-action="top">回到顶部 ↑</button></aside></div>${footer()}</div>`;
  }
  function projects() {
    return `<div class="page">${pageIntro('项目')}<div class="projects-grid">${projectsData().map(projectPreview).join('')}</div>${footer()}</div>`;
  }
  function project(id) {
    const p = projectsData().find(project=>project.id===id);
    if (!p) return missing();
    const related = articles().filter(a=>(p.related || []).includes(a.id));
    return `<div class="page project-detail"><div class="reading-top"><a href="#/projects">← 项目</a><span class="meta">${e(p.topic)} · ${e(p.status)}</span></div>${pageIntro(e(p.title))}<div class="project-summary"><div><span>目标</span><p>${e(p.problem)}</p></div><div><span>进度</span><p>${e(p.stage)}</p></div><div><span>时间</span><p>${e(p.period)}</p></div></div><div class="project-narrative">${p.sections.map((section,i)=>`<section><span class="step-number">${String(i+1).padStart(2,'0')}</span><div><h2>${e(section.title)}</h2><p>${e(section.text)}</p></div></section>`).join('')}</div>${related.length?`<div class="related"><h2>相关阅读</h2>${related.map(a=>articleRow(a)).join('')}</div>`:''}${footer()}</div>`;
  }
  function books() {
    const content = booksData().length ? `<div class="book-grid">${booksData().map(book=>`<article class="book-card"><div class="book-spine" aria-hidden="true">${icon('book')}</div><div><span class="eyebrow">${e(book.status)}</span><h2>${e(book.title)}</h2><span class="book-author">${e(book.author)}</span><p>${e(book.note)}</p></div></article>`).join('')}</div>` : `<div class="books-empty"><div class="book-outline" aria-hidden="true">${icon('book')}</div><h2>正在整理</h2><a class="quiet-link" href="#/articles">先读文章 ${icon('arrow')}</a></div>`;
    return `<div class="page">${pageIntro('书架')}${content}${footer()}</div>`;
  }
  function about() {
    return `<div class="page about-page">${pageIntro('关于')}<div class="empty-state"><h2>内容整理中</h2></div>${footer()}</div>`;
  }
  function missing() {
    return `<div class="page"><div class="empty-state"><span class="eyebrow">404</span><h1>页面不存在</h1><a class="button" href="#/">回到首页</a></div>${footer()}</div>`;
  }
  window.SiteViews = {e, icon, sidebar, home, library, results, resultSummary, article, projects, project, books, about, missing};
})();
