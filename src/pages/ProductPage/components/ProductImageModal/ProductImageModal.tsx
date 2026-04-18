import { Dialog } from 'radix-ui';
import style from './product-image-modal.module.scss';
import { ProductBackButton } from "../ProductBackButton/ProductBackButton";

interface ProductImageModalProps {
  imageSrc: string;
  imageAlt: string;
  onClose(): void;
  isOpen: boolean;
}

export const ProductImageModal = ({ imageSrc, imageAlt, onClose, isOpen }: ProductImageModalProps) => {

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
    >
      <Dialog.Portal container={document.getElementById('modal-root')!}>
        <Dialog.Overlay forceMount  className={style['modal-backdrop']} />

        <Dialog.Content forceMount  className={style['image-wrapper']} aria-describedby={undefined}>
          <Dialog.Title style={{ display: 'none' }}>
            {imageAlt || 'Product image fullscreen'}
          </Dialog.Title>

          <div className={style['back-button']}>
            <ProductBackButton onClick={onClose} label="Back to product" />
          </div>

          <img src={imageSrc} alt={imageAlt} className={style['image']} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}