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
}

let anonymousToastId = 0;

export const showToast = (variant: ToastVariant, text: string, options?: ToastOptions) => {
    const id = options?.key ?? `toast-${++anonymousToastId}`;

    sonnerToast.custom(
        () => (
            <ToastCard
                variant={variant}
                text={text}
                description={options?.description}
                action={options?.action}
                icon={options?.icon}
                onDismiss={() => sonnerToast.dismiss(id)}
            />
        ),
        { id, duration: options?.durationMs ?? TOAST_DURATION_MS }
    );
};

export const dismissToasts = () => sonnerToast.dismiss();
