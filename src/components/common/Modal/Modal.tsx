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
  actionLabel: string;
  onAction: () => void;
  actionVariant?: 'primary' | 'danger';
  isLoading?: boolean;
}

export const Modal: FC<ModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  icon,
  actionLabel,
  onAction,
  actionVariant = 'primary',
  isLoading = false,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal container={document.getElementById('modal-root')!}>
        <Dialog.Overlay className={style.overlay} />

        <Dialog.Content className={style.content}>
          <div className={style.header}>
            {icon && <div className={style.iconWrapper}>{icon}</div>}
            <Dialog.Title className={style.title}>{title}</Dialog.Title>
          </div>

          {description && (
            <Dialog.Description className={style.description}>
              {description}
            </Dialog.Description>
          )}

          <div className={style.actions}>
            <Dialog.Close asChild>
              <button
                className={style.cancelButton}
                disabled={isLoading}
              >
                Cancel
              </button>
            </Dialog.Close>
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