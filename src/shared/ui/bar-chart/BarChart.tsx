import { KeyboardEvent, PointerEvent, useRef, useState } from 'react';

import { niceTicks } from '@/shared/lib';
import { useElementWidth } from '@/shared/lib/hooks';

import style from './bar-chart.module.scss';

export interface BarChartSeries {
    key: string;
    label: string;
    /** CSS custom property name, e.g. '--chart-series-1'. */
    colorVar: string;
}

export interface BarChartPoint {
    /** X-axis label, already formatted by the caller. */
    label: string;
    values: Record<string, number>;
}

interface BarChartProps {
    points: BarChartPoint[];
    series: BarChartSeries[];
    ariaLabel: string;
    /** FULL height including the x-axis label row, not just the plot. */
    height?: number;
    formatValue?: (value: number) => string;
    isStale?: boolean;
}

const X_AXIS_ROW_HEIGHT = 24;
const PADDING_TOP = 8;
const Y_TICK_COUNT = 4;
const X_TICK_MIN_PX = 56;
const BAR_MAX_WIDTH = 24;
const BAR_SLOT_FILL = 0.6;
const SEGMENT_GAP = 2;
const CORNER_RADIUS = 4;

/** A stacked bar segment: square at the baseline, rounded at its visible top end. */
const roundedTopRectPath = (x: number, y: number, w: number, h: number, r: number) => {
    if (h <= 0 || w <= 0) return '';
    const radius = Math.min(r, w / 2, h);
    return `M${x},${y + h} L${x},${y + radius} Q${x},${y} ${x + radius},${y} L${x + w - radius},${y} Q${x + w},${y} ${x + w},${y + radius} L${x + w},${y + h} Z`;
};

