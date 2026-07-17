export function scrollToElement(target: HTMLElement | string | null) {
    const element = typeof target === 'string' ? document.getElementById(target) : target;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    element.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
    });
}
