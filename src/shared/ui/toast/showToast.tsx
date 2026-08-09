import Link from 'next/link';
import { toast as sonnerToast } from 'sonner';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export const TOAST_DURATION_MS = 4000;

export interface ToastAction {
    label: string;
    to: string;
}

interface ToastOptions {
    /** Maps to sonner's toast `id` — repeat calls with the same key update
     *  the existing toast in place instead of stacking a new one. */
    key?: string;
    action?: ToastAction;
    durationMs?: number;
}

let anonymousToastId = 0;

export const showToast = (type: ToastType, text: string, options?: ToastOptions) => {
    const id = options?.key ?? `toast-${++anonymousToastId}`;

    sonnerToast[type](text, {
        id,
        duration: options?.durationMs ?? TOAST_DURATION_MS,
        action: options?.action
            ? (
                <Link href={options.action.to} onClick={() => sonnerToast.dismiss(id)}>
                    {options.action.label}
                </Link>
            )
            : undefined,
    });
};

export const dismissToasts = () => sonnerToast.dismiss();
