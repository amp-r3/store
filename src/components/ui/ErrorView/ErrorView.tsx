import { useSelector } from 'react-redux';
import style from './errorView.module.scss'
import { TbAlertTriangle } from 'react-icons/tb';
import { useNavigate } from 'react-router';
import { useAppSelector } from '@/store/hook';
const ErrorView = () => {
    const { error } = useAppSelector((state) => state.products)
    const navigate = useNavigate();

    const onRetry = () => {
        window.location.reload()
        navigate('/')
    }

    return (
        <div className={style.errorView}>
            <div className={style.errorIcon}>
                <TbAlertTriangle size={72} />
            </div>
            <h2 className={style.errorTitle}>Oops! Something went wrong</h2>
            <p className={style.errorMessage}>
                {error || "We couldn't complete your request. Please try again later."}
            </p>
            {onRetry && (
                <button onClick={onRetry} className={style.errorButton}>
                    Try Again
                </button>
            )}
        </div>
    );
};

export default ErrorView