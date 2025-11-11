/** Convert byte magnitude (0–255) to dBFS (−∞..0) clamped at −60 dB. */
export const dbFromByte = ( v: number ): number => v <= 0 ? -60 : 20 * Math.log10(v / 255);

/** Normalize dBFS to 0–1 using [−60..0]. */
export const norm01FromDb = ( db: number ): number => Math.max ( 0, Math.min ( 1, ( db + 60 ) / 60 ) );

/** Map normalized amplitude to display dB (−12..+12). */
export const displayDb = ( n: number ): number => -12 + n * 24;

/** Compute logarithmic frequency boundaries (20 Hz → Nyquist). */
export const logFreqBounds = ( sampleRate: number, sectors: number ): number [ ] =>
{
    const _freqMin = 20;
    const _freqMax = sampleRate / 2;
    const _logMin  = Math.log10 ( _freqMin );
    const _logMax  = Math.log10 ( _freqMax );

    return Array.from ( { length: sectors + 1 }, ( _, i ) => 10 ** ( _logMin + ( i / sectors ) * ( _logMax - _logMin ) ) );
};
