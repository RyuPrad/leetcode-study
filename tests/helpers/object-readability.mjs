// Expand crosses the iframe/React host boundary. Two child animation frames can
// precede the host resize and the ResizeObserver-driven value-height update.
// Poll the real viewport and the existing readability contract together; never
// accept a permanently undersized, clipped, or covered value region.
export function focusedObjectSnapshot({ body, viewport, minimumLines, diagnostic = false }) {
  const container = body.closest('.study-object-view');
  const region = body.getBoundingClientRect(), frame = container.getBoundingClientRect();
  let top = 0, bottom = innerHeight;
  for (let ancestor = body.parentElement; ancestor; ancestor = ancestor.parentElement) if (['auto', 'scroll', 'hidden', 'clip'].includes(getComputedStyle(ancestor).overflowY)) {
    const box = ancestor.getBoundingClientRect(); top = Math.max(top, box.top); bottom = Math.min(bottom, box.bottom);
  }
  const style = getComputedStyle(body);
  const focus = {
    height: body.clientHeight,
    visibleHeight: Math.min(region.bottom, bottom) - Math.max(region.top, top),
    padding: parseFloat(style.paddingTop) + parseFloat(style.paddingBottom),
    lineHeight: parseFloat(style.lineHeight),
    width: body.clientWidth,
    focusedWidth: frame.width,
    fullyVisible: region.top >= top - 1 && region.bottom <= bottom + 1,
    ownsViewport: [.1, .5, .9].every(portion => body.contains(document.elementFromPoint(region.left + region.width / 2, region.top + region.height * portion))),
    focused: container.dataset.objectFocused === 'true',
    viewport: { width: innerWidth, height: innerHeight },
  };
  const viewportReady = Math.abs(innerWidth - viewport.width) <= 1 && Math.abs(innerHeight - viewport.height) <= 1;
  const readable = focus.fullyVisible && focus.ownsViewport && focus.visibleHeight - focus.padding >= focus.lineHeight * minimumLines - 1;
  return diagnostic || (focus.focused && viewportReady && readable) ? focus : false;
}

export async function waitForReadableObject(host, body, viewport, minimumLines, timeout = 5000) {
  const element = await body.elementHandle();
  const args = { body: element, viewport, minimumLines };
  try {
    const result = await host.waitForFunction(focusedObjectSnapshot, args, { timeout });
    try { return await result.jsonValue(); } finally { await result.dispose(); }
  } catch (error) {
    const focus = await host.evaluate(focusedObjectSnapshot, { ...args, diagnostic: true });
    error.message += `; Expanded Object View must show ${minimumLines} complete lines in its real available viewport: ${JSON.stringify({ ...focus, expectedViewport: viewport })}`;
    throw error;
  } finally { await element?.dispose(); }
}
