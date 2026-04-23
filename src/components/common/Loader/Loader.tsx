import style from './loader.module.scss';

type LoaderSize = 'xs' | 'sm' | 'md';

export const Loader = ({ size }: { size?: LoaderSize }) => {
    const wrapperClass = size
        ? `${style.spinnerWrapper__inline} ${style[`spinnerWrapper--${size}`] || ''}`
        : style.spinnerWrapper;

    const spinnerClass = size
        ? `${style.spinner} ${style[`spinner--${size}`]}`
        : `${style.spinner} ${style['spinner--md']}`;

    return (
        <div className={wrapperClass}>
            <div className={spinnerClass}></div>
        </div>
    );
};