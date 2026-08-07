import { DragEvent, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { LuImagePlus, LuTriangleAlert, LuX } from 'react-icons/lu';

import { PRODUCT_IMAGE_MIME } from '@/shared/config';
import { ProductMediaSlot } from '../../../lib/useProductMediaDraft';

import style from './admin-product-image-slot.module.scss';

interface AdminProductImageSlotProps {
    slot: ProductMediaSlot;
    label: string;
    onSelectFile: (file: File) => void;
    onRemove: () => void;
    /** The trailing "add" tile — stretches to fill the row's remaining width instead of matching the fixed tile size. */
    grow?: boolean;
}

export const AdminProductImageSlot = ({ slot, label, onSelectFile, onRemove, grow }: AdminProductImageSlotProps) => {
    const inputId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const hasPreview = !!slot.previewUrl && !slot.removed;
    const isLocalPreview = slot.previewUrl?.startsWith('blob:');

    // Drag & drop only fills an empty "Upload" tile — dropping onto an
    // already-filled preview is a no-op (use the × button, then re-pick) so
    // a stray drag over an existing image can't silently swap it out.
    // preventDefault still runs unconditionally on both events regardless,
    // otherwise the browser's default action (navigating to the file) fires.
    const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        if (!hasPreview) setIsDragActive(true);
    };

    const handleDragLeave = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragActive(false);
    };

    const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragActive(false);
        if (hasPreview) return;
        const file = event.dataTransfer.files[0];
        if (file) onSelectFile(file);
    };

    return (
        <div className={[style.slot, grow ? style.slotGrow : ''].filter(Boolean).join(' ')}>
            <label
                htmlFor={inputId}
                className={[
                    style.tile,
                    grow ? style.tileGrow : '',
                    hasPreview ? style.tileFilled : '',
                    slot.error ? style.tileError : '',
                    isDragActive ? style.tileDragActive : '',
                ].filter(Boolean).join(' ')}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {hasPreview ? (
                    isLocalPreview ? (
                        // Blob URLs are browser-tab-local — next/image's optimizer can't
                        // fetch them, so a freshly-picked file previews via a plain <img>.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={slot.previewUrl!} alt="" className={style.preview} />
                    ) : (
                        <Image src={slot.previewUrl!} alt="" fill sizes="180px" className={style.preview} />
                    )
                ) : (
                    <span className={style.empty}>
                        <LuImagePlus aria-hidden />
                        {isDragActive ? 'Drop to upload' : 'Upload'}
                    </span>
                )}

                <input
                    ref={inputRef}
                    id={inputId}
                    type="file"
                    accept={PRODUCT_IMAGE_MIME}
                    className={style.input}
                    onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) onSelectFile(file);
                        event.target.value = '';
                    }}
                />
            </label>

            {hasPreview && (
                <button type="button" className={style.remove} onClick={onRemove} aria-label={`Remove ${label.toLowerCase()}`}>
                    <LuX />
                </button>
            )}

            <span className={style.name}>{slot.fileName}</span>

            {slot.error && (
                <span className={style.error} role="alert">
                    <LuTriangleAlert aria-hidden /> {slot.error}
                </span>
            )}
            {!slot.error && slot.warning && (
                <span className={style.warning} aria-live="polite">
                    <LuTriangleAlert aria-hidden /> {slot.warning}
                </span>
            )}
        </div>
    );
};
