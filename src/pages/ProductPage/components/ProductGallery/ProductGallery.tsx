import style from './product-gallery.module.scss';

interface ProductGalleryProps {
    imageUrl: string;
    title: string;
    onClick(): void;
}

export const ProductGallery = ({ imageUrl, title, onClick }: ProductGalleryProps) => {
    return (
        <div className={style['image-column']}>
            <div className={style['image-wrapper']} onClick={onClick}>
                <img src={imageUrl} alt={title} className={style['image']} />
            </div>
        </div>
    );
};