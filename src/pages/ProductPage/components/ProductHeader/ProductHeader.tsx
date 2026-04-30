import { BackButton } from '@/components/common/BackButton/BackButton';
import { ShareCopyBtn } from '@/components/common/ShareCopyBtn/ShareCopyBtn';
import style from './product-header.module.scss'
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