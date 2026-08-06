import { useState } from 'react';
import { LuPlus, LuTag } from 'react-icons/lu';

import { getErrorMessage } from '@/shared/lib';
import { SectionHeader, Button, Alert, EmptyState } from '@/shared/ui';
import { AdminCategory, useGetAdminCategoriesQuery } from '@/entities/admin';

import { AdminCategoriesTable, AdminCategoryFormModal, AdminCategoryDeleteModal } from './components';

export const AdminCategoriesPage = () => {
    const { data, isLoading, error } = useGetAdminCategoriesQuery();
    const categories = data ?? [];

    const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deletingCategory, setDeletingCategory] = useState<AdminCategory | null>(null);

    const openCreateForm = () => {
        setEditingCategory(null);
        setIsFormOpen(true);
    };

    const openEditForm = (category: AdminCategory) => {
        setEditingCategory(category);
        setIsFormOpen(true);
    };

    return (
        <>
            <SectionHeader
                title="Categories"
                subtitle="Organize the catalog into browsable sections."
                action={<Button variant="primary" onClick={openCreateForm}><LuPlus /> New category</Button>}
            />

            {error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

            {!isLoading && categories.length === 0 ? (
                <EmptyState
                    icon={<LuTag />}
                    title="No categories yet"
                    text="Create a category before adding products to it."
                />
            ) : (
                <AdminCategoriesTable
                    categories={categories}
                    isLoading={isLoading}
                    onEdit={openEditForm}
                    onDelete={setDeletingCategory}
                />
            )}

            <AdminCategoryFormModal
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
                category={editingCategory}
            />

            <AdminCategoryDeleteModal
                isOpen={!!deletingCategory}
                onOpenChange={(open) => { if (!open) setDeletingCategory(null); }}
                category={deletingCategory}
            />
        </>
    );
};
