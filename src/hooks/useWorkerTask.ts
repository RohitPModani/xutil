import { useCallback, useEffect, useRef, useState } from 'react';

export interface WorkerTask<Res> {
  /** Latest result, or null while nothing has run (or after `run(null)`). */
  result: Res | null;
  /** "Timed out" or a worker crash; empty otherwise. */
  error: string;
  busy: boolean;
}

/**
 * Runs jobs in a module Web Worker, one at a time. A new job while one is
 * still running kills the worker (the old answer would be stale, and a hung
 * job cannot be interrupted any other way); a job over `timeoutMs` is killed
 * and reported as timed out. `create` must be stable, so define it at module
 * scope: `() => new Worker(new URL('../../workers/x.worker.ts', import.meta.url), { type: 'module' })`.
 */
export function useWorkerTask<Req, Res>(create: () => Worker, timeoutMs = 2000) {
  const worker = useRef<Worker | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const busy = useRef(false);
  const [state, setState] = useState<WorkerTask<Res>>({ result: null, error: '', busy: false });

  const kill = () => {
    clearTimeout(timer.current);
    worker.current?.terminate();
    worker.current = null;
    busy.current = false;
  };

  const run = useCallback(
    (req: Req | null) => {
      clearTimeout(timer.current);
      if (req === null) {
        kill();
        setState({ result: null, error: '', busy: false });
        return;
      }
      if (busy.current) kill();
      const w = (worker.current ??= create());
      busy.current = true;
      setState((s) => ({ ...s, busy: true }));
      w.onmessage = (e: MessageEvent<Res>) => {
        clearTimeout(timer.current);
        busy.current = false;
        setState({ result: e.data, error: '', busy: false });
      };
      w.onerror = (e) => {
        kill();
        setState({ result: null, error: e.message || 'The worker failed.', busy: false });
      };
      w.postMessage(req);
      timer.current = window.setTimeout(() => {
        kill();
        setState({ result: null, error: `Timed out after ${timeoutMs / 1000} s.`, busy: false });
      }, timeoutMs);
    },
    [create, timeoutMs]
  );

  useEffect(() => kill, []);

  return { ...state, run };
}
