import { ReactNode } from 'react';
import { toast as sonnerToast } from 'sonner';
import { ToastCard } from './ToastCard';

export type ToastVariant = 'added' | 'removed' | 'info' | 'success' | 'warning' | 'error';

export const TOAST_DURATION_MS = 4000;

export interface ToastAction {
    label: string;
    /** next/link when set; otherwise a plain button. Omit both for a dismiss-only action. */
    to?: string;
    onClick?: () => void;
    emphasis?: 'primary' | 'ghost';
}

interface ToastOptions {
    /** Maps to sonner's toast `id` — repeat calls with the same key update
     *  the existing toast in place instead of stacking a new one. */
    key?: string;
    action?: ToastAction;
    icon?: ReactNode;
    description?: string;
    durationMs?: number;
    /** Renders a shrinking bar counting down to auto-dismiss — use on toasts
     *  with a time-limited action (e.g. Undo) so the window to act on it is
     *  visible, not just felt. */
    showTimer?: boolean;
}

let anonymousToastId = 0;
// Forces ToastCard (and its timer bar) to remount on every call, even ones
// reusing an existing `key` — sonner re-renders the same DOM node in place
// for those, which would otherwise leave a still-running CSS timer animation
// where it was instead of restarting it for the new occurrence.
let toastCallId = 0;

export const showToast = (variant: ToastVariant, text: string, options?: ToastOptions) => {
    const id = options?.key ?? `toast-${++anonymousToastId}`;
    const durationMs = options?.durationMs ?? TOAST_DURATION_MS;

    sonnerToast.custom(
        () => (
            <ToastCard
                key={++toastCallId}
                variant={variant}
                text={text}
                description={options?.description}
                action={options?.action}
                icon={options?.icon}
                durationMs={durationMs}
                showTimer={options?.showTimer}
                onDismiss={() => sonnerToast.dismiss(id)}
            />
        ),
        { id, duration: durationMs }
    );
};

export const dismissToasts = () => sonnerToast.dismiss();
