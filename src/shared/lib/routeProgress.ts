// Ref-counted so overlapping navigations (a click-triggered push racing a
// useTransitionRouter call from the same interaction) can't end the bar
// early — it only goes idle once every in-flight navigation has finished.
let activeCount = 0;
const listeners = new Set<() => void>();

const notify = () => {
  for (const listener of listeners) listener();
};

export const startRouteProgress = () => {
  activeCount += 1;
  if (activeCount === 1) notify();
};

export const endRouteProgress = () => {
  activeCount = Math.max(0, activeCount - 1);
  if (activeCount === 0) notify();
};

export const resetRouteProgress = () => {
  if (activeCount === 0) return;
  activeCount = 0;
  notify();
};

export const subscribeRouteProgress = (callback: () => void) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

export const getRouteProgressSnapshot = () => activeCount > 0;

export const getRouteProgressServerSnapshot = () => false;
