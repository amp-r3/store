/**
 * Rounds a [0, maxValue] range up to "clean" tick steps (1/2/5 × 10^n), the
 * way every charting library's default axis behaves — 0/1,000/2,000, never
 * 0/847/1,694. Returns ascending ticks from 0 through the rounded-up max, so
 * the last tick IS the axis's scale max (not the raw data max) and the plot
 * always has a little headroom at the top.
 */
export const niceTicks = (maxValue: number, tickCount: number): number[] => {
    if (maxValue <= 0) return [0];

    const rawStep = maxValue / Math.max(tickCount - 1, 1);
    const magnitude = 10 ** Math.floor(Math.log10(rawStep));
    const residual = rawStep / magnitude;

    let step: number;
    if (residual > 5) step = 10 * magnitude;
    else if (residual > 2) step = 5 * magnitude;
    else if (residual > 1) step = 2 * magnitude;
    else step = magnitude;

    const niceMax = Math.ceil(maxValue / step) * step;
    const ticks: number[] = [];
    for (let value = 0; value <= niceMax + step / 2; value += step) {
        ticks.push(Math.round(value * 100) / 100);
    }
    return ticks;
};
