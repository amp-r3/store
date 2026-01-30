import style from './loader.module.scss';

export const Loader = ({ size = 'md' }) => {
    const wrapperClass = `${style.spinnerWrapper} ${style[`spinnerWrapper--${size}`] || ''}`;
    const spinnerClass = `${style.spinner} ${style[`spinner--${size}`] || ''}`;

    return (
        <div className={wrapperClass}>
            <div className={spinnerClass}></div>
        </div>
    );
};
