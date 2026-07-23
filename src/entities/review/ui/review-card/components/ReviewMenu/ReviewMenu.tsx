import { useState } from 'react';
import { DropdownMenu } from 'radix-ui';
import { FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';
import style from './review-menu.module.scss';
import { Modal } from '@/shared/ui';
import { useHaptics } from "@/shared/lib/hooks";

interface ReviewMenuProps {
    onEdit: () => void;
    onDelete: () => void;
}

export const ReviewMenu = ({ onEdit, onDelete }: ReviewMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const { soft } = useHaptics();

    const handleTriggerClick = (openState: boolean) => {
        if (openState) {
            soft();
        }
        setIsOpen(openState);
    };

    const handleEditClick = () => {
        setIsOpen(false);
        onEdit();
    };

    const handleDeleteClick = () => {
        setIsOpen(false);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        setIsDeleteModalOpen(false);
        onDelete();
    };

    return (
        <>
            <DropdownMenu.Root open={isOpen} onOpenChange={handleTriggerClick}>
                <DropdownMenu.Trigger asChild>
                    <button
                        type="button"
                        className={`${style['review-menu__btn']} ${isOpen ? style['review-menu__btn--open'] : ''}`}
                        aria-label="Options for your review"
                    >
                        <FaEllipsisV aria-hidden="true" />
                    </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                    <DropdownMenu.Content
                        className={style['review-menu__dropdown']}
                        sideOffset={8}
                        align="end"
                    >
                        <DropdownMenu.Item className={style['review-menu__item']} onSelect={handleEditClick}>
                            <FaEdit className={style['review-menu__icon']} aria-hidden="true" /> Edit
                        </DropdownMenu.Item>
                        <DropdownMenu.Item className={`${style['review-menu__item']} ${style['review-menu__item--danger']}`} onSelect={handleDeleteClick}>
                            <FaTrash className={style['review-menu__icon']} aria-hidden="true" /> Delete
                        </DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>

            <Modal
                isOpen={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                title="Delete Review"
                description="Are you sure you want to delete this review? This action cannot be undone."
                actionLabel="Delete"
                actionVariant="danger"
                onAction={handleConfirmDelete}
            />
        </>
    );
};
