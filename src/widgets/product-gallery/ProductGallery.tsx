import { useState } from 'react';
import Image from 'next/image';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { TbPhotoOff } from 'react-icons/tb';
import style from './product-gallery.module.scss';

interface ProductGalleryProps {
  imageUrl: string;
  title: string;
  isFavorite: boolean;
  handleAddToWishlist(): void;
  onClick(): void;
}

export const ProductGallery = ({
  imageUrl,
  title,
  isFavorite,
  handleAddToWishlist,
  onClick,
}: ProductGalleryProps) => {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className={style['image-column']}>
      <div className={style['image-wrapper']}>
        {imageFailed ? (
          <div className={style['image-fallback']} role="img" aria-label={title}>
            <TbPhotoOff aria-hidden="true" />
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 45vw"
            className={style['image']}
            priority
            onError={() => setImageFailed(true)}
          />
        )}
        <button
          type="button"
          className={style['image-zoom-trigger']}
          onClick={onClick}
          aria-label={`View larger image of ${title}`}
        />
        <button
          type="button"
          className={style['image-add-to-favorites']}
          onClick={(e) => {
            e.stopPropagation();
            handleAddToWishlist();
          }}
          aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isFavorite ? (
            <FaHeart className={style['image-icon']} />
          ) : (
            <FaRegHeart className={style['image-icon']} />
          )}
        </button>
      </div>
    </div>
  );
};
