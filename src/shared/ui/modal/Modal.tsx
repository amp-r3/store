import { FC, ReactNode } from 'react';
import { IoClose } from 'react-icons/io5';
import style from './modal.module.scss';
import { Dialog } from 'radix-ui';

interface ModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
  actionLabel: string;
  onAction: () => void;
  actionVariant?: 'default' | 'success' | 'danger';
  cancelLabel?: string;
  isLoading?: boolean;
}

export const Modal: FC<ModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  icon,
  children,
  actionLabel,
  onAction,
  actionVariant = 'default',
  cancelLabel = 'Cancel',
  isLoading = false,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal container={document.getElementById('modal-root')!}>
        <Dialog.Overlay className={style.overlay} />

        <Dialog.Content className={`${style.content} ${style[actionVariant]}`}>
          <div className={style.header}>
            {icon && <div className={style.iconWrapper}>{icon}</div>}
            <Dialog.Title className={style.title}>{title}</Dialog.Title>
          </div>

          {description && (
            <Dialog.Description className={style.description}>
              {description}
            </Dialog.Description>
          )}

          {children && <div className={style.body}>{children}</div>}

          <div className={style.actions}>
            {actionVariant !== 'success' && (
              <Dialog.Close asChild>
                <button className={style.cancelButton} disabled={isLoading}>
                  {cancelLabel}
                </button>
              </Dialog.Close>
            )}
            <button
              className={`${style.actionButton} ${style[actionVariant]}`}
              onClick={onAction}
              disabled={isLoading}
            >
              {actionLabel}
            </button>
          </div>

          <Dialog.Close asChild>
            <button className={style.closeIconButton} aria-label="Close">
              <IoClose size={20} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};