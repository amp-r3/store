import { BackButton } from '@/components/common/BackButton/BackButton';

interface ProductHeaderProps {
    onClick: () => void;
    label?: string;
}

export const ProductHeader = ({ onClick, label }: ProductHeaderProps) => {
    return (
        <div>
            <BackButton onClick={onClick} label={label} />
        </div>
    );
};