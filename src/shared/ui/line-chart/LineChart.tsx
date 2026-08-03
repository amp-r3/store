import { useState } from 'react';

import { niceTicks } from './niceTicks';
import style from './line-chart.module.scss';

export interface LineChartPoint {
    /** X-axis label, already formatted by the caller. */
    label: string;
    value: number;
    /** Tooltip text, already formatted by the caller. */
    tooltip: string;
}

interface LineChartProps {
    points: LineChartPoint[];
    /** Accessible description for the chart's role="img". */
    ariaLabel: string;
    /** FULL height including the x-axis label band, not just the plot. */
    height?: number;
    /** How many x-axis labels to show (evenly thinned). */
    xTickCount?: number;
    /** Formatter for y-axis tick labels and the tooltip value. */
    formatValue?: (value: number) => string;
    /** Keeps the previous render dimmed during a refetch instead of a skeleton flash. */
    isStale?: boolean;
}

const VIEWBOX_WIDTH = 600;
const PADDING_LEFT = 48;
const PADDING_RIGHT = 12;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 28;
const Y_TICK_COUNT = 4;

export const LineChart = ({
    points,
    ariaLabel,
    height = 200,
    xTickCount = 6,
    formatValue = (value) => String(value),
    isStale = false,
}: LineChartProps) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const plotWidth = VIEWBOX_WIDTH - PADDING_LEFT - PADDING_RIGHT;
    const plotHeight = height - PADDING_TOP - PADDING_BOTTOM;
    const baselineY = PADDING_TOP + plotHeight;

    // Defends against an all-zero series (a brand-new store with no orders
    // yet) — without the floor of 1, every point would divide by zero.
    const rawMax = Math.max(...points.map((point) => point.value), 1);
    const yTicks = niceTicks(rawMax, Y_TICK_COUNT);
    const scaleMax = yTicks[yTicks.length - 1];

    const scaleX = (index: number) => PADDING_LEFT + (index / Math.max(points.length - 1, 1)) * plotWidth;
    const scaleY = (value: number) => PADDING_TOP + plotHeight - (value / scaleMax) * plotHeight;

    const linePath = points.map((point, index) => `${scaleX(index)},${scaleY(point.value)}`).join(' ');
    const areaPath = points.length > 0
        ? `M ${scaleX(0)},${baselineY} L ${linePath} L ${scaleX(points.length - 1)},${baselineY} Z`
        : '';

    const thinnedTickCount = Math.min(xTickCount, points.length);
    const xTickIndices = Array.from(
        new Set(
            Array.from({ length: thinnedTickCount }, (_, i) =>
                Math.round((i * (points.length - 1)) / Math.max(thinnedTickCount - 1, 1))
            )
        )
    );

    const slotWidth = plotWidth / Math.max(points.length, 1);
    const activePoint = activeIndex !== null ? points[activeIndex] : null;
    const tooltipLeftPct = activeIndex !== null
        ? Math.min(94, Math.max(6, (scaleX(activeIndex) / VIEWBOX_WIDTH) * 100))
        : 0;

    const clearActive = () => setActiveIndex(null);

    return (
        <div className={style['line-chart']}>
            <svg
                className={style['line-chart__svg']}
                viewBox={`0 0 ${VIEWBOX_WIDTH} ${height}`}
                role="img"
                aria-label={ariaLabel}
            >
                {yTicks.map((tick) => {
                    const y = scaleY(tick);
                    return (
                        <g key={tick}>
                            <line
                                className={style['line-chart__gridline']}
                                x1={PADDING_LEFT}
                                y1={y}
                                x2={VIEWBOX_WIDTH - PADDING_RIGHT}
                                y2={y}
                            />
                            <text className={style['line-chart__y-label']} x={PADDING_LEFT - 8} y={y}>
                                {formatValue(tick)}
                            </text>
                        </g>
                    );
                })}

                {/* Grouped so isStale can dim just the data marks during a
                    refetch — axis labels and gridlines stay fully legible. */}
                <g className={isStale ? style['line-chart__marks--stale'] : style['line-chart__marks']}>
                    <path className={style['line-chart__area']} d={areaPath} />
                    <polyline className={style['line-chart__line']} points={linePath} />

                    {activePoint && (
                        <>
                            <line
                                className={style['line-chart__crosshair']}
                                x1={scaleX(activeIndex!)}
                                y1={PADDING_TOP}
                                x2={scaleX(activeIndex!)}
                                y2={baselineY}
                            />
                            <circle
                                className={style['line-chart__active-dot']}
                                cx={scaleX(activeIndex!)}
                                cy={scaleY(activePoint.value)}
                                r={4}
                            />
                        </>
                    )}
                </g>

                {xTickIndices.map((index) => (
                    <text
                        key={index}
                        className={style['line-chart__x-label']}
                        x={scaleX(index)}
                        y={height - PADDING_BOTTOM + 16}
                        textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}
                    >
                        {points[index]?.label}
                    </text>
                ))}

                {points.map((point, index) => (
                    <rect
                        key={index}
                        className={style['line-chart__hit-area']}
                        x={PADDING_LEFT + index * slotWidth}
                        y={PADDING_TOP}
                        width={slotWidth}
                        height={plotHeight}
                        tabIndex={0}
                        role="button"
                        aria-label={`${point.label}: ${point.tooltip}`}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={clearActive}
                        onFocus={() => setActiveIndex(index)}
                        onBlur={clearActive}
                    />
                ))}
            </svg>

            {activePoint && (
                <div
                    className={style['line-chart__tooltip']}
                    style={{ left: `${tooltipLeftPct}%` }}
                >
                    {/* Value leads (bold, high-contrast); the date is secondary —
                        the reader hovered a spot on the timeline, they already
                        know roughly when, they want the number. */}
                    <span className={style['line-chart__tooltip-value']}>{activePoint.tooltip}</span>
                    <span className={style['line-chart__tooltip-label']}>{activePoint.label}</span>
                </div>
            )}
        </div>
    );
};
