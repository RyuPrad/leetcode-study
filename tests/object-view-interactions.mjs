import assert from 'node:assert/strict';

export const expectedColumns = width => width >= 1200 ? 3 : width >= 800 ? 2 : 1;
export const cardFor = (container, name, frameId) => container.locator(`.study-object-card:is([data-variable-id=${JSON.stringify(name)}],[data-variable-id$=${JSON.stringify(':'+name)}])${frameId === undefined ? '' : `[data-frame-id=${JSON.stringify(String(frameId))}]`}`);
export async function settle(host) { await host.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))); }
export async function presentation(host) {
  return host.evaluate(() => ({
    index: window.studyLessonSource?.index() ?? Number(document.querySelector('#debug-objects-panel [data-object-view-index]')?.dataset.objectViewIndex),
    state: window.studyLessonAdapter ? JSON.stringify(window.studyLessonAdapter.objectSnapshot()) : undefined,
  }));
}
export async function assertPresentation(host, before, message) { assert.deepEqual(await presentation(host), before, message); }

export async function checkTextSize(host, container) {
  const smaller = container.getByRole('button', { name: 'Decrease Object View text size', exact: true });
  const larger = container.getByRole('button', { name: 'Increase Object View text size', exact: true });
  const font = () => container.locator('.study-object-body').first().evaluate(body => getComputedStyle(body).fontSize);
  const before = await presentation(host);
  assert.equal(await font(), '16px', 'A fresh Object View starts at readable 16 px.');
  await smaller.click(); assert.equal(await font(), '14px'); assert.ok(await smaller.isDisabled());
  for (const size of [16, 18, 20, 22, 24]) { await larger.click(); assert.equal(await font(), `${size}px`); }
  assert.ok(await larger.isDisabled(), 'The text control stops at 24 px.');
  for (const size of [22, 20, 18, 16]) { await smaller.click(); assert.equal(await font(), `${size}px`); }
  assert.equal(await container.getByLabel('Object View text size', { exact: true }).evaluate(output => output.value || output.textContent), '16px');
  await assertPresentation(host, before, 'Changing text size only changes presentation.');
}

export async function checkCardGeometry(container) {
  const evidence = await container.evaluate(container => {
    const grid = container.querySelector('.study-object-card-grid');
    const cards = [...container.querySelectorAll('.study-object-card')].map(card => {
      const badge = card.querySelector('.study-object-variable'), body = card.querySelector('.study-object-body');
      const a = badge.getBoundingClientRect(), b = body.getBoundingClientRect(), style = getComputedStyle(body);
      return { name: card.dataset.variableId, height: card.getBoundingClientRect().height, badgeAbove: a.bottom <= b.top + 1, fontSize: style.fontSize, fontFamily: style.fontFamily, vertical: style.overflowY, horizontal: style.overflowX, tabIndex: body.tabIndex };
    });
    return { width: container.getBoundingClientRect().width, columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length, cards };
  });
  assert.equal(evidence.columns, expectedColumns(evidence.width));
  for (const card of evidence.cards) {
    assert.ok(card.badgeAbove, `${card.name}: the badge remains above the scroll region.`);
    assert.equal(card.fontSize, '16px'); assert.match(card.fontFamily, /Consolas/);
    assert.ok(['auto', 'scroll'].includes(card.vertical), `${card.name}: values scroll vertically inside their own card.`);
    assert.ok(['auto', 'scroll'].includes(card.horizontal), `${card.name}: long lines can scroll inside their own card.`);
    assert.equal(card.tabIndex, 0, `${card.name}: keyboard users can focus the value region.`);
  }
  return evidence;
}

export async function checkIndependentScroll(page, host, container, name, lastSelector, { frameId, neighborName, horizontal = false } = {}) {
  const card = cardFor(container, name, frameId), body = card.locator('.study-object-body');
  assert.ok(neighborName, 'Choose a real neighboring value to verify independent scrolling.');
  const neighbor = cardFor(container, neighborName, frameId).locator('.study-object-body');
  await body.evaluate(body => { body.scrollTop = 0; body.scrollLeft = 0; });
  await neighbor.evaluate(body => { body.scrollTop = 0; body.scrollLeft = 0; });
  const positionBody = async () => {
    await body.evaluate(body => body.scrollIntoView({ block: 'center', inline: 'nearest' })); await settle(host);
    await body.evaluate(body => {
      const bounds=body.getBoundingClientRect();let top=0,bottom=innerHeight,scroller;
      for(let ancestor=body.parentElement;ancestor;ancestor=ancestor.parentElement){
        const style=getComputedStyle(ancestor),region=ancestor.getBoundingClientRect();
        if(['auto','scroll','hidden','clip'].includes(style.overflowY)){top=Math.max(top,region.top);bottom=Math.min(bottom,region.bottom);}
        if(!scroller&&['auto','scroll'].includes(style.overflowY)&&ancestor.scrollHeight>ancestor.clientHeight)scroller=ancestor;
      }
      const root=body.closest('.viz-frame,.study-workspace')||body.closest('.study-object-view');
      for(const chrome of root.querySelectorAll('.study-object-view-tabs,.study-object-toolbar,.study-controls')){
        const style=getComputedStyle(chrome),region=chrome.getBoundingClientRect();
        if(['sticky','fixed'].includes(style.position)&&region.right>bounds.left&&region.left<bounds.right&&region.bottom>top&&region.top<bottom)top=Math.max(top,region.bottom);
      }
      const desired=top+Math.max(0,(bottom-top-bounds.height)/2),delta=bounds.top-desired;
      if(scroller)scroller.scrollTop+=delta;else window.scrollBy({top:delta,behavior:'instant'});
    });await settle(host);
  };
  await positionBody();
  const before = await presentation(host);
  const baseline = await body.evaluate(body => ({ height: body.clientHeight, scrollHeight: body.scrollHeight, width: body.clientWidth, scrollWidth: body.scrollWidth, badgeTop: body.closest('.study-object-card').querySelector('.study-object-variable').getBoundingClientRect().top }));
  assert.ok(baseline.scrollHeight > baseline.height + 10, `${name}: this case must exercise a long value.`);
  const last = card.locator(lastSelector).last();
  const finalVisible = () => last.evaluate(entry => {
    const body = entry.closest('.study-object-body'), scalar = entry.matches('.study-object-scalar') ? entry : entry.querySelector('.study-object-scalar') || entry, value = scalar.getBoundingClientRect(), region = body.getBoundingClientRect();
    const left = Math.max(0, value.left, region.left), right = Math.min(innerWidth, value.right, region.right);
    const top = Math.max(0, value.top, region.top), bottom = Math.min(innerHeight, value.bottom, region.bottom);
    return right > left && value.top >= Math.max(0, region.top) && value.bottom <= Math.min(innerHeight, region.bottom) && body.contains(document.elementFromPoint((left + right) / 2, (top + bottom) / 2));
  });
  const assertFinalVisible = async input => {
    if (await finalVisible()) return;
    const metrics = await last.evaluate(entry => {
      const body = entry.closest('.study-object-body'), scalar = entry.matches('.study-object-scalar') ? entry : entry.querySelector('.study-object-scalar') || entry;
      const rect = element => { const bounds = element.getBoundingClientRect(); return { top: bounds.top, bottom: bounds.bottom, left: bounds.left, right: bounds.right, height: bounds.height }; };
      const clips = [];
      for (let ancestor = body.parentElement; ancestor; ancestor = ancestor.parentElement) if (['auto','scroll','hidden','clip'].includes(getComputedStyle(ancestor).overflowY)) clips.push({ selector: ancestor.className, ...rect(ancestor) });
      return { viewportHeight: innerHeight, body: rect(body), finalScalar: rect(scalar), clips, scrollTop: body.scrollTop, clientHeight: body.clientHeight, scrollHeight: body.scrollHeight };
    });
    assert.fail(`${name}: the final entry must be fully visible and own pixels after ${input} scrolling: ${JSON.stringify(metrics)}`);
  };
  const wheel = async delta => {
    await body.evaluate(body=>{body.__studyObjectWheelEnd=false;body.__studyObjectWheelListener=()=>{body.__studyObjectWheelEnd=true;};body.addEventListener('scrollend',body.__studyObjectWheelListener,{once:true});});
    await body.hover();await page.mouse.wheel(0,delta);
    await host.waitForFunction(body=>body.__studyObjectWheelEnd,await body.elementHandle(),{timeout:3000});
    await body.evaluate(body=>{body.removeEventListener('scrollend',body.__studyObjectWheelListener);delete body.__studyObjectWheelListener;delete body.__studyObjectWheelEnd;});
  };
  await wheel(12000);
  await host.waitForFunction(body => body.scrollTop > 0, await body.elementHandle(), { timeout: 3000 });
  assert.ok(await body.evaluate(body => body.scrollTop > 0), `${name}: wheel input scrolls its value region.`);
  await host.waitForFunction(body => body.scrollTop + body.clientHeight >= body.scrollHeight - 2, await body.elementHandle(), { timeout: 3000 });
  // A deep linked value can have trailing closing braces. Reach its final scalar
  // with small reverse wheel movements as well as with the keyboard below.
  const wheelStep=await body.evaluate(body=>Math.max(4,Math.min(64,body.clientHeight/4)));
  for (let move = 0; move < 64 && !await finalVisible(); move++) { await wheel(-wheelStep); }
  await assertFinalVisible('wheel');
  assert.deepEqual(await neighbor.evaluate(body => [body.scrollTop, body.scrollLeft]), [0, 0], 'Scrolling one value leaves its neighbor stationary.');
  assert.equal(await card.locator('.study-object-variable').evaluate(badge => badge.getBoundingClientRect().top), baseline.badgeTop, 'Value scrolling keeps the name visible above the body.');
  await card.locator('.study-object-variable').click();
  await positionBody();
  const readingPoint = await body.evaluate(body => {
    const bounds = body.getBoundingClientRect(); let top = Math.max(0,bounds.top), bottom = Math.min(innerHeight,bounds.bottom);
    for (let ancestor = body.parentElement; ancestor; ancestor = ancestor.parentElement) if (['auto','scroll','hidden','clip'].includes(getComputedStyle(ancestor).overflowY)) { const region = ancestor.getBoundingClientRect(); top = Math.max(top,region.top); bottom = Math.min(bottom,region.bottom); }
    for (const portion of [.5,.8,.2]) for (const horizontal of [.9,.7,.5]) {
      const x = bounds.left + body.clientWidth * horizontal, y = top + (bottom-top) * portion, hit = document.elementFromPoint(x,y);
      if (bottom>top && body.contains(hit) && !hit.closest('button,a,input,textarea,select,[contenteditable="true"]')) return { x:x-bounds.left, y:y-bounds.top };
    }
    return null;
  });
  assert.ok(readingPoint, 'A visible noninteractive value area accepts the actual reading click.');
  await body.click({ position: readingPoint });
  await body.evaluate(body => {
    body.__studyObjectKeyDispose?.();
    body.__studyObjectKeyTrace = [];
    body.__studyObjectScrollCommand = null;
    body.__studyObjectScrollComplete = null;
    const record = event => {
      const entry = { type:event.type,key:event.key,code:event.code,defaultPrevented:event.defaultPrevented,trusted:event.isTrusted,time:performance.now(),top:body.scrollTop,focused:document.activeElement===body };
      body.__studyObjectKeyTrace.push(entry); if (body.__studyObjectKeyTrace.length>40) body.__studyObjectKeyTrace.shift();
      if (event.type==='keydown' && ['Home','End','PageUp'].includes(event.key)) { body.__studyObjectScrollCommand=event.key; body.__studyObjectScrollComplete=null; }
      if (event.type==='scrollend') body.__studyObjectScrollComplete=body.__studyObjectScrollCommand;
      if (event.type==='keydown') queueMicrotask(()=>{entry.defaultPrevented=event.defaultPrevented;});
    };
    const events = ['keydown','keyup','scroll','scrollend'];
    for (const event of events) body.addEventListener(event,record);
    body.__studyObjectKeyDispose=()=>{for(const event of events)body.removeEventListener(event,record);};
  });
  const homeNeedsScroll = await body.evaluate(body => body.scrollTop > 1);
  await body.press('Home');
  // Chromium reaches the final coordinate just before its smooth-scroll ends.
  // Sending End during that final frame can be ignored by the native widget.
  await host.waitForFunction(({body,needsScroll}) => body.scrollTop <= 1 && (!needsScroll || body.__studyObjectScrollComplete==='Home'), { body:await body.elementHandle(),needsScroll:homeNeedsScroll }, { timeout: 3000 });
  const endNeedsScroll = await body.evaluate(body => body.scrollTop + body.clientHeight < body.scrollHeight - 2);
  await body.press('End');
  const keyboardBody = await body.elementHandle();
  try { await host.waitForFunction(({body,needsScroll}) => body.scrollTop + body.clientHeight >= body.scrollHeight - 2 && (!needsScroll || body.__studyObjectScrollComplete==='End'), { body:keyboardBody,needsScroll:endNeedsScroll }, { timeout: 3000 }); }
  catch (error) {
    const metrics = await body.evaluate(body => ({ top: body.scrollTop, clientHeight: body.clientHeight, scrollHeight: body.scrollHeight, focused: document.activeElement === body, documentFocused: document.hasFocus(), index: window.studyLessonSource?.index(), events:body.__studyObjectKeyTrace }));
    metrics.originalConnected = await keyboardBody.evaluate(body => body.isConnected);
    error.message += `; Object body keyboard metrics: ${JSON.stringify(metrics)}`;
    throw error;
  }
  assert.ok(await body.evaluate(body => body.scrollTop + body.clientHeight >= body.scrollHeight - 2), 'Keyboard End reaches the final value entries.');
  // Deep lists can have closing braces after the final field. Page Up reaches
  // that field using the same keyboard path as a person reading the value.
  for (let pageUp = 0; pageUp < 8 && !await last.evaluate(entry => {
    const value = (entry.matches('.study-object-scalar') ? entry : entry.querySelector('.study-object-scalar') || entry).getBoundingClientRect(), region = entry.closest('.study-object-body').getBoundingClientRect();
    return value.top >= Math.max(0, region.top) && value.bottom <= Math.min(innerHeight, region.bottom);
  }); pageUp++) { await body.press('PageUp'); await settle(host); }
  await assertFinalVisible('keyboard');
  if (horizontal) {
    assert.ok(baseline.scrollWidth > baseline.width + 10, 'The long line requires horizontal scrolling.');
    await body.hover(); await page.mouse.wheel(12000, 0); await settle(host);
    assert.ok(await body.evaluate(body => body.scrollLeft > 0), 'A horizontal wheel reaches long-line content.');
    assert.deepEqual(await neighbor.evaluate(body => [body.scrollTop, body.scrollLeft]), [0, 0]);
  }
  await assertPresentation(host, before, 'Scrolling, focusing, and clicking a variable badge do not execute the algorithm.');
  const keyboard = await body.evaluate(body => { const events = body.__studyObjectKeyTrace; body.__studyObjectKeyDispose?.(); delete body.__studyObjectKeyDispose; delete body.__studyObjectKeyTrace; delete body.__studyObjectScrollCommand; delete body.__studyObjectScrollComplete; return events; });
  return { name, ...baseline, finalScroll: await body.evaluate(body => ({ top: body.scrollTop, left: body.scrollLeft })), keyboard };
}

