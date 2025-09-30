import { useSelector } from 'react-redux';
import style from './error.module.scss'
import { TbAlertTriangle } from 'react-icons/tb';
import { useEffect } from 'react';
const ErrorView = () => {

    const { error } = useSelector((state) => state.products)
    useEffect(() => { }, [error])

    const onRetry = () => {
        window.location.reload(false)
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