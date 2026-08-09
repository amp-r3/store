'use client';

import { Toaster as SonnerToaster } from 'sonner';
import { useMediaQuery } from '@/shared/lib/hooks';
import { TOAST_DURATION_MS } from './showToast';
import style from './toast.module.scss';

// Same breakpoint MainLayout uses to switch to the MobileBar dock — toasts
// move to top-center there so they never collide with it.
const MOBILE_QUERY = '(max-width: 525px)';

export const Toaster = () => {
    const isMobile = useMediaQuery(MOBILE_QUERY);

    return (
        <SonnerToaster
            position={isMobile ? 'top-center' : 'bottom-right'}
            // Sonner's own mobile stylesheet (<= 600px) reads --mobile-offset-*,
            // not --offset-* — the `offset` prop below is desktop-only; the
            // top-bar clearance on mobile has to go through `mobileOffset`.
            offset="1.5rem"
            mobileOffset={{ top: 'calc(var(--topbar-offset) + 0.75rem)', left: '0.75rem', right: '0.75rem' }}
            swipeDirections={isMobile ? ['top', 'left', 'right'] : ['right', 'bottom']}
            theme="dark"
            visibleToasts={3}
            gap={8}
            duration={TOAST_DURATION_MS}
            className={style.toaster}
            toastOptions={{ classNames: { toast: style['toast-li'] } }}
        />
    );
};
