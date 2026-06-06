import { FaHeart, FaRegHeart } from 'react-icons/fa';
import style from './product-gallery.module.scss';

interface ProductGalleryProps {
    imageUrl: string;
    title: string;
    isFavorite: boolean;
    handleAddToWishlist(): void;
    onClick(): void;
}

export const ProductGallery = ({ imageUrl, title, isFavorite, handleAddToWishlist, onClick }: ProductGalleryProps) => {
    return (
        <div className={style['image-column']}>
            <div className={style['image-wrapper']} onClick={onClick}>
                <img src={imageUrl} alt={title} className={style['image']} />
                <button className={style['image-add-to-favorites']} onClick={(e) => { e.stopPropagation(); handleAddToWishlist() }} aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}>
                    {
                        isFavorite ?
                            <FaHeart className={style['image-icon']} /> :
                            <FaRegHeart className={style['image-icon']} />
                    }
                </button>
            </div>
        </div>
    );
};