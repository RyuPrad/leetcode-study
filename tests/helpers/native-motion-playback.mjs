// Playback advances on timers, whereas a driver's default waitForFunction polls
// animation frames. Arm in the renderer so delayed polling or a late native-click
// response cannot let the whole example finish before we exercise Pause.
export function armNativeMotionPlayback({ minimum = 12, timeout = 30000 } = {}) {
  if (!Number.isInteger(minimum) || minimum < 1 || !Number.isFinite(timeout) || timeout <= 0) {
    throw new Error('Invalid native playback observation bounds');
  }
  const play = document.getElementById('study-play');
  const next = document.getElementById('btn-next');
  if (!play || !next || play.getAttribute('aria-pressed') !== 'false' || next.disabled) {
    throw new Error('Native playback must start paused on an unfinished example');
  }
  window.nativeMotionPlayback = [];
  let previous = nativePointerProbe.sample(), settled = false, timer, complete;
  window.nativeMotionCompletion = new Promise(resolve => { complete = resolve; });
  const settle = error => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    play.removeEventListener('click', startDeadline);
    complete({ error, index: studyLessonSource.index(), recorded: nativeMotionPlayback.length,
      playing: play.getAttribute('aria-pressed'), finished: next.disabled });
  };
  const unsubscribe = studyLessonAdapter.subscribe(() => {
    if (settled) return;
    try {
      const after = nativePointerProbe.sample();
      if (after.index === previous.index) return;
      nativeMotionPlayback.push({ before: previous, after });
      previous = after;
      if (nativeMotionPlayback.length < minimum) return;
      if (next.disabled || play.getAttribute('aria-pressed') !== 'true' ||
          play.getAttribute('aria-label') !== 'Pause' || play.disabled ||
          !play.checkVisibility({ checkVisibilityCSS: true, checkOpacity: true })) {
        settle('Native Pause was not available during unfinished playback');
        return;
      }
      // Exercise the actual UI handler, not an internal pause API. The initial
      // Play remains a native Playwright click with the real window focused.
      play.click();
      settle(play.getAttribute('aria-pressed') === 'false' ? null : 'Native Pause did not stop playback');
    } catch (error) { settle(String(error)); }
  });
  const startDeadline = () => {
    if (timer === undefined && !settled) {
      timer = setTimeout(() => settle(`Native playback did not record ${minimum} transitions before its deadline`), timeout);
    }
  };
  play.addEventListener('click', startDeadline, { once: true });
  window.nativeMotionUnsubscribe = () => {
    unsubscribe();
    settle('Native playback observation was disposed before Pause');
  };
}