export async function checkFocusRestore(host, container, name, { frameId, collapsedName, verifyAncestors = true } = {}) {
  const card = cardFor(container, name, frameId), body = card.locator('.study-object-body');
  const before = await presentation(host);
  const opener = card.getByRole('button', { name: `Expand ${name}`, exact: true });
  const positionOpener = async () => {
    await opener.evaluate(button => button.scrollIntoView({ block: 'center', inline: 'nearest' })); await settle(host);
    assert.ok(await opener.evaluate(button => {
      const bounds = button.getBoundingClientRect();
      return button.contains(document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2));
    }), 'Position the real Expand control outside sticky chrome before recording its return position.');
  };
  await positionOpener();
  const ancestorPositions = () => container.evaluate(container => {
    const positions = [];
    for (let element = container; element; element = element.parentElement) positions.push({ name: `${element.tagName}#${element.id}.${element.className}`, top: element.scrollTop, left: element.scrollLeft });
    return positions;
  });
  const saved = await container.locator('.study-object-card').evaluateAll(cards => cards.map(card => ({ frameId: card.dataset.frameId, variableId: card.dataset.variableId, top: card.querySelector('.study-object-body').scrollTop, left: card.querySelector('.study-object-body').scrollLeft, toggles: [...card.querySelectorAll('.study-object-toggle')].map(toggle => toggle.getAttribute('aria-expanded')) })));
  const width = (await card.boundingBox()).width;
  for (const exit of ['back', 'escape']) {
    await positionOpener();
    const savedAncestors = await ancestorPositions();
    await card.getByRole('button', { name: `Expand ${name}`, exact: true }).click();
    await settle(host);
    assert.equal(await container.getAttribute('data-object-focused'), 'true');
    assert.equal(await container.locator('.study-object-card').count(), 1, 'Expanded view focuses one variable.');
    const focusedWidth = (await card.boundingBox()).width;
    assert.ok(focusedWidth >= width - 1, `${name}: expanded value width ${focusedWidth} uses at least the card width ${width}.`);
    const contextVisible = await container.locator('.study-object-focus-context').isVisible();
    const instruction = host.locator('.study-instruction-disclosure summary');
    assert.ok(contextVisible || await instruction.isVisible(), 'Expanded view retains visible instruction/call context or its compact instruction disclosure.');
    if (!contextVisible) assert.ok((await instruction.innerText()).trim().length > 4, 'The compact summary names the actual current instruction.');
    await body.focus(); await body.press('Home');
    if (exit === 'back') await container.locator('.study-object-back').click();
    else await body.press('Escape');
    await settle(host);
    assert.notEqual(await container.getAttribute('data-object-focused'), 'true');
    // Electron restores the iframe viewport asynchronously after leaving the
    // full-window reader. Wait for the saved reading positions, not a fixed
    // number of frames in the old fullscreen geometry.
    await host.waitForFunction(({element,saved})=>saved.every(position=>{
      const card=[...element.querySelectorAll('.study-object-card')].find(card=>card.dataset.frameId===position.frameId&&card.dataset.variableId===position.variableId);
      const body=card?.querySelector('.study-object-body');return body&&Math.abs(body.scrollTop-position.top)<1&&Math.abs(body.scrollLeft-position.left)<1;
    }),{element:await container.elementHandle(),saved},{timeout:1500});
    const restored = await container.locator('.study-object-card').evaluateAll(cards => cards.map(card => ({ frameId: card.dataset.frameId, variableId: card.dataset.variableId, top: card.querySelector('.study-object-body').scrollTop, left: card.querySelector('.study-object-body').scrollLeft, toggles: [...card.querySelectorAll('.study-object-toggle')].map(toggle => toggle.getAttribute('aria-expanded')) })));
    assert.deepEqual(restored, saved, `${exit}: returning restores independent body positions and nested expansion.`);
    if (verifyAncestors) {
      const restoredAncestors = await ancestorPositions();
      assert.deepEqual(restoredAncestors.map(position => position.name), savedAncestors.map(position => position.name));
      for (let index = 0; index < savedAncestors.length; index++) assert.ok(Math.abs(restoredAncestors[index].top - savedAncestors[index].top) <= 1 && Math.abs(restoredAncestors[index].left - savedAncestors[index].left) <= 1, `${exit}: ancestor ${savedAncestors[index].name} restores its position: ${JSON.stringify({ before: savedAncestors[index], after: restoredAncestors[index] })}`);
    }
    assert.ok(await card.getByRole('button', { name: `Expand ${name}`, exact: true }).evaluate(button => button === document.activeElement), 'Returning restores focus to the Expand opener.');
    if (collapsedName) assert.equal(await cardFor(container, collapsedName, frameId).locator('.study-object-toggle').first().getAttribute('aria-expanded'), 'false');
    await assertPresentation(host, before, `${exit}: inspecting a large value does not execute or seek.`);
  }
}
