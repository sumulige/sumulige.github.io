(() => {
  const V = window.SiteViews;
  const main = document.querySelector('main');
  const sidebar = document.querySelector('#sidebar');
  const mobileNav = document.querySelector('#mobile-nav');
  const menuButton = document.querySelector('#menu-toggle');
  const menu = document.querySelector('#menu-dialog');
  const imageDialog = document.querySelector('#image-dialog');
  const imageStage = document.querySelector('#image-stage');
  const imagePreview = document.querySelector('#image-preview');
  const imageZoom = imageDialog.querySelector('[data-action="image-zoom"]');
  const mobileMedia = matchMedia('(max-width:700px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const drafts = new Map();
  const listPositions = new Map();
  let lastHash;
  let lastImageTrigger;
  let pendingNavigation = null;
  let nextFocus = '';
  let summaryTimer;
  let scrollFrame = 0;
  let headings = [];

  function route() {
    const [path, query = ''] = (location.hash.slice(1) || '/').split('?');
    const [page = '', id = ''] = path.replace(/^\//, '').split('/');
    return {page, id, params: new URLSearchParams(query)};
  }

  function setText(selector, text) {
    const element = document.querySelector(selector);
    if (element && element.textContent !== text) element.textContent = text;
  }

  function closeMenu() {
    if (menu.open) menu.close();
  }

  function syncModalScroll() {
    document.body.classList.toggle('modal-open', menu.open || imageDialog.open);
  }

  function openMenu() {
    if (!mobileMedia.matches || menu.open) return;
    menu.showModal();
    menuButton.setAttribute('aria-expanded', 'true');
    syncModalScroll();
  }

  function closeImage() {
    if (imageDialog.open) imageDialog.close();
  }

  function enhanceFigures() {
    main.querySelectorAll('.prose figure img').forEach(image => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'figure-zoom';
      button.setAttribute('aria-label', '查看大图：' + (image.alt || '文章配图'));
      button.setAttribute('aria-haspopup', 'dialog');
      image.replaceWith(button);
      button.append(image);
      const hint = document.createElement('span');
      hint.className = 'image-action';
      hint.setAttribute('aria-hidden', 'true');
      hint.innerHTML = '查看大图 ' + V.icon('up');
      button.append(hint);
    });
  }

  function openImage(button) {
    const image = button.querySelector('img');
    lastImageTrigger = button;
    imageStage.classList.remove('is-zoomed');
    imagePreview.style.width = '';
    imageZoom.setAttribute('aria-pressed', 'false');
    imageZoom.textContent = '放大';
    imageZoom.disabled = true;
    setText('#image-caption', image.alt || '图表预览');
    document.querySelector('#image-status').hidden = true;
    imagePreview.alt = image.alt;
    imagePreview.src = image.currentSrc || image.src;
    imageDialog.showModal();
    syncModalScroll();
    imageStage.scrollTo(0, 0);
  }

  function zoomImage() {
    const enlarged = imageStage.classList.toggle('is-zoomed');
    imagePreview.style.width = enlarged ? Math.max(imagePreview.naturalWidth, imageStage.clientWidth * 1.8) + 'px' : '';
    imageZoom.setAttribute('aria-pressed', String(enlarged));
    imageZoom.textContent = enlarged ? '适应窗口' : '放大';
    imageStage.scrollTo(0, 0);
  }

  function closeOnBackdrop(event) {
    const dialog = event.currentTarget;
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }

  function rememberList(trigger) {
    const position = {hash: location.hash, y: window.scrollY, id: trigger?.dataset.articleId || ''};
    listPositions.set(position.hash, position);
    history.replaceState({...history.state, siteList: position}, '', location.href);
  }

  function changeRoute() {
    if (lastHash === location.hash) return;
    const restore = pendingNavigation ? pendingNavigation.restore : history.state?.siteList;
    pendingNavigation = null;
    render(true, restore);
  }

  function draftKey() { return 'sumulige-preview-feedback:' + route().id; }

  function currentDraft() {
    const id = route().id;
    if (!drafts.has(id)) {
      let text = '';
      let error = '';
      try { text = localStorage.getItem(draftKey()) || ''; }
      catch { error = '浏览器不允许本地存储，输入内容暂时无法保存。'; }
      drafts.set(id, {text, saved: text, undo: null, error, invalid: false, message: text ? '已读取本机草稿' : ''});
    }
    return drafts.get(id);
  }

  function showDraft() {
    const field = document.querySelector('#feedback-text');
    if (!field) return;
    const draft = currentDraft();
    if (field.value !== draft.text) field.value = draft.text;
    if (draft.invalid) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
    setText('#feedback-error', draft.error);
    setText('#feedback-state', draft.message);
    document.querySelector('[data-action="undo-feedback"]').hidden = !draft.undo;
    document.querySelector('[data-action="clear-feedback"]').disabled = !draft.text && !draft.saved;
  }

  function saveDraft() {
    const draft = currentDraft();
    const value = draft.text.trim();
    if (!value) {
      draft.error = '请先填写内容，再保存草稿。';
      draft.invalid = true;
      showDraft();
      document.querySelector('#feedback-text').focus();
      return;
    }
    try {
      localStorage.setItem(draftKey(), value);
      Object.assign(draft, {text: value, saved: value, undo: null, error: '', invalid: false, message: '已保存到本机'});
    } catch {
      draft.error = '保存失败。输入内容仍在此页，请复制留存后再离开。';
      draft.message = '尚未保存';
    }
    showDraft();
  }

  function clearDraft() {
    const draft = currentDraft();
    try {
      localStorage.removeItem(draftKey());
      draft.undo = {text: draft.text, saved: draft.saved};
      Object.assign(draft, {text: '', saved: '', error: '', invalid: false, message: '草稿已清除，可撤销。'});
    } catch { draft.error = '清除失败，草稿内容仍保留。'; }
    showDraft();
    document.querySelector('[data-action="undo-feedback"]:not([hidden])')?.focus();
  }

  function undoClear() {
    const draft = currentDraft();
    if (!draft.undo) return;
    try {
      if (draft.undo.saved) localStorage.setItem(draftKey(), draft.undo.saved);
      else localStorage.removeItem(draftKey());
      Object.assign(draft, draft.undo, {undo: null, error: ''});
      draft.message = draft.text === draft.saved ? '已恢复本机草稿' : '已恢复，尚未保存';
    } catch { draft.error = '恢复本机草稿失败，请稍后重试。'; }
    showDraft();
    document.querySelector('#feedback-text').focus();
  }

  function updateSummary(params, delay = 0) {
    clearTimeout(summaryTimer);
    summaryTimer = setTimeout(() => setText('#result-count', V.resultSummary(params)), delay);
  }

  function render(focus = false, restore = null) {
    const {page, id, params} = route();
    lastHash = location.hash;
    closeMenu();
    closeImage();
    const pages = {'': V.home, articles: () => V.library(params), article: () => V.article(id, params), projects: V.projects, project: () => V.project(id), books: V.books, about: V.about};
    sidebar.innerHTML = V.sidebar(page);
    mobileNav.innerHTML = V.sidebar(page);
    main.innerHTML = (pages[page] || V.missing)();
    enhanceFigures();
    window.renderResearch(main.querySelector(".prose") || main);
    document.title = (main.querySelector('h1')?.textContent || '个人空间') + ' · sumulige';
    showDraft();
    if (page === 'articles') updateSummary(params);
    headings = [...main.querySelectorAll('.prose h2[id],.prose h3[id]')];
    if (focus) {
      window.scrollTo({top: 0, behavior: 'auto'});
      main.focus({preventScroll: true});
    }
    if (nextFocus === 'search') document.querySelector('#article-search')?.focus();
    nextFocus = '';
    requestAnimationFrame(() => {
      if (params.has('section')) jumpToSection(params.get('section'), false);
      else if (page === 'articles' && restore?.hash === location.hash) {
        const card = [...main.querySelectorAll('[data-article-id]')].find(item => item.dataset.articleId === restore.id);
        (card || main).focus({preventScroll: true});
        window.scrollTo({top: restore.y, behavior: 'auto'});
      }
      markCurrentSection();
    });
  }

  function updateFilters(key, value, replace = false) {
    const params = route().params;
    if (value) params.set(key, value); else params.delete(key);
    if (key !== 'page') params.delete('page');
    const hash = '#/articles' + (params.size ? '?' + params.toString() : '');
    if (hash !== location.hash) history[replace ? 'replaceState' : 'pushState'](null, '', hash);
    lastHash = location.hash;
    document.querySelector('#article-results').innerHTML = V.results(params);
    document.querySelectorAll('[data-topic]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.topic === (params.get('topic') || '')));
    });
    updateSummary(params, replace ? 180 : 0);
    if (key === 'page') {
      setText('#result-count', V.resultSummary(params));
      document.querySelector('#result-count').focus();
    }
  }

  function search() {
    closeMenu();
    if (route().page !== 'articles') {
      nextFocus = 'search';
      location.hash = '#/articles';
    } else document.querySelector('#article-search')?.focus();
  }

  function jumpToSection(id, animate = true) {
    const target = document.getElementById(id);
    if (!target?.matches('.prose [id]')) return;
    target.scrollIntoView({behavior: animate && !reducedMotion.matches ? 'smooth' : 'auto', block: 'start'});
    target.focus({preventScroll: true});
  }

  function markCurrentSection() {
    scrollFrame = 0;
    if (!headings.length) return;
    const current = headings.filter(heading => heading.getBoundingClientRect().top <= 150).at(-1) || headings[0];
    document.querySelectorAll('[data-section]').forEach(link => {
      if (link.dataset.section === current.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  async function share() {
    const article = window.SITE_CONTENT.articles.find(item => item.id === route().id);
    if (!article) return;
    const file = location.protocol === 'file:';
    const text = file ? article.title : location.href.split('#')[0] + '#/article/' + article.id;
    try {
      await navigator.clipboard.writeText(text);
      setText('#share-state', file ? '已复制文章标题' : '已复制文章链接。');
    } catch {
      setText('#share-state', file ? '复制未成功，请选中文章标题手动复制。' : '复制未成功，请从地址栏复制当前链接。');
    }
  }

  document.addEventListener('click', event => {
    const section = event.target.closest('[data-section]');
    if (section && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
      event.preventDefault();
      section.closest('details')?.removeAttribute('open');
      const {page, id, params} = route();
      params.set('section', section.dataset.section);
      history.replaceState(null, '', `#/${page}/${id}?${params}`);
      lastHash = location.hash;
      jumpToSection(section.dataset.section);
      return;
    }
    if (event.target.closest('.skip-link')) {
      event.preventDefault();
      main.focus();
      return;
    }
    const navigation = event.target.closest('a[href^="#/"]');
    if (navigation && navigation.hash !== location.hash && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
      if (route().page === 'articles') rememberList(navigation.closest('[data-article-id]'));
      pendingNavigation = {restore: navigation.hasAttribute('data-list-return') ? listPositions.get(navigation.hash) : null};
    }
    if (navigation && menu.open) {
      closeMenu();
      if (navigation.hash === location.hash) main.focus();
    }
    const topic = event.target.closest('[data-topic]');
    if (topic) { updateFilters('topic', topic.dataset.topic); return; }
    const pagination = event.target.closest('[data-page]');
    if (pagination) { updateFilters('page', pagination.dataset.page); return; }
    const figure = event.target.closest('.figure-zoom');
    if (figure) { openImage(figure); return; }
    const actions = {
      search, share,
      'close-menu': closeMenu,
      'close-image': closeImage,
      'image-zoom': zoomImage,
      'save-feedback': saveDraft,
      'clear-feedback': clearDraft,
      'undo-feedback': undoClear,
      'reset-filters': () => {
        history.pushState(null, '', '#/articles');
        document.querySelector('#article-search').value = '';
        updateFilters('q', '');
        document.querySelector('#article-search').focus();
      },
      top: () => {
        window.scrollTo({top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth'});
        main.focus({preventScroll: true});
      },
    };
    actions[event.target.closest('[data-action]')?.dataset.action]?.();
  });

  document.addEventListener('input', event => {
    if (event.target.id === 'article-search' && !event.isComposing) updateFilters('q', event.target.value, true);
    if (event.target.id === 'feedback-text') {
      const draft = currentDraft();
      Object.assign(draft, {text: event.target.value, undo: null, invalid: false, error: ''});
      draft.message = draft.text === draft.saved ? (draft.saved ? '已保存到本机' : '') : '尚未保存';
      showDraft();
    }
  });
  document.addEventListener('compositionend', event => {
    if (event.target.id === 'article-search') updateFilters('q', event.target.value, true);
  });
  document.addEventListener('keydown', event => {
    const editing = document.activeElement.matches('input, textarea, select') || document.activeElement.isContentEditable;
    if (event.key === '/' && !editing && !event.isComposing && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      search();
    }
  });
  document.addEventListener('error', event => {
    if (!event.target.matches?.('.prose img')) return;
    const figure = event.target.closest('figure');
    if (figure.querySelector('.image-error')) return;
    const note = document.createElement('p');
    note.className = 'image-error';
    note.textContent = '图片暂时无法显示。';
    figure.append(note);
    const button = figure.querySelector('.figure-zoom');
    if (button) button.disabled = true;
  }, true);
  menuButton.addEventListener('click', openMenu);
  menu.addEventListener('close', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    syncModalScroll();
  });
  imageDialog.addEventListener('close', () => {
    imagePreview.removeAttribute('src');
    syncModalScroll();
    if (lastImageTrigger?.isConnected) lastImageTrigger.focus({preventScroll: true});
  });
  menu.addEventListener('click', closeOnBackdrop);
  imageDialog.addEventListener('click', closeOnBackdrop);
  imagePreview.addEventListener('load', () => { imageZoom.disabled = false; });
  imagePreview.addEventListener('error', () => {
    if (!imageDialog.open || !imagePreview.hasAttribute('src')) return;
    const message = document.querySelector('#image-status');
    message.textContent = '图片暂时无法显示，请关闭后重试。';
    message.hidden = false;
    imageZoom.disabled = true;
  });
  mobileMedia.addEventListener('change', closeMenu);
  history.scrollRestoration = 'manual';
  window.addEventListener('hashchange', changeRoute);
  window.addEventListener('popstate', changeRoute);
  window.addEventListener('scroll', () => {
    if (!scrollFrame && headings.length) scrollFrame = requestAnimationFrame(markCurrentSection);
  }, {passive: true});
  window.addEventListener('beforeunload', event => {
    if (![...drafts.values()].some(draft => draft.text !== draft.saved)) return;
    event.preventDefault();
    event.returnValue = '';
  });
  render(false, history.state?.siteList);
})();
