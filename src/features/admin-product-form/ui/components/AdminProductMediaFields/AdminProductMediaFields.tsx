import { buildProductImageName } from '@/shared/config';
import { AdminProductDetail } from '@/entities/admin';

import { UseProductMediaDraftResult, ProductMediaSlot } from '../../../lib/useProductMediaDraft';
import { AdminProductImageSlot } from '../AdminProductImageSlot/AdminProductImageSlot';

import style from './admin-product-media-fields.module.scss';

interface AdminProductMediaFieldsProps {
    product?: AdminProductDetail;
    draft: UseProductMediaDraftResult;
}

export const AdminProductMediaFields = ({ product, draft }: AdminProductMediaFieldsProps) => {
    const { thumbnail, gallery, canAddImage, selectThumbnailFile, removeThumbnail, selectGalleryFile, removeGalleryImage } = draft;

    if (!product) {
        return <p className={style.placeholder}>Save the product to upload images.</p>;
    }

    const nextIndex = gallery.length + 1;
    const addSlot: ProductMediaSlot = {
        key: 'gallery-add',
        kind: 'gallery',
        index: nextIndex,
        existingUrl: null,
        file: null,
        previewUrl: null,
        removed: false,
        fileName: buildProductImageName(product.id, 'gallery', nextIndex),
        isValidating: false,
    };

    return (
        <div className={style.wrapper}>
            <p className={style.requirements}>WebP only · thumbnail ≤10 KB, 400×400 · image ≤100 KB, 1000×1000</p>

            <div className={style.groups}>
                <div className={style.group}>
                    <span className={style.groupLabel}>Thumbnail</span>
                    <AdminProductImageSlot slot={thumbnail} label="thumbnail" onSelectFile={selectThumbnailFile} onRemove={removeThumbnail} />
                </div>

                <div className={[style.group, style.groupGallery].join(' ')}>
                    <span className={style.groupLabel}>Images</span>
                    <div className={style.gallery}>
                        {gallery.map((slot) => (
                            <AdminProductImageSlot
                                key={slot.key}
                                slot={slot}
                                label={`image ${slot.index}`}
                                onSelectFile={(file) => selectGalleryFile(slot.index!, file)}
                                onRemove={() => removeGalleryImage(slot.index!)}
                            />
                        ))}
                        {canAddImage && (
                            <AdminProductImageSlot
                                slot={addSlot}
                                label={`image ${nextIndex}`}
                                onSelectFile={(file) => selectGalleryFile(nextIndex, file)}
                                onRemove={() => {}}
                                grow
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
