import style from './errorView.module.scss';
import { TbAlertTriangle } from 'react-icons/tb';
import { useNavigate } from 'react-router';
import { FC } from 'react';

interface ErrorViewProps {
    error?: string
}

export const ErrorView: FC<ErrorViewProps> = ({ error }) => {
    const navigate = useNavigate();

    const onRetry = () => {
        navigate(0);
    }

    return (
        <div className={style.wrapper}>
            <div className={style.errorView}>
                <div className={style.errorIcon}>
                    <TbAlertTriangle />
                </div>
                <h2 className={style.errorTitle}>Oops! Something went wrong</h2>
                <p className={style.errorMessage}>
                    {error || "We couldn't complete your request. Please try again later."}
                </p>
                <button onClick={onRetry} className={style.errorButton}>
                    Try Again
                </button>
            </div>
        </div>
    );
};
