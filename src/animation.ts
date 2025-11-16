// ========================================================
// animation.ts
// Small helpers for smooth rotation animations.
// ========================================================

import
{
    SMOOTHSTEP_A,
    SMOOTHSTEP_B,
    INTERP_MIN,
    INTERP_MAX,
    ROTATION_DURATION_MS
} from "./constants";

/**
 * Callback invoked every frame with the interpolated angle.
 */
export type RotationUpdate = ( angle: number ) => void;

/**
 * Smoothly animate a rotation from `from` to `to` in `durationMs` using a
 * smoothstep easing curve.
 *
 * @param from - Starting angle in radians.
 * @param to - Target angle in radians.
 * @param durationMs - Duration in milliseconds.
 * @param onUpdate - Called each frame with the new angle.
 * @param onComplete - Optional callback invoked once at the end.
 */
export function animateRotation (
    from: number,
    to: number,
    durationMs: number,
    onUpdate: RotationUpdate,
    onComplete?: ( ) => void
): void
{
    const _start = performance.now ( );
    const _delta = to - from;

    function _step ( now: number )
    {
        const _rawT    = ( now - _start ) / durationMs;

        const _t       = Math.min ( INTERP_MAX, Math.max ( INTERP_MIN, _rawT ) );
        const _eased   = _t * _t * (SMOOTHSTEP_A - SMOOTHSTEP_B * _t);

        const _current = from + _delta * _eased;

        onUpdate ( _current );

        if ( _t < INTERP_MAX )
            requestAnimationFrame ( _step );
        else
            onComplete?.( );
    }

    requestAnimationFrame ( _step );
}
