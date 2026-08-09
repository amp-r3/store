'use client';

import { Toaster as SonnerToaster } from 'sonner';
import { IoCheckmarkCircle, IoAlertCircle, IoWarning, IoInformationCircle } from 'react-icons/io5';
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
            // Clears the top bar (`--topbar-offset`, set by TopBar when a
            // notification is showing) instead of a fixed offset, since the
            // bar can be present or absent at any time.
            offset={isMobile ? { top: 'calc(var(--topbar-offset) + 0.75rem)' } : undefined}
            theme="dark"
            richColors
            closeButton
            visibleToasts={3}
            gap={8}
            duration={TOAST_DURATION_MS}
            className={style.toaster}
            toastOptions={{ classNames: { toast: style.toast } }}
            icons={{
                success: <IoCheckmarkCircle aria-hidden="true" />,
                error: <IoAlertCircle aria-hidden="true" />,
                warning: <IoWarning aria-hidden="true" />,
                info: <IoInformationCircle aria-hidden="true" />,
            }}
        />
    );
};
