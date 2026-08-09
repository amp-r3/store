/**
 * Radix's DismissableLayer fires `onPointerDownOutside`/`onFocusOutside` on
 * every overlay (Dialog/Drawer) for a pointerdown anywhere outside its own
 * content — including on a toast, which renders outside `#modal-root`. Pass
 * this to an overlay's `onPointerDownOutside` so clicking a toast (e.g. its
 * `Undo` action) doesn't also close the drawer/modal underneath it. Radix
 * dispatches the event with the real DOM target, so `closest()` works.
 * Structurally typed to avoid pulling radix-ui's types into `shared/lib`
 * while still accepting Radix's `CustomEvent<{ originalEvent: PointerEvent }>`.
 */
export const ignoreToastInteraction = (
    event: { target: EventTarget | null; preventDefault(): void }
) => {
    if (event.target instanceof Element && event.target.closest('[data-sonner-toaster]')) {
        event.preventDefault();
    }
};
