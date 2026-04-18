import { FaChevronLeft } from 'react-icons/fa';
import style from './product-back-button.module.scss';

interface ProductBackButtonProps {
    onClick: () => void;
    label?: string;
}

export const ProductBackButton = ({ onClick, label='Go back' }: ProductBackButtonProps) => {
    return (
        <div className={style['back-wrapper']}>
            <button onClick={onClick} className={style['back-link']}>
                <FaChevronLeft size={12} className={style['back-icon']} />
                <span>{label}</span>
            </button>
        </div>
    );
};