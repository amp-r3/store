import { KeyboardEvent, PointerEvent, useRef, useState } from 'react';

import { niceTicks } from '@/shared/lib';
import { useElementWidth } from '@/shared/lib/hooks';

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
  /** FULL height including the x-axis label row, not just the plot. */
  height?: number;
  /** Formatter for y-axis tick labels. */
  formatValue?: (value: number) => string;
  /** Keeps the previous render dimmed during a refetch instead of a skeleton flash. */
  isStale?: boolean;
}

const X_AXIS_ROW_HEIGHT = 24;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 8;
const PADDING_X = 6;
const Y_TICK_COUNT = 4;
// Below this, an x-axis tick's date label starts colliding with its neighbor.
const X_TICK_MIN_PX = 72;

export const LineChart = ({
  points,
  ariaLabel,
  height = 200,
  formatValue = (value) => String(value),
  isStale = false,
}: LineChartProps) => {
  const { ref: plotRef, width: plotWidth } = useElementWidth<HTMLDivElement>();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isPointerDownRef = useRef(false);

  const plotHeight = height - X_AXIS_ROW_HEIGHT;
  const topY = PADDING_TOP;
  const baselineY = plotHeight - PADDING_BOTTOM;

  // Defends against an all-zero series (a brand-new store with no orders
  // yet) — without the floor of 1, every point would divide by zero.
  const rawMax = Math.max(...points.map((point) => point.value), 1);
  const yTicks = niceTicks(rawMax, Y_TICK_COUNT);
  const scaleMax = yTicks[yTicks.length - 1];

  const scaleY = (value: number) => baselineY - (value / scaleMax) * (baselineY - topY);
  const scaleX = (index: number) =>
    PADDING_X + (index / Math.max(points.length - 1, 1)) * Math.max(plotWidth - PADDING_X * 2, 0);

  const linePath = points
    .map((point, index) => `${scaleX(index)},${scaleY(point.value)}`)
    .join(' ');
  const areaPath =
    points.length > 0
      ? `M ${scaleX(0)},${baselineY} L ${linePath} L ${scaleX(points.length - 1)},${baselineY} Z`
      : '';

  // Widest tick determines the y-axis column's width; formatValue's
  // tabular-nums keeps every digit the same width so `ch` sizing is accurate.
  const yAxisWidthCh = Math.max(...yTicks.map((tick) => formatValue(tick).length), 1);

  const thinnedTickCount =
    plotWidth > 0
      ? Math.max(2, Math.min(points.length, Math.floor(plotWidth / X_TICK_MIN_PX)))
      : Math.min(points.length, 2);
  const xTickIndices = Array.from(
    new Set(
      Array.from({ length: thinnedTickCount }, (_, i) =>
        Math.round((i * (points.length - 1)) / Math.max(thinnedTickCount - 1, 1)),
      ),
    ),
  );

  const activePoint = activeIndex !== null ? points[activeIndex] : null;
  const tooltipLeftPx =
    activeIndex !== null ? Math.min(plotWidth - 8, Math.max(8, scaleX(activeIndex))) : 0;

  const updateActiveFromClientX = (clientX: number, rectLeft: number, rectWidth: number) => {
    if (points.length === 0 || rectWidth === 0) return;
    const ratio = Math.min(1, Math.max(0, (clientX - rectLeft) / rectWidth));
    const index = Math.round(ratio * (points.length - 1));
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
    <div className={style['line-chart']}>
      <div
        className={style['line-chart__y-axis']}
        style={{ width: `${yAxisWidthCh}ch`, height: plotHeight }}
      >
        {yTicks.map((tick) => (
          <span key={tick} className={style['line-chart__y-label']} style={{ top: scaleY(tick) }}>
            {formatValue(tick)}
          </span>
        ))}
      </div>

      <div className={style['line-chart__plot']} ref={plotRef} style={{ height: plotHeight }}>
        {plotWidth > 0 && (
          <svg
            className={style['line-chart__svg']}
            viewBox={`0 0 ${plotWidth} ${plotHeight}`}
            aria-hidden="true"
          >
            {yTicks.map((tick) => (
              <line
                key={tick}
                className={style['line-chart__gridline']}
                x1={0}
                y1={scaleY(tick)}
                x2={plotWidth}
                y2={scaleY(tick)}
              />
            ))}

            {/* Grouped so isStale can dim just the data marks during a
                            refetch — gridlines stay fully legible. */}
            <g className={isStale ? style['line-chart__marks--stale'] : style['line-chart__marks']}>
              <path className={style['line-chart__area']} d={areaPath} />
              <polyline className={style['line-chart__line']} points={linePath} />

              {activePoint && (
                <>
                  <line
                    className={style['line-chart__crosshair']}
                    x1={scaleX(activeIndex!)}
                    y1={topY}
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
          </svg>
        )}

        <div
          className={style['line-chart__overlay']}
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
          <div className={style['line-chart__tooltip']} style={{ left: tooltipLeftPx }}>
            {/* Value leads (bold, high-contrast); the date is secondary —
                            the reader hovered a spot on the timeline, they already
                            know roughly when, they want the number. */}
            <span className={style['line-chart__tooltip-value']}>{activePoint.tooltip}</span>
            <span className={style['line-chart__tooltip-label']}>{activePoint.label}</span>
          </div>
        )}
      </div>

      <div className={style['line-chart__x-axis']}>
        {plotWidth > 0 &&
          xTickIndices.map((index) => {
            const anchor = index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'center';
            return (
              <span
                key={index}
                className={`${style['line-chart__x-label']} ${style[`line-chart__x-label--${anchor}`]}`}
                style={{ left: scaleX(index) }}
              >
                {points[index]?.label}
              </span>
            );
          })}
      </div>

      <span className="sr-only" aria-live="polite">
        {activePoint ? `${activePoint.label}: ${activePoint.tooltip}` : ''}
      </span>
    </div>
  );
};
