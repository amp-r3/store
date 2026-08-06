import style from './error-view.module.scss';
import { TbAlertTriangle } from 'react-icons/tb';
import { FC } from 'react';
import { useHaptics } from "@/shared/lib/hooks";

interface ErrorViewProps {
    error?: string
}

export const ErrorView: FC<ErrorViewProps> = ({ error }) => {
    const { light } = useHaptics()

    // A hard reload, not router.refresh(): every query on the page is
    // client-fetched RTK Query state, which a server-payload refresh doesn't
    // touch. This is also what react-router's old `navigate(0)` actually did
    // (history.go(0) reloads the document in every browser).
    const onRetry = () => {
        light()
        window.location.reload();
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
