/* Shared presentation adapter. Algorithm state and render functions stay in each problem. */
(() => {
  function attachPlayback(toolbar, steps, parentOrigin) {
    const next = document.getElementById('btn-next');
    const reset = document.getElementById('btn-reset');
    if (!next || !reset) throw new Error('This visualizer is missing playback controls.');
    // Older pages keep their algorithm helpers, but only this controller owns playback.
    if (typeof window.pauseAuto === 'function') window.pauseAuto(false);
    const play = document.createElement('button');
    play.id = 'study-play'; play.type = 'button';
    steps.insertBefore(play, reset);
    const speedLabel = document.createElement('label');
    speedLabel.className = 'study-speed';
    speedLabel.innerHTML = '<span>Speed</span><select id="study-speed" aria-label="Playback speed"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option><option value="4">4×</option></select>';
    steps.after(speedLabel);
    const speed = speedLabel.querySelector('select');
    let playing = false, timer = null, advancing = false;
    const finished = () => next.disabled || /finished/i.test(next.textContent);
    function update() {
      const label = playing ? 'Pause' : finished() ? 'Replay' : 'Play';
      const icon = playing ? 'Ⅱ' : finished() ? '↻' : '▶';
      play.innerHTML = `<span aria-hidden="true">${icon}</span><span>${label}</span>`;
      play.setAttribute('aria-label', label);
      play.setAttribute('aria-pressed', String(playing));
      play.title = playing ? 'Pause playback' : finished() ? 'Restart and play this example' : 'Play from the current step';
    }
    function pause() {
      playing = false;
      clearTimeout(timer); timer = null;
      update();
    }
    function schedule() {
      clearTimeout(timer); timer = null;
      if (!playing) return;
      timer = setTimeout(async () => {
        timer = null;
        if (!playing || document.hidden || finished()) { pause(); return; }
        advancing = true;
        try { if(window.studyWalkthrough){window.studyWalkthrough.setGate({canAdvance:true,nextStep:()=>next.click()});await window.studyWalkthrough.next();}else next.click(); } finally { advancing = false; }
        if (finished()) pause(); else schedule();
      }, (window.studyWalkthrough?.mode==='detailed'?2000:1000) / Number(speed.value));
    }
    play.addEventListener('click', () => {
      if (playing) { pause(); return; }
      if (finished()) reset.click();
      if (finished()) { update(); return; }
      playing = true; update(); schedule();
    });
    speed.addEventListener('change', schedule);
    window.addEventListener('study:moment-pause',pause);
    toolbar.addEventListener('click', event => {
      if (advancing || !(event.target instanceof Element)) return;
      if (event.target.closest('#btn-prev,#btn-next,#btn-reset,#btn-first,#btn-last,.study-examples-menu button,.study-custom-menu button')) pause();
    }, { capture: true });
    toolbar.addEventListener('input', event => {
      if (event.target instanceof Element && event.target.closest('.study-custom-menu')) pause();
    });
    // Manual steps, presets and resets can also change completion outside our timer.
    const observer = new MutationObserver(() => { if (playing && finished()) pause(); else update(); });
    observer.observe(next, { attributes: true, attributeFilter: ['disabled'], childList: true, characterData: true, subtree: true });
    window.addEventListener('message', event => {
      if (window.parent !== window && event.source === window.parent && event.origin === parentOrigin && event.data?.type === 'study:pause') pause();
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
    // In the desktop app, native window focus is forwarded by the parent. Iframe blur
    // also happens when clicking the app toolbar, so it must not stand in for app blur.
    if (window.parent === window) window.addEventListener('blur', pause);
    window.addEventListener('pagehide', () => { pause(); observer.disconnect(); }, { once: true });
    window.addEventListener('error', pause);
    update();
  }

  function mount() {
    const controls = document.getElementById('drag-container') || document.getElementById('float');
    const visual = document.querySelector('#visual-ui,#lists-ui,#svg,#lists');
    const code = document.querySelector('.code-panel,.code');
    if (!controls || !visual || !code) throw new Error('This visualizer is missing a workspace anchor.');
    document.body.dataset.workspaceVersion = '1';
    document.body.classList.toggle('study-embedded', new URLSearchParams(location.search).has('embedded'));
    const workspace = document.createElement('main');
    workspace.className = 'study-workspace';
    const title = document.querySelector('.page-title,h1');
    if (title) title.classList.add('page-title');
    const subtitle = document.querySelector('body > .subtitle');
    const heading = document.createElement('header');
    heading.className = 'study-heading';
    if (title) heading.append(title);
    if (subtitle) heading.append(subtitle);
    workspace.append(heading);

    const toolbar = document.createElement('section');
    toolbar.className = 'study-controls';
    toolbar.setAttribute('aria-label', 'Visualization controls');
    const steps = document.createElement('div');
    steps.className = 'study-step-controls';
    // The original Group Anagrams page used a class instead of the common reset ID.
    const legacyReset = controls.querySelector('.btn-reset');
    if (!document.getElementById('btn-reset') && legacyReset) legacyReset.id = 'btn-reset';
    for (const [id, hint] of [['btn-prev', 'Previous step (Left arrow)'], ['btn-next', 'Next step (Right arrow)'], ['btn-reset', 'Restart example']]) {
      const button = document.getElementById(id);
      if (button) { button.title = hint; steps.append(button); }
    }
    toolbar.append(steps);
    for (const button of controls.querySelectorAll('.btn-play,.btn-pause')) button.hidden = true;
    const examples = document.createElement('details');
    examples.className = 'study-input-menu study-examples-menu';
    examples.innerHTML = '<summary>Examples <span aria-hidden="true">⌄</span></summary><div class="study-input-popover"></div>';
    const exampleButtons = [...controls.querySelectorAll('button')].filter(button => /^load(?:Example|Ex)\(/.test(button.getAttribute('onclick') || ''));
    for (const button of exampleButtons) {
      examples.lastElementChild.append(button);
      button.addEventListener('click', () => { examples.open = false; });
    }
    toolbar.append(examples);
    const rows = [...controls.children].filter(el => el.querySelector('input,textarea,select') && !el.querySelector('#speed-input'));
    if (rows.length) {
      const custom = document.createElement('details');
      custom.className = 'study-input-menu study-custom-menu';
      custom.innerHTML = '<summary>Custom input <span aria-hidden="true">⌄</span></summary><div class="study-input-popover"></div>';
      rows.forEach(row => custom.lastElementChild.append(row));
      custom.querySelectorAll('input,textarea').forEach(input => {
        if (!input.getAttribute('aria-label') && !document.querySelector(`label[for="${input.id}"]`)) input.setAttribute('aria-label', input.id === 'target-input' ? 'Target' : 'Custom input');
      });
      toolbar.append(custom);
    }
    const options = [...controls.querySelectorAll('button[id*="toggle"],#labBtn,#layoutBtn,#objBtn')];
    if (options.length) {
      const menu = document.createElement('details'); menu.className = 'study-input-menu';
      menu.innerHTML = '<summary>View options <span aria-hidden="true">⌄</span></summary><div class="study-input-popover"></div>';
      options.forEach(button => menu.lastElementChild.append(button)); toolbar.append(menu);
    }
    const fullscreen = document.getElementById('btn-fullscreen') || document.createElement('button');
    fullscreen.id = 'btn-fullscreen';
    if (!fullscreen.textContent) fullscreen.textContent = 'Full Screen';
    if (fullscreen) {
      fullscreen.removeAttribute('onclick');
      fullscreen.onclick = async () => {
        try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
        catch { fullscreen.title = 'Fullscreen is unavailable in this window.'; }
      };
      toolbar.append(fullscreen);
    }
    workspace.append(toolbar);
    const feedback = document.createElement('div');
    feedback.className = 'study-feedback'; feedback.setAttribute('role', 'alert'); feedback.hidden = true;
    workspace.append(feedback);
    window.alert = message => { feedback.textContent = String(message); feedback.hidden = false; };
    toolbar.addEventListener('click', () => { feedback.hidden = true; }, { capture: true });

    const hud = document.getElementById('hud-ui');
    if (hud) { const strip = document.createElement('section'); strip.className = 'study-hud'; strip.setAttribute('aria-label', 'Pinned variables'); strip.append(hud); workspace.append(strip); }
    const visualPanel = visual.closest('.panel');
    const codePanel = code.closest('.panel');
    if (visualPanel) { visualPanel.classList.add('study-diagram'); workspace.append(visualPanel); }
    // Preserve Group Anagrams' separate input and final-result panels in the diagram.
    for (const id of ['input-ui', 'final-ui']) {
      const auxiliary = document.getElementById(id)?.closest('.panel');
      if (auxiliary && visualPanel && auxiliary !== visualPanel) {
        auxiliary.classList.add('study-auxiliary');
        if (id === 'input-ui') visualPanel.insertBefore(auxiliary, visual); else visualPanel.append(auxiliary);
      }
    }
    if (codePanel) { codePanel.classList.add('study-code'); workspace.append(codePanel); }

    const inspector = document.createElement('section');
    inspector.className = 'study-inspector';
    const tabs = document.createElement('div');
    tabs.className = 'study-inspector-tabs'; tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', 'Execution inspector');
    inspector.append(tabs);
    const contents = [];
    function addTab(label, panel) {
      if (!panel) return;
      panel.classList.add('study-inspector-panel');
      panel.id = `inspector-${label.toLowerCase()}`;
      panel.setAttribute('role', 'tabpanel');
      const button = document.createElement('button');
      button.id = `${panel.id}-tab`; button.textContent = label; button.setAttribute('role', 'tab'); button.setAttribute('aria-controls', panel.id);
      panel.setAttribute('aria-labelledby', button.id);
      button.onclick = () => contents.forEach(item => { const selected = item.button === button; item.panel.hidden = !selected; item.button.setAttribute('aria-selected', String(selected)); item.button.tabIndex = selected ? 0 : -1; });
      contents.push({ button, panel }); tabs.append(button); inspector.append(panel);
    }
    const variables = document.getElementById('console-ui') || document.getElementById('console');
    const trace = document.getElementById('trace-ui');
    // Some early pages place variables and code in the same panel; move only the variables node.
    if (variables) { const panel = document.createElement('div'); panel.append(variables); addTab('Variables', panel); }
    if (trace) { const panel = document.createElement('div'); panel.append(trace); addTab('Trace', panel); }
    const objects = document.querySelector('#object-view,#obj,.obj-view-grid')?.closest('.panel');
    if (objects && objects !== visualPanel && objects !== codePanel) addTab('Objects', objects);
    const explanation = document.createElement('div');
    for (const panel of document.querySelectorAll('body > .container > .panel,body > .layout > .panel,body > .panel')) {
      if (panel.children.length === 1 && panel.firstElementChild.tagName === 'H2') continue;
      if (!panel.querySelector('#visual-ui,.code-panel') && panel.textContent.trim() && !/^(Iteration Trace|Step Trace|Variables\s*&\s*Outputs|Operation Trace|Recursion Trace|Column Trace|Union Trace)$/.test(panel.textContent.trim())) explanation.append(panel);
    }
    if (explanation.children.length) addTab('Guide', explanation);
    contents[0]?.button.click();
    tabs.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.stopPropagation(); event.preventDefault();
      const index = contents.findIndex(item => item.button === document.activeElement);
      const next = contents[(index + (event.key === 'ArrowRight' ? 1 : contents.length - 1)) % contents.length];
      next.button.click(); next.button.focus();
    });
    workspace.append(inspector);
    controls.hidden = true;
    for (const container of document.querySelectorAll('body > .container,body > .layout')) container.hidden = true;
    document.body.prepend(workspace);

    const requestedOrigin = new URLSearchParams(location.search).get('parentOrigin');
    const parentOrigin = /^http:\/\/127\.0\.0\.1:\d+$/.test(requestedOrigin || '') ? requestedOrigin : 'study://app';
    attachPlayback(toolbar, steps, parentOrigin);
    let lastSent = -Infinity;
    const notifyActivity = () => {
      if (performance.now() - lastSent < 800) return;
      lastSent = performance.now();
      if (window.parent !== window) window.parent.postMessage({ type: 'study:activity' }, parentOrigin);
    };
    for (const event of ['pointerdown', 'keydown', 'wheel', 'input']) document.addEventListener(event, notifyActivity, { capture: true, passive: true });
    document.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && window.parent !== window) {
        event.preventDefault();
        window.parent.postMessage({ type: 'study:search' }, parentOrigin);
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input,textarea,select,[contenteditable="true"],[role="tablist"]')) return;
      const id = event.key === 'ArrowRight' ? 'btn-next' : event.key === 'ArrowLeft' ? 'btn-prev' : null;
      if (id) { event.preventDefault(); document.getElementById(id)?.click(); }
    });
    document.addEventListener('pointerdown', event => {
      for (const menu of toolbar.querySelectorAll('details[open]')) if (!menu.contains(event.target)) menu.open = false;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true }); else mount();
})();
