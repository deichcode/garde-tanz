/* Kleine Navigation über die History-API: /, /tanz/:id, /einstellungen. */
import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from 'react';

const listeners = new Set<() => void>();
window.addEventListener('popstate', () => listeners.forEach((l) => l()));

export function navigate(path: string, replace = false) {
  if (path === location.pathname) return;
  if (replace) history.replaceState(null, '', path);
  else history.pushState(null, '', path);
  listeners.forEach((l) => l());
  window.scrollTo(0, 0);
}

export function usePath(): string {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => location.pathname,
  );
}

export type Route = { name: 'overview' } | { name: 'dance'; id: string } | { name: 'settings' } | { name: 'notFound' };

export function matchRoute(path: string): Route {
  if (path === '/' || path === '') return { name: 'overview' };
  if (path === '/einstellungen') return { name: 'settings' };
  const m = path.match(/^\/tanz\/([A-Za-z0-9_-]+)$/);
  if (m) return { name: 'dance', id: m[1] };
  return { name: 'notFound' };
}

export function Link({ to, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to);
  };
  return <a href={to} onClick={go} {...rest} />;
}
