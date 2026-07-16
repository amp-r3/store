import style from './product-header.module.scss'
import { Breadcrumbs, ShareCopyBtn } from '@/shared/ui';

interface ProductHeaderProps {
    category: string;
    title: string;
}

export const ProductHeader = ({ category, title }: ProductHeaderProps) => {
    return (
        <div className={style['product-header']}>
            <Breadcrumbs items={[
                { label: 'Catalog', path: '/' },
                { label: category, path: `/?category=${category}` },
                { label: title }
            ]} />
            <ShareCopyBtn />
        </div>
    );
};