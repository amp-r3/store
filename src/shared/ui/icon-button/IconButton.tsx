import { ButtonHTMLAttributes, forwardRef } from 'react';
import style from './icon-button.module.scss';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    'aria-label': string;
    variant?: 'default' | 'danger';
    isActive?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ variant = 'default', isActive, className, ...props }, ref) => (
        <button
            ref={ref}
            type="button"
            className={[
                style['icon-button'],
                variant === 'danger' ? style['icon-button--danger'] : '',
                isActive ? style['icon-button--active'] : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            {...props}
        />
    )
);

IconButton.displayName = 'IconButton';
