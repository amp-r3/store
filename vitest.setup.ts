import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// No `test.globals` (see vitest.config.ts / AGENTS.md's "Unit Tests" section
// — every test file imports its own utilities), so RTL's framework-detected
// auto-cleanup never registers. Do it explicitly instead.
afterEach(() => {
  cleanup();
});

// jsdom does not implement matchMedia. Components using useMediaQuery
// (CategoryControl, SortControl, ReviewsSort, OrderDetails, ...) need this
// or they throw on render. Defaults to "no match" (desktop-first, non-mobile)
// — override matches/addEventListener in an individual test when a component
// under test must observe the mobile breakpoint.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// jsdom does not implement ResizeObserver (shared/ui Pagination's
// useElementWidth) or IntersectionObserver (OrdersListScroll's infinite
// scroll trigger). A width/size of 0 from these stubs is what makes
// Pagination render its compact "current / total" view under RTL instead of
// numbered page buttons — expected, not a bug in the stub.
class ResizeObserverStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('ResizeObserver', ResizeObserverStub);

class IntersectionObserverStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
  root = null;
  rootMargin = '';
  thresholds: number[] = [];
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);

// jsdom throws "Not implemented" for both. useProductMediaDraft revokes
// object URLs on unmount/replace; ProductReviews scrolls a card into view
// after "Load more".
window.HTMLElement.prototype.scrollIntoView = vi.fn();
// jsdom throws "not implemented" for the Pointer Events capture methods.
// vaul (CartDrawer) and Radix's drag-based primitives call these on any
// pointerdown inside their content, not just on a dedicated drag handle.
if (!window.HTMLElement.prototype.hasPointerCapture) {
  window.HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
}
if (!window.HTMLElement.prototype.setPointerCapture) {
  window.HTMLElement.prototype.setPointerCapture = vi.fn();
}
if (!window.HTMLElement.prototype.releasePointerCapture) {
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
}
if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
}
if (!window.URL.revokeObjectURL) {
  window.URL.revokeObjectURL = vi.fn();
}

// Radix Portal (CartDrawer, modals, dropdowns) falls back to document.body
// when getModalRoot()'s `#modal-root` lookup returns null — no fixture
// needed for portal-based components under RTL.

// revalidate.ts ('use server') calls next/cache's revalidatePath and
// authz.ts's getServerSession, which imports the 'server-only' package — a
// build-time Next.js convention with no real npm package, so a plain
// Vite/jsdom run can't resolve it. Real builds strip 'use server' function
// bodies into an RPC stub; Vitest has no equivalent transform, so mock the
// module outright. orderApi/reviewApi/adminProductsApi/adminReviewsApi all
// import this to revalidate after a mutation, and @/app/store.ts
// side-effect-imports order and review purely to register their RTK Query
// endpoints — so this mock is required for any test/renderWithProviders.tsx
// render, not just ones that exercise a revalidating mutation.
vi.mock('@/shared/api/revalidate', () => ({
  revalidateProduct: vi.fn(),
  revalidateProducts: vi.fn(),
  revalidateStorefront: vi.fn(),
}));