export const BarChart = ({
    points,
    series,
    ariaLabel,
    height = 220,
    formatValue = (value) => String(value),
    isStale = false,
}: BarChartProps) => {
    const { ref: plotRef, width: plotWidth } = useElementWidth<HTMLDivElement>();
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const isPointerDownRef = useRef(false);

    const plotHeight = height - X_AXIS_ROW_HEIGHT;
    const baselineY = plotHeight;

    const totals = points.map((point) => series.reduce((sum, s) => sum + (point.values[s.key] ?? 0), 0));
    const rawMax = Math.max(...totals, 1);
    const yTicks = niceTicks(rawMax, Y_TICK_COUNT);
    const scaleMax = yTicks[yTicks.length - 1];

    const scaleY = (value: number) => baselineY - (value / scaleMax) * (baselineY - PADDING_TOP);
    const slotWidth = plotWidth / Math.max(points.length, 1);
    const barWidth = Math.min(BAR_MAX_WIDTH, slotWidth * BAR_SLOT_FILL);
    const scaleX = (index: number) => index * slotWidth + (slotWidth - barWidth) / 2;

    const yAxisWidthCh = Math.max(...yTicks.map((tick) => formatValue(tick).length), 1);

    const thinnedTickCount = plotWidth > 0
        ? Math.max(2, Math.min(points.length, Math.floor(plotWidth / X_TICK_MIN_PX)))
        : Math.min(points.length, 2);
    const xTickIndices = Array.from(
        new Set(
            Array.from({ length: thinnedTickCount }, (_, i) =>
                Math.round((i * (points.length - 1)) / Math.max(thinnedTickCount - 1, 1))
            )
        )
    );

    const activePoint = activeIndex !== null ? points[activeIndex] : null;
    const tooltipLeftPx = activeIndex !== null
        ? Math.min(plotWidth - 8, Math.max(8, scaleX(activeIndex) + barWidth / 2))
        : 0;

    const updateActiveFromClientX = (clientX: number, rectLeft: number, rectWidth: number) => {
        if (points.length === 0 || rectWidth === 0) return;
        const ratio = Math.min(1, Math.max(0, (clientX - rectLeft) / rectWidth));
        const index = Math.min(points.length - 1, Math.floor(ratio * points.length));
        setActiveIndex(index);
    };

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === 'touch' && !isPointerDownRef.current) return;
        const rect = event.currentTarget.getBoundingClientRect();
        updateActiveFromClientX(event.clientX, rect.left, rect.width);
    };

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        isPointerDownRef.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        const rect = event.currentTarget.getBoundingClientRect();
        updateActiveFromClientX(event.clientX, rect.left, rect.width);
    };

    const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
        isPointerDownRef.current = false;
        if (event.pointerType === 'touch') setActiveIndex(null);
    };

    const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType !== 'touch') setActiveIndex(null);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (points.length === 0) return;

        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            const current = activeIndex ?? 0;
            const offset = event.key === 'ArrowRight' ? 1 : -1;
            setActiveIndex(Math.min(points.length - 1, Math.max(0, current + offset)));
        } else if (event.key === 'Home') {
            event.preventDefault();
            setActiveIndex(0);
        } else if (event.key === 'End') {
            event.preventDefault();
            setActiveIndex(points.length - 1);
        } else if (event.key === 'Escape') {
            setActiveIndex(null);
        }
    };

    return (
        <div className={style['bar-chart']}>
            {series.length > 1 && (
                <ul className={style['bar-chart__legend']}>
                    {series.map((s) => (
                        <li key={s.key} className={style['bar-chart__legend-item']}>
                            <span
                                className={style['bar-chart__legend-swatch']}
                                style={{ background: `var(${s.colorVar})` }}
                                aria-hidden="true"
                            />
                            {s.label}
                        </li>
                    ))}
                </ul>
            )}

            <div className={style['bar-chart__grid']}>
                <div
                    className={style['bar-chart__y-axis']}
                    style={{ width: `${yAxisWidthCh}ch`, height: plotHeight }}
                >
                    {yTicks.map((tick) => (
                        <span
                            key={tick}
                            className={style['bar-chart__y-label']}
                            style={{ top: scaleY(tick) }}
                        >
                            {formatValue(tick)}
                        </span>
                    ))}
                </div>

                <div className={style['bar-chart__plot']} ref={plotRef} style={{ height: plotHeight }}>
                    {plotWidth > 0 && (
                        <svg
                            className={style['bar-chart__svg']}
                            viewBox={`0 0 ${plotWidth} ${plotHeight}`}
                            aria-hidden="true"
                        >
                            {yTicks.map((tick) => (
                                <line
                                    key={tick}
                                    className={style['bar-chart__gridline']}
                                    x1={0}
                                    y1={scaleY(tick)}
                                    x2={plotWidth}
                                    y2={scaleY(tick)}
                                />
                            ))}

                            <g className={isStale ? style['bar-chart__marks--stale'] : style['bar-chart__marks']}>
                                {points.map((point, index) => {
                                    const nonZeroKeys = series.filter((s) => (point.values[s.key] ?? 0) > 0);
                                    const topKey = nonZeroKeys[nonZeroKeys.length - 1]?.key;
                                    let cumulative = 0;
                                    const x = scaleX(index);

                                    return (
                                        <g key={index}>
                                            {series.map((s) => {
                                                const value = point.values[s.key] ?? 0;
                                                if (value <= 0) return null;

                                                const segTop = scaleY(cumulative + value);
                                                const segBottom = scaleY(cumulative);
                                                cumulative += value;

                                                const gapTop = s.key === topKey ? 0 : SEGMENT_GAP / 2;
                                                const gapBottom = cumulative - value <= 0 ? 0 : SEGMENT_GAP / 2;
                                                const y = segTop + gapTop;
                                                const h = Math.max(segBottom - segTop - gapTop - gapBottom, 0);

                                                return s.key === topKey ? (
                                                    <path
                                                        key={s.key}
                                                        d={roundedTopRectPath(x, y, barWidth, h, CORNER_RADIUS)}
                                                        fill={`var(${s.colorVar})`}
                                                    />
                                                ) : (
                                                    <rect
                                                        key={s.key}
                                                        x={x}
                                                        y={y}
                                                        width={barWidth}
                                                        height={h}
                                                        fill={`var(${s.colorVar})`}
                                                    />
                                                );
                                            })}
                                        </g>
                                    );
                                })}
                            </g>
                        </svg>
                    )}

                    <div
                        className={style['bar-chart__overlay']}
                        tabIndex={0}
                        role="img"
                        aria-label={ariaLabel}
                        onPointerMove={handlePointerMove}
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerLeave}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setActiveIndex((current) => current ?? points.length - 1)}
                        onBlur={() => setActiveIndex(null)}
                    />

                    {activePoint && (
                        <div className={style['bar-chart__tooltip']} style={{ left: tooltipLeftPx }}>
                            <span className={style['bar-chart__tooltip-label']}>{activePoint.label}</span>
                            {series.map((s) => (
                                <div key={s.key} className={style['bar-chart__tooltip-row']}>
                                    <span
                                        className={style['bar-chart__tooltip-key']}
                                        style={{ background: `var(${s.colorVar})` }}
                                        aria-hidden="true"
                                    />
                                    <span className={style['bar-chart__tooltip-series']}>{s.label}</span>
                                    <span className={style['bar-chart__tooltip-value']}>
                                        {formatValue(activePoint.values[s.key] ?? 0)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={style['bar-chart__x-axis']}>
                    {plotWidth > 0 && xTickIndices.map((index) => {
                        const anchor = index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'center';
                        return (
                            <span
                                key={index}
                                className={`${style['bar-chart__x-label']} ${style[`bar-chart__x-label--${anchor}`]}`}
                                style={{ left: scaleX(index) + barWidth / 2 }}
                            >
                                {points[index]?.label}
                            </span>
                        );
                    })}
                </div>
            </div>

            <span className="sr-only" aria-live="polite">
                {activePoint
                    ? `${activePoint.label}: ${series.map((s) => `${s.label} ${formatValue(activePoint.values[s.key] ?? 0)}`).join(', ')}`
                    : ''}
            </span>
        </div>
    );
};
