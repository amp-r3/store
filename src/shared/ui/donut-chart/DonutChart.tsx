import { useState } from 'react';

import style from './donut-chart.module.scss';

export interface DonutSegment {
    key: string;
    label: string;
    value: number;
    /** CSS custom property name, e.g. '--chart-series-1'. */
    colorVar: string;
}

interface DonutChartProps {
    segments: DonutSegment[];
    ariaLabel: string;
    /** Value shown in the donut's hollow center, e.g. the grand total. */
    centerValue: string;
    centerLabel: string;
    formatValue?: (value: number) => string;
    size?: number;
}

const STROKE_WIDTH = 28;
const GAP_LENGTH = 3;

export const DonutChart = ({
    segments,
    ariaLabel,
    centerValue,
    centerLabel,
    formatValue = (value) => String(value),
    size = 180,
}: DonutChartProps) => {
    const [activeKey, setActiveKey] = useState<string | null>(null);

    const total = segments.reduce((sum, s) => sum + s.value, 0);
    const radius = (size - STROKE_WIDTH) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    let cumulative = 0;

    return (
        <div className={style['donut-chart']}>
            <div className={style['donut-chart__figure']} style={{ width: size, height: size }}>
                <svg
                    className={style['donut-chart__svg']}
                    viewBox={`0 0 ${size} ${size}`}
                    role="img"
                    aria-label={ariaLabel}
                >
                    <circle
                        className={style['donut-chart__track']}
                        cx={center}
                        cy={center}
                        r={radius}
                        strokeWidth={STROKE_WIDTH}
                        fill="none"
                    />
                    {/* Pointer-hover only — not a focus target. A stroked arc's
                        bounding box is the full circle, so a keyboard focus ring
                        here would frame the whole donut instead of the one
                        segment; the legend row below carries the same info and
                        is the keyboard-reachable equivalent (interaction.md). */}
                    {total > 0 && segments.map((segment) => {
                        if (segment.value <= 0) return null;

                        const segLen = (segment.value / total) * circumference;
                        const offset = cumulative;
                        cumulative += segLen;

                        return (
                            <circle
                                key={segment.key}
                                className={`${style['donut-chart__segment']} ${activeKey === segment.key ? style['donut-chart__segment--active'] : ''} ${activeKey && activeKey !== segment.key ? style['donut-chart__segment--dimmed'] : ''}`}
                                cx={center}
                                cy={center}
                                r={radius}
                                fill="none"
                                stroke={`var(${segment.colorVar})`}
                                strokeWidth={STROKE_WIDTH}
                                strokeDasharray={`${Math.max(segLen - GAP_LENGTH, 0)} ${circumference - segLen + GAP_LENGTH}`}
                                strokeDashoffset={-offset}
                                transform={`rotate(-90 ${center} ${center})`}
                                onPointerEnter={() => setActiveKey(segment.key)}
                                onPointerLeave={() => setActiveKey(null)}
                            />
                        );
                    })}
                </svg>

                <div className={style['donut-chart__center']}>
                    <span className={style['donut-chart__center-value']}>{centerValue}</span>
                    <span className={style['donut-chart__center-label']}>{centerLabel}</span>
                </div>
            </div>

            <ul className={style['donut-chart__legend']}>
                {segments.map((segment) => (
                    <li
                        key={segment.key}
                        className={`${style['donut-chart__legend-item']} ${activeKey === segment.key ? style['donut-chart__legend-item--active'] : ''}`}
                        tabIndex={0}
                        role="button"
                        aria-label={`${segment.label}: ${formatValue(segment.value)}, ${total > 0 ? Math.round((segment.value / total) * 100) : 0}%`}
                        onPointerEnter={() => setActiveKey(segment.key)}
                        onPointerLeave={() => setActiveKey(null)}
                        onFocus={() => setActiveKey(segment.key)}
                        onBlur={() => setActiveKey(null)}
                    >
                        <span
                            className={style['donut-chart__legend-swatch']}
                            style={{ background: `var(${segment.colorVar})` }}
                            aria-hidden="true"
                        />
                        <span className={style['donut-chart__legend-label']}>{segment.label}</span>
                        <span className={style['donut-chart__legend-value']}>{formatValue(segment.value)}</span>
                        <span className={style['donut-chart__legend-share']}>
                            {total > 0 ? Math.round((segment.value / total) * 100) : 0}%
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};
