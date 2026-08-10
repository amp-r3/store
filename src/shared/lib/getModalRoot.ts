/** `#modal-root` is a static element from `index.html`, always present before
 * the app script runs — but reading it must happen lazily (inside a
 * component, not at module scope) so importing the module never touches
 * `document` outside a browser render. */
export function getModalRoot(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  return document.getElementById('modal-root');
}
