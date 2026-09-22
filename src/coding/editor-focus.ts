import {useEffect, useLayoutEffect, useRef, useState} from 'react';

export interface EditorFocusRequest {
  signal: AbortSignal;
  cancel: () => void;
}

// Start listening at the user's action, before either lazy editor component loads.
// A later interaction supersedes this request, even if it happens before mount.
function createFocusRequest(): EditorFocusRequest {
  const controller = new AbortController();
  const {signal} = controller;
  const cancel = () => controller.abort();
  const origin = document.activeElement;
  document.addEventListener('focusin', event => {
    if (event.target !== origin && event.target !== document.body) cancel();
  }, {capture: true, signal});
  document.addEventListener('pointerdown', cancel, {capture: true, signal});
  document.addEventListener('keydown', cancel, {capture: true, signal});
  window.addEventListener('blur', cancel, {signal});
  return {signal, cancel};
}

export function useEditorFocusRequest(active: boolean) {
  const [request, setRequest] = useState<EditorFocusRequest | null>(null);
  const pending = useRef<EditorFocusRequest | null>(null);
  useLayoutEffect(() => { if (!active) pending.current?.cancel(); }, [active]);
  useEffect(() => () => pending.current?.cancel(), []);
  function requestFocus() {
    pending.current?.cancel();
    const next = createFocusRequest();
    pending.current = next;
    setRequest(next);
  }
  return [request, requestFocus] as const;
}
