// A real judge job can finish within two seconds. Arm in the renderer before
// starting it so a slow driver round-trip cannot miss the entire Stop window.
// Only the follow-up activation is DOM-driven; the initial click is Playwright's.
export async function actWhileCodeRuns(page, startName, actionName, timeout = 20000) {
  if (!['Run', 'Submit'].includes(startName) || !['Stop', 'Back to library'].includes(actionName)) {
    throw new Error('Unsupported running-code action');
  }
  await page.evaluate(({ actionName, timeout }) => {
    if (window.__studyRunningAction) throw new Error('A running-code action is already armed');
    if (document.querySelector('.coding-workspace:not([hidden]) .stop-code')) throw new Error('A code job is already running');
    let complete, timer, observer, settled = false;
    const state = { done: new Promise(resolve => { complete = resolve; }), cancel: null };
    const settle = error => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      clearTimeout(timer);
      complete({ error });
    };
    const activate = () => {
      const workspace = document.querySelector('.coding-workspace:not([hidden])');
      const stop = workspace?.querySelector('button.stop-code');
      if (!stop || !workspace.querySelector('.judge-running')) return;
      const target = actionName === 'Stop' ? stop : document.querySelector('button[aria-label="Back to library"]');
      if (!target || target.disabled || !target.checkVisibility({ checkVisibilityCSS: true, checkOpacity: true })) {
        settle(`${actionName} was not available while code was running`);
        return;
      }
      // Disconnect before clicking: navigation and cancellation both mutate UI.
      observer.disconnect();
      try { target.click(); settle(null); } catch (error) { settle(String(error)); }
    };
    observer = new MutationObserver(activate);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    timer = setTimeout(() => {
      const verdict = document.querySelector('.judge-summary strong')?.textContent || 'no result';
      settle(`Never observed running controls for ${actionName} (${verdict})`);
    }, timeout);
    state.cancel = () => settle('Running-code action was disposed before activation');
    window.__studyRunningAction = state;
  }, { actionName, timeout });
  try {
    await page.getByRole('button', { name: startName, exact: true }).click();
    const { error } = await page.evaluate(() => window.__studyRunningAction.done);
    if (error) throw new Error(error);
  } finally {
    await page.evaluate(() => {
      window.__studyRunningAction?.cancel();
      delete window.__studyRunningAction;
    });
  }
}
