import assert from 'node:assert/strict';

// Exercise the controls the learner uses, and verify the diagram's intermediate
// state as well as the highlight. A single painted line alone is insufficient.
export async function testSingleLineHighlights(frame, captureStep) {
  const originalMode = await frame.getByLabel('Walkthrough detail').inputValue();
  const originalSpeed = await frame.getByLabel('Playback speed', {exact: true}).inputValue();
  const read = () => frame.evaluate(() => {
    const raw = studyLessonSource.read(), op = studyWalkthrough.operation;
    return {
      index: studyLessonSource.index(), phase: op.phase, action: op.action,
      left: raw.left, nums: [...raw.nums],
      lines: [...document.querySelectorAll('.operation-code')].map(el => el.id),
      extraHighlights: [...document.querySelectorAll('.study-code .active:not(.operation-code)')]
        .filter(el => getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)').map(el => el.id)
    };
  });
  function single(state) {
    assert.equal(state.lines.length, 1, 'exactly one source line is highlighted');
    assert.deepEqual(state.extraHighlights, [], 'legacy highlights do not paint additional lines');
    return state;
  }
  function pointer(state) {
    single(state);
    assert.equal(state.phase, 'ADVANCE_LEFT');
    assert.deepEqual(state.lines, ['line-6']);
    assert.equal(state.left, 1);
    assert.deepEqual(state.nums, [1, 1, 3], 'left++ must not copy the array value');
  }
  function copy(state) {
    single(state);
    assert.equal(state.phase, 'WRITE');
    assert.deepEqual(state.lines, ['line-7']);
    assert.equal(state.left, 1, 'the copy must not advance left again');
    assert.deepEqual(state.nums, [1, 3, 3]);
    assert.doesNotMatch(state.action, /advance left/i);
  }
  const load = () => frame.evaluate(() => {
    document.getElementById('custom-input').value = '1,1,3';
    window.loadCustom();
  });
  for (const mode of ['detailed', 'compact']) {
    await frame.getByLabel('Walkthrough detail').selectOption(mode);
    await load();
    single(await read());
    let advanced;
    for (let step = 0; step < 30; step++) {
      await frame.locator('#btn-next').click();
      const state = single(await read());
      if (state.phase === 'ADVANCE_LEFT') { advanced = state; break; }
    }
    assert.ok(advanced, 'Step Over reaches left++');
    pointer(advanced);
    if (captureStep && mode === 'compact') await captureStep('pointer');
    await frame.locator('#btn-next').click();
    const copied = await read();
    copy(copied);
    assert.equal(copied.index, advanced.index + 1, 'the copy is the very next step');
    if (captureStep && mode === 'compact') await captureStep('copy');

    await frame.locator('#btn-prev').click();
    const back = single(await read());
    assert.equal(back.left, 1);
    assert.deepEqual(back.nums, [1, 1, 3], 'Step Back reverses only the copy');
    await frame.locator('#btn-next').click();
    copy(await read());
    await frame.getByLabel('Seek lesson step').evaluate((range, index) => {
      range.value = String(index); range.dispatchEvent(new Event('input', {bubbles: true}));
    }, advanced.index);
    await frame.waitForFunction(index => studyLessonSource.index() === index, advanced.index);
    assert.deepEqual(single(await read()).nums, [1, 1, 3]);
    await frame.locator('#btn-next').click();
    copy(await read());
    await frame.locator('#btn-reset').click();
    assert.equal(single(await read()).index, 0);

    await load();
    await frame.getByLabel('Playback speed', {exact: true}).selectOption('4');
    await frame.evaluate(() => {
      window.singleLinePlayback = [];
      window.stopSingleLineCapture = studyLessonAdapter.subscribe(() => {
        const op = studyWalkthrough.operation, raw = studyLessonSource.read();
        window.singleLinePlayback.push({
          index: studyLessonSource.index(), phase: op.phase, action: op.action,
          left: raw.left, nums: [...raw.nums],
          lines: [...document.querySelectorAll('.operation-code')].map(el => el.id),
          extraHighlights: [...document.querySelectorAll('.study-code .active:not(.operation-code)')]
            .filter(el => getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)').map(el => el.id)
        });
      });
    });
    try {
      await frame.getByRole('button', {name: 'Play', exact: true}).click();
      await frame.waitForFunction(() => window.singleLinePlayback.some(event => event.phase === 'WRITE'), null, {timeout: 30000});
      await frame.getByRole('button', {name: 'Pause', exact: true}).click();
      const events = await frame.evaluate(() => window.singleLinePlayback);
      events.forEach(single);
      const advanceIndex = events.findIndex(event => event.phase === 'ADVANCE_LEFT');
      assert.ok(advanceIndex >= 0, `${mode} Play visits left++`);
      pointer(events[advanceIndex]);
      copy(events[advanceIndex + 1]);
    } finally {
      await frame.evaluate(() => window.stopSingleLineCapture());
    }
  }
  await frame.getByLabel('Walkthrough detail').selectOption(originalMode);
  await frame.getByLabel('Playback speed', {exact: true}).selectOption(originalSpeed);
}
