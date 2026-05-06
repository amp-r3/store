import style from './loader.module.scss';

type LoaderSize = 'xs' | 'sm' | 'md';

export const Loader = ({ size }: { size?: LoaderSize }) => {
    const wrapperClass = size
        ? `${style.spinnerWrapper__inline} ${style[`spinnerWrapper--${size}`] || ''}`
        : style.spinnerWrapper;

    const svgClass = size
        ? `${style.spinnerSvg} ${style[`spinnerSvg--${size}`]}`
        : `${style.spinnerSvg} ${style['spinnerSvg--md']}`;

    return (
        <div className={wrapperClass}>
            <svg className={svgClass} viewBox="0 0 50 50">
                <defs>
                    <linearGradient
                        id="loader-gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                        gradientUnits="objectBoundingBox"
                    >
                        <stop offset="0%"   stopColor="var(--loader-grad-start)" stopOpacity="0" />
                        <stop offset="40%"  stopColor="var(--loader-grad-start)" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="var(--loader-grad-end)"   stopOpacity="1" />
                    </linearGradient>
                </defs>

                <circle
                    className={style.spinnerTrack}
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                />

                <circle
                    className={style.spinnerPath}
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                />
            </svg>
        </div>
    );
};