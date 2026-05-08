import style from './product-header.module.scss'
import { BackButton, ShareCopyBtn } from '@/components/common';
interface ProductHeaderProps {
    onClick: () => void;
    label?: string;
}

export const ProductHeader = ({ onClick, label }: ProductHeaderProps) => {
    return (
        <div className={style['product-header']}>
            <BackButton onClick={onClick} label={label} />
            <ShareCopyBtn />
        </div>
    );
};