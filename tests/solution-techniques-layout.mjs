import assert from 'node:assert/strict';

// Run through the existing native Electron window/zoom matrix, with networking offline.
export async function auditSolutionTechniques({ page, library, open, tab, reachable, shellFits, settle }) {
  const { catalog } = await page.evaluate(() => window.study.bootstrap());
  const problems = catalog.entries.filter(entry => entry.number);
  await library();
  const libraryLabels = await page.locator('.technique-labels').evaluateAll(lists => lists.map(list => [...list.children].map(child => child.textContent)));
  assert.deepEqual(libraryLabels, problems.map(entry => entry.solutionTechniques.map(method => method.name)), 'Every library problem exposes all its compact method labels');

  const allMethods = problems.flatMap(entry => entry.solutionTechniques);
  const algorithm = allMethods.find(method => method.kind === 'algorithm');
  const supporting = allMethods.find(method => method.kind === 'technique');
  assert.ok(algorithm && supporting, 'The catalog contains specific algorithms and supporting techniques');
  const search = page.getByRole('searchbox', { name: 'Search problems' });
  for (const query of [algorithm.name.toUpperCase(), supporting.name, supporting.role]) {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const expected = problems.filter(entry => terms.every(term => entry.searchText.includes(term))).map(entry => entry.title);
    assert.ok(expected.length > 0);
    await search.fill(query);
    await page.waitForFunction(expected => JSON.stringify([...document.querySelectorAll('.problem-link > span:first-child')].map(node => node.textContent)) === JSON.stringify(expected), expected);
    await shellFits();
  }

  // The most populated method list exercises scrolling and the final entry at every zoom.
  const entry = [...problems].sort((a, b) => b.solutionTechniques.length - a.solutionTechniques.length)[0];
  await open(entry.number);
  const disclosure = page.locator('.solution-techniques');
  const summary = disclosure.locator('summary');
  const details = page.getByRole('region', { name: 'Solution algorithms and techniques', exact: true });
  assert.equal(await disclosure.getAttribute('open'), null, 'New problem starts compact');
  await reachable(summary, 'Algorithms and techniques disclosure');
  await summary.focus(); await page.keyboard.press('Space');
  await page.locator('.solution-techniques[open]').waitFor();
  assert.deepEqual(await disclosure.locator('dt > span:first-child').allTextContents(), entry.solutionTechniques.map(method => method.name));
  assert.deepEqual(await disclosure.locator('dd').allTextContents(), entry.solutionTechniques.map(method => method.role));
  const before = await page.evaluate(() => window.study.bootstrap());
  for (const name of ['Learn', 'Visualizer', 'Code', 'Notes', /^History/]) {
    await tab(name);
    if (name === 'Learn') await page.locator('.guided-container:not([hidden]) iframe').waitFor();
    if (name === 'Code') await page.getByRole('textbox', { name: 'JavaScript solution', exact: true }).waitFor();
    await page.waitForFunction(() => !document.querySelector('.solution-techniques').open);
    await reachable(summary, 'Disclosure stays available across tabs');
    await summary.focus(); await page.keyboard.press('Space');
    await page.locator('.solution-techniques[open]').waitFor();
    await details.waitFor({ state: 'visible' });
    await reachable(disclosure.locator('dd').last(), 'Last solution role');
    await reachable(disclosure.locator('dt').first(), 'First algorithm name');
    await shellFits();
    const overflow = await details.evaluate(element => ({ excess: element.scrollWidth - element.clientWidth, height: element.clientHeight, viewport: innerHeight }));
    assert.ok(overflow.excess <= 1 && overflow.height > 0 && overflow.height <= overflow.viewport * .45 + 1, `Technique list remains bounded: ${JSON.stringify(overflow)}`);
    if (name === 'Code') {
      await page.getByRole('textbox', { name: 'JavaScript solution', exact: true }).waitFor();
      const expanded = await page.locator('.code-editor').boundingBox();
      await summary.focus(); await page.keyboard.press('Enter');
      await page.waitForFunction(() => !document.querySelector('.solution-techniques').open);
      await settle(page);
      const collapsed = await page.locator('.code-editor').boundingBox();
      assert.equal(expanded.height, collapsed.height, 'Opening method details does not reduce editor space');
      assert.ok(collapsed.height >= 85, `Editor remains readable with method disclosure: ${collapsed.height}`);
      await summary.focus(); await page.keyboard.press('Enter');
      await page.locator('.solution-techniques[open]').waitFor();
    }
  }
  await summary.focus(); await page.keyboard.press('Space');
  await page.waitForFunction(() => !document.querySelector('.solution-techniques').open);
  await summary.focus(); await page.keyboard.press('Enter');
  await page.locator('.solution-techniques[open]').waitFor();
  await details.focus(); await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('.solution-techniques').open);
  assert.equal(await summary.evaluate(element => document.activeElement === element), true, 'Escape closes the list and returns keyboard focus');
  await summary.focus(); await page.keyboard.press('Enter');
  await page.locator('.solution-techniques[open]').waitFor();
  await page.locator('.problem-heading h1').click();
  await page.waitForFunction(() => !document.querySelector('.solution-techniques').open);
  const after = await page.evaluate(() => window.study.bootstrap());
  assert.deepEqual(after.data.progress, before.data.progress, 'Reading methods preserves saved progress');
  assert.deepEqual(after.data.submissions, before.data.submissions, 'Reading methods preserves submissions');
  await summary.focus(); await page.keyboard.press('Enter');
  await page.locator('.solution-techniques[open]').waitFor();
  await library();
  await open(entry.number === 1 ? 2 : 1);
  assert.equal(await disclosure.getAttribute('open'), null, 'Opening another problem resets the disclosure');
}
