import { useEffect, useState, useRef } from 'react';
import style from './top-bar-loader.module.scss';

interface TopBarLoaderProps {
    isLoading: boolean;
}

export const TopBarLoader = ({ isLoading }: TopBarLoaderProps) => {
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef1 = useRef<ReturnType<typeof setTimeout> | null>(null);
    const timeoutRef2 = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearAll = () => {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        if (timeoutRef1.current) { clearTimeout(timeoutRef1.current); timeoutRef1.current = null; }
        if (timeoutRef2.current) { clearTimeout(timeoutRef2.current); timeoutRef2.current = null; }
    };

    useEffect(() => {
        if (isLoading) {
            clearAll();

            setProgress(0);
            setVisible(true);

            // Give a tiny frame delay to let the DOM register 0% width first
            const rafId = requestAnimationFrame(() => {
                setProgress(2);

                // Frequent small ticks (100ms) with overlapping transitions (200ms)
                // create an incredibly fluid and smooth motion glide.
                intervalRef.current = setInterval(() => {
                    setProgress(prev => {
                        if (prev >= 90) {
                            if (intervalRef.current) {
                                clearInterval(intervalRef.current);
                                intervalRef.current = null;
                            }
                            return 90;
                        }
                        const remaining = 90 - prev;
                        // Decaying step size with tiny random noise
                        const step = remaining * 0.055 + (Math.random() * 0.5 - 0.25);
                        const nextProgress = prev + Math.max(0.25, step);
                        return Math.min(90, nextProgress);
                    });
                }, 100);
            });

            return () => {
                cancelAnimationFrame(rafId);
                clearAll();
            };
        } else {
            clearAll();

            // Swiftly complete the bar to 100%
            setProgress(100);

            // Wait for 100% width transition (250ms) to complete, then start fade out
            timeoutRef1.current = setTimeout(() => {
                setVisible(false);

                // Wait for opacity fade out transition (150ms) to complete, then reset progress to 0
                timeoutRef2.current = setTimeout(() => {
                    setProgress(0);
                }, 200);
            }, 280);
        }
    }, [isLoading]);

    useEffect(() => () => clearAll(), []);

    if (!visible && progress === 0) return null;

    const isStuck = progress >= 90;
    const isCompleting = progress === 100;

    const loaderClass = `${style['top-bar-loader']} ${!visible ? style['top-bar-loader--hidden'] : ''}`;
    const barClass = `${style['top-bar-loader__bar']} ${isStuck ? style['top-bar-loader__bar--pulsing'] : ''}`;

    const barStyle = {
        width: `${progress}%`,
        // Overlapping transition (200ms) relative to tick interval (100ms)
        // prevents the bar from ever coming to a complete stop between updates.
        transition: progress === 0
            ? 'none'
            : isCompleting
                ? 'width 250ms cubic-bezier(0.16, 1, 0.3, 1), opacity 150ms ease-in-out'
                : 'width 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 150ms ease-in-out',
    };

    return (
        <div className={loaderClass} aria-hidden="true">
            <div
                className={barClass}
                style={barStyle}
            >
                <div className={style['top-bar-loader__glow']} />
            </div>
        </div>
    );
};