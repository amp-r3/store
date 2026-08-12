import { useCallback, useEffect, useRef, useState } from 'react';

import {
  buildProductImageName,
  buildProductImageUrl,
  MAX_PRODUCT_IMAGES,
  ProductImageKind,
} from '@/shared/config';
import {
  AdminProductDetail,
  useUploadProductImageMutation,
  useRemoveProductImageMutation,
} from '@/entities/admin';

import { validateProductImageFile } from './validateProductImageFile';

export interface ProductMediaSlot {
  key: string;
  kind: ProductImageKind;
  /** 1-based position within the gallery — undefined for the thumbnail. */
  index?: number;
  existingUrl: string | null;
  file: File | null;
  previewUrl: string | null;
  removed: boolean;
  fileName: string;
  isValidating: boolean;
  error?: string;
  warning?: string;
}

const buildSlot = (
  productId: number,
  kind: ProductImageKind,
  index: number | undefined,
  existingUrl: string | null,
): ProductMediaSlot => ({
  key: kind === 'thumbnail' ? 'thumbnail' : `gallery-${index}`,
  kind,
  index,
  existingUrl,
  file: null,
  previewUrl: existingUrl,
  removed: false,
  fileName: buildProductImageName(productId, kind, index),
  isValidating: false,
});

export interface ProductMediaCommitResult {
  /** Set only when the thumbnail changed this save — '' means "cleared". */
  thumbnail?: string;
  /** Set only when the gallery changed this save — admin_update_product replaces the whole array when this key is present. */
  images?: string[];
}

export interface UseProductMediaDraftResult {
  productId: number | null;
  thumbnail: ProductMediaSlot;
  gallery: ProductMediaSlot[];
  canAddImage: boolean;
  selectThumbnailFile: (file: File) => void;
  removeThumbnail: () => void;
  selectGalleryFile: (index: number, file: File) => void;
  removeGalleryImage: (index: number) => void;
  /** Uploads/deletes every staged change in Storage and returns the fields to fold into the product update payload. */
  commit: () => Promise<ProductMediaCommitResult>;
}

export const useProductMediaDraft = (product?: AdminProductDetail): UseProductMediaDraftResult => {
  const productId = product?.id ?? null;

  const [thumbnail, setThumbnail] = useState<ProductMediaSlot | null>(null);
  const [gallery, setGallery] = useState<ProductMediaSlot[]>([]);

  const [uploadProductImage] = useUploadProductImageMutation();
  const [removeProductImage] = useRemoveProductImageMutation();

  useEffect(() => {
    if (!product) {
      setThumbnail(null);
      setGallery([]);
      return;
    }

    setThumbnail(buildSlot(product.id, 'thumbnail', undefined, product.thumbnail));
    setGallery(product.images.map((url, i) => buildSlot(product.id, 'gallery', i + 1, url)));
  }, [product]);

  // Every object URL this draft has ever created — revoked on unmount so
  // picking through several files in a row doesn't leak blob: memory.
  const createdObjectUrls = useRef(new Set<string>());
  useEffect(() => {
    const urls = createdObjectUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const selectThumbnailFile = useCallback((file: File) => {
    setThumbnail((current) => {
      if (!current) return current;

      const previewUrl = URL.createObjectURL(file);
      createdObjectUrls.current.add(previewUrl);
      if (current.file && current.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
        createdObjectUrls.current.delete(current.previewUrl);
      }

      validateProductImageFile(file, 'thumbnail').then(({ error, warning }) => {
        setThumbnail((latest) =>
          latest?.file === file ? { ...latest, isValidating: false, error, warning } : latest,
        );
      });

      return {
        ...current,
        file,
        previewUrl,
        removed: false,
        isValidating: true,
        error: undefined,
        warning: undefined,
      };
    });
  }, []);

  const removeThumbnail = useCallback(() => {
    setThumbnail((current) => {
      if (!current) return current;
      if (current.file && current.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
        createdObjectUrls.current.delete(current.previewUrl);
      }
      if (current.file) {
        // Discard the staged replacement, revert to whatever is already saved.
        return {
          ...current,
          file: null,
          previewUrl: current.existingUrl,
          error: undefined,
          warning: undefined,
        };
      }
      return { ...current, removed: true, previewUrl: null };
    });
  }, []);

  const selectGalleryFile = useCallback(
    (index: number, file: File) => {
      if (!productId) return;

      setGallery((current) => {
        const existingSlot = current.find((slot) => slot.index === index);
        const slot = existingSlot ?? buildSlot(productId, 'gallery', index, null);
        const previewUrl = URL.createObjectURL(file);
        createdObjectUrls.current.add(previewUrl);
        if (slot.file && slot.previewUrl) {
          URL.revokeObjectURL(slot.previewUrl);
          createdObjectUrls.current.delete(slot.previewUrl);
        }

        const stagedSlot: ProductMediaSlot = {
          ...slot,
          file,
          previewUrl,
          removed: false,
          isValidating: true,
          error: undefined,
          warning: undefined,
        };

        validateProductImageFile(file, 'gallery').then(({ error, warning }) => {
          // Guard on file identity, not just index — picking a second file
          // into the same slot before the first validation resolves must
          // not let the stale result overwrite the newer one.
          setGallery((latest) =>
            latest.map((s) =>
              s.index === index && s.file === file
                ? { ...s, isValidating: false, error, warning }
                : s,
            ),
          );
        });

        return existingSlot
          ? current.map((s) => (s.index === index ? stagedSlot : s))
          : [...current, stagedSlot];
      });
    },
    [productId],
  );

  const removeGalleryImage = useCallback(
    (index: number) => {
      setGallery((current) => {
        const slot = current.find((s) => s.index === index);
        if (!slot) return current;

        if (slot.file && slot.previewUrl) {
          URL.revokeObjectURL(slot.previewUrl);
          createdObjectUrls.current.delete(slot.previewUrl);
        }

        // A newly-added slot with no saved image behind it: drop it and
        // renumber the rest so gallery indices stay a contiguous 1..N run.
        if (!slot.existingUrl) {
          return current
            .filter((s) => s.index !== index)
            .map((s, i) => ({
              ...s,
              index: i + 1,
              fileName: buildProductImageName(productId!, 'gallery', i + 1),
            }));
        }

        if (slot.file) {
          return current.map((s) =>
            s.index === index
              ? {
                  ...s,
                  file: null,
                  previewUrl: s.existingUrl,
                  error: undefined,
                  warning: undefined,
                }
              : s,
          );
        }

        return current.map((s) =>
          s.index === index ? { ...s, removed: true, previewUrl: null } : s,
        );
      });
    },
    [productId],
  );

  const commit = useCallback(async (): Promise<ProductMediaCommitResult> => {
    if (!productId || !thumbnail) return {};

    const allSlots = [thumbnail, ...gallery];
    if (allSlots.some((slot) => slot.isValidating)) {
      throw new Error('Wait for image checks to finish before saving.');
    }
    const invalidSlot = allSlots.find((slot) => slot.file && slot.error);
    if (invalidSlot) {
      throw new Error(
        `Fix ${invalidSlot.kind === 'thumbnail' ? 'the thumbnail' : `image ${invalidSlot.index}`} before saving.`,
      );
    }

    // Names are deterministic (product-<id>-thumb.webp, product-<id>-<n>.webp),
    // so replacing a file keeps the same URL — a cache-buster is the only way
    // the browser/Next Image Optimizer notice the bytes changed.
    const bust = (url: string) => `${url}?v=${Date.now()}`;
    const result: ProductMediaCommitResult = {};

    if (thumbnail.file) {
      await uploadProductImage({ fileName: thumbnail.fileName, file: thumbnail.file }).unwrap();
      result.thumbnail = bust(buildProductImageUrl(thumbnail.fileName));
    } else if (thumbnail.removed) {
      await removeProductImage({ fileName: thumbnail.fileName }).unwrap();
      result.thumbnail = '';
    }

    let galleryChanged = false;
    const images: string[] = [];
    for (const slot of gallery) {
      if (slot.removed) {
        await removeProductImage({ fileName: slot.fileName }).unwrap();
        galleryChanged = true;
        continue;
      }
      if (slot.file) {
        await uploadProductImage({ fileName: slot.fileName, file: slot.file }).unwrap();
        images.push(bust(buildProductImageUrl(slot.fileName)));
        galleryChanged = true;
        continue;
      }
      if (slot.existingUrl) {
        images.push(slot.existingUrl);
      }
    }

    // images is presence-checked server-side (admin_update_product), so
    // only include it — a full replace — when the gallery actually changed;
    // leaving it out keeps the existing array untouched.
    if (galleryChanged) {
      result.images = images;
    }

    return result;
  }, [productId, thumbnail, gallery, uploadProductImage, removeProductImage]);

  return {
    productId,
    thumbnail: thumbnail ?? buildSlot(productId ?? 0, 'thumbnail', undefined, null),
    gallery,
    canAddImage: gallery.length < MAX_PRODUCT_IMAGES,
    selectThumbnailFile,
    removeThumbnail,
    selectGalleryFile,
    removeGalleryImage,
    commit,
  };
};
