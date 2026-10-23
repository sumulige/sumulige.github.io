(() => {
  let ready;
  const load = src => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
  function libraries() {
    if (!ready) ready = Promise.all([load('assets/katex.min.js'), load('assets/mermaid.min.js')]).then(() => {
      mermaid.initialize({startOnLoad: false, securityLevel: 'strict', theme: 'neutral',
        fontFamily: 'system-ui, sans-serif', flowchart: {htmlLabels: false, useMaxWidth: false}});
    }).catch(error => { ready = null; throw error; });
    return ready;
  }
  window.renderResearch = async root => {
    const formulas = [...root.querySelectorAll('.math-source')];
    const diagrams = [...root.querySelectorAll('.mermaid')];
    if (!formulas.length && !diagrams.length) return;
    try {
      await libraries();
      if (!root.isConnected) return;
      for (const node of formulas) {
        katex.render(node.textContent, node, {displayMode: node.dataset.display === 'true', throwOnError: true, trust: false});
        node.classList.add('math-rendered');
      }
      if (diagrams.length) await mermaid.run({nodes: diagrams});
    } catch (error) {
      if (!root.isConnected) return;
      const note = document.createElement('p');
      note.className = 'field-error';
      note.textContent = '公式或流程图未能显示，已保留原始表达。刷新页面可重试。';
      root.prepend(note);
      console.error('Research rendering failed', error);
    }
  };
})();
