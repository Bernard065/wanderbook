import { useEffect, useState } from 'react';

type ToastIntent = 'info' | 'error' | 'success';
type Toast = {
  id: string;
  message: string;
  intent?: ToastIntent;
  visible?: boolean;
};

const AUTO_DISMISS = 4000;
const ANIM_MS = 260;

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        { message: string; intent?: ToastIntent } | undefined;
      if (!detail) return;
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const t: Toast = {
        id,
        message: detail.message,
        intent: detail.intent ?? 'info',
        visible: false,
      };
      setToasts((s) => [...s, t]);
      // trigger enter animation on next frame
      requestAnimationFrame(() => {
        setToasts((cur) =>
          cur.map((x) => (x.id === id ? { ...x, visible: true } : x)),
        );
      });
    };

    window.addEventListener('wanderbook:toast', handler as EventListener);
    return () =>
      window.removeEventListener('wanderbook:toast', handler as EventListener);
  }, []);

  useEffect(() => {
    const timers: number[] = [];
    toasts.forEach((t) => {
      if (!t.visible) return;
      const timer = window.setTimeout(() => {
        setToasts((cur) =>
          cur.map((x) => (x.id === t.id ? { ...x, visible: false } : x)),
        );
        const rm = window.setTimeout(() => {
          setToasts((cur) => cur.filter((x) => x.id !== t.id));
        }, ANIM_MS + 40);
        timers.push(rm);
      }, AUTO_DISMISS);
      timers.push(timer);
    });
    return () => timers.forEach((id) => clearTimeout(id));
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 bottom-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => {
        const base =
          'max-w-xs rounded-md px-4 py-2 text-sm shadow-md transform transition-all duration-200';
        const intentClasses =
          t.intent === 'error'
            ? 'border border-rose-300 bg-rose-50 text-rose-700'
            : t.intent === 'success'
              ? 'border border-emerald-300 bg-emerald-50 text-emerald-700'
              : 'border border bg-card text-slate-800';

        const visibleClasses = t.visible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-2 scale-[0.98]';

        return (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className={`${base} ${intentClasses} ${visibleClasses}`}
            style={{ transitionProperty: 'transform, opacity' }}
          >
            {t.message}
          </div>
        );
      })}
    </div>
  );
}

export default ToastContainer;
