import style from './product-gallery.module.scss';

interface ProductGalleryProps {
    imageUrl: string;
    title: string;
}

export const ProductGallery = ({ imageUrl, title }: ProductGalleryProps) => {
    return (
        <div className={style['image-column']}>
            <div className={style['image-wrapper']}>
                <img src={imageUrl} alt={title} className={style['image']} />
            </div>
        </div>
    );
};