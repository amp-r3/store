import { Dialog, VisuallyHidden } from 'radix-ui';
import style from './product-image-modal.module.scss';
import { useImageView } from '@/hooks';
import { BackButton } from '@/components/common';

interface ProductImageModalProps {
  imageSrc: string;
  imageAlt: string;
  onClose(): void;
  isOpen: boolean;
}

export const ProductImageModal = ({ imageSrc, imageAlt, onClose, isOpen }: ProductImageModalProps) => {

  const { contentRef, imageRef, bindDrag, bindPinch } = useImageView({ isOpen, onClose })

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal container={document.getElementById('modal-root')!}>
        <Dialog.Overlay className={style['modal-backdrop']} />

        <Dialog.Content
          {...bindDrag()}
          ref={contentRef}
          className={style['image-wrapper']}
          aria-describedby={undefined}
        >
          <VisuallyHidden.Root>
            <Dialog.Title>
              {imageAlt || 'Product image fullscreen'}
            </Dialog.Title>
          </VisuallyHidden.Root>

          <div className={style['back-button']}>
            <BackButton onClick={onClose} label="Back to product" />
          </div>

          <div className={style['image-container']}>
            <img
              {...bindPinch()}
              ref={imageRef}
              src={imageSrc}
              alt={imageAlt}
              className={style['image']}
              style={{ touchAction: 'none' }}
            />
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}