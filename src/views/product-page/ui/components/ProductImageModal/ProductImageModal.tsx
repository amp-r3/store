import Image from 'next/image';
import { Dialog, VisuallyHidden } from 'radix-ui';
import style from './product-image-modal.module.scss';
import { useImageView } from "@/shared/lib/hooks";
import { getModalRoot } from "@/shared/lib";

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
      <Dialog.Portal container={getModalRoot()}>
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
            <button type="button" className={style['back-button__link']} onClick={onClose}>
              Back to product
            </button>
          </div>

          <div className={style['image-container']}>
            <Image
              {...bindPinch()}
              ref={imageRef}
              src={imageSrc}
              alt={imageAlt}
              width={1200}
              height={1200}
              sizes="100vw"
              className={style['image']}
              style={{ touchAction: 'none' }}
            />
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}