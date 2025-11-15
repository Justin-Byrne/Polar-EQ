// ========================================================
// utils.ts
// Small math helpers for decibels and logarithmic frequency ranges.
// ========================================================

/**
 * Convert a byte magnitude (0–255) to dBFS (−∞..0), clamped at −60 dB.
 *
 * @param value - Magnitude from the analyser (0–255).
 * @returns dBFS value in the range [−60, 0].
 */
export const dbFromByte = ( value: number ): number =>
  value <= 0 ? -60 : 20 * Math.log10 ( value / 255 );

/**
 * Normalize a dBFS value into [0, 1] assuming an input range of [−60, 0].
 *
 * @param db - Input dBFS value (typically from {@link dbFromByte}).
 */
export const norm01FromDb = ( db: number ): number =>
  Math.max ( 0, Math.min ( 1, ( db + 60 ) / 60 ) );

/**
 * Map normalized amplitude [0, 1] to display dB in [−12, +12].
 *
 * This is the visual "feel" range used by the polar grid.
 */
export const displayDb = ( number: number ): number =>
  - 12 + number * 24;

/**
 * Compute logarithmic frequency boundaries across `sectors`
 * from 20 Hz up to the Nyquist frequency.
 *
 * @param sampleRate - Audio sample rate from the context.
 * @param sectors - Number of sectors (bands) to split into.
 * @returns Array of length `sectors + 1` containing Hz boundaries.
 */
export const logFreqBounds = (
    sampleRate: number,
    sectors:    number
): number [ ] =>
{
    const _freqMin = 20;
    const _freqMax = sampleRate / 2;
    const _logMin  = Math.log10 ( _freqMin );
    const _logMax  = Math.log10 ( _freqMax );

    return Array.from ( { length: sectors + 1 }, ( _, i ) =>
             10 ** ( _logMin + ( i / sectors ) * ( _logMax - _logMin ) ) );
};
