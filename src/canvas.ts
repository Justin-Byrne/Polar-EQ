// ========================================================
// canvas.ts
// Geometry helpers for the polar grid + color mapping.
// ========================================================

import type { PolarCell } from "./types";

import
{
    FULL_TURN_RAD,
    DEFAULT_ROTATION_UP,
    DISPLAY_DB_MIN,
    DISPLAY_DB_MAX,
    DISPLAY_DB_RANGE,
    HUE_GREEN_DEG,
    LIGHTNESS_BASE,
    LIGHTNESS_RANGE,
    GRID_LINE_OPACITY,
    CELL_STROKE_OPACITY
} from "./constants";

/**
 * Build a polar grid of cells (rings × sectors).
 *
 * @param rings          - Number of radial rings.
 * @param sectors        - Number of angular sectors.
 * @param center         - Canvas center in pixels.
 * @param radius         - Outer radius of the grid in pixels.
 * @param rotationOffset - Rotation applied to all sectors (radians).
 * @returns An array of {@link PolarCell} describing each tile.
 */
export function buildShapes (
    rings: number,
    sectors: number,
    center: { x: number; y: number },
    radius: number,
    rotationOffset = - Math.PI / 2
): PolarCell [ ]
{
    const _result: PolarCell [ ] = new Array;

    const _ringStep   = radius / rings;
    const _sectorStep = FULL_TURN_RAD / sectors;

    for ( let _ring = 0; _ring < rings; _ring++ )
    {
        const _innerRing = _ring * _ringStep;
        const _outerRing = ( _ring + 1 ) * _ringStep;

        for ( let _sector = 0; _sector < sectors; _sector++ )
        {
            const _startAngle  = _sector * _sectorStep + rotationOffset;
            const _endAngle    = ( _sector + 1 ) * _sectorStep + rotationOffset;
            const _middleRing  = ( _innerRing + _outerRing ) / 2;
            const _middleAngle = ( _startAngle + _endAngle ) / 2;

            _result.push ( {
                id:         `${_ring}-${_sector}`,
                ring:       _ring,
                sector:     _sector,
                innerRing:  _innerRing,
                outerRing:  _outerRing,
                startAngle: _startAngle,
                endAngle:   _endAngle,
                centerX:    center.x + Math.cos ( _middleAngle ) * _middleRing,
                centerY:    center.y + Math.sin ( _middleAngle ) * _middleRing
            } );
        }
    }

    return _result;
}

/**
 * Construct a `Path2D` representing the ring-sector wedge for a given cell.
 *
 * @param cell   - Polar cell definition.
 * @param center - Canvas center.
 */
export function pathForCell (
    cell:   PolarCell,
    center: { x: number; y: number }
): Path2D
{
    const _path = new Path2D ( );

    _path.arc (
        center.x,
        center.y,
        cell.innerRing,
        cell.startAngle,
        cell.endAngle,
        false
    );

    _path.lineTo (
        center.x + Math.cos ( cell.endAngle ) * cell.outerRing,
        center.y + Math.sin ( cell.endAngle ) * cell.outerRing
    );

    _path.arc (
        center.x,
        center.y,
        cell.outerRing,
        cell.endAngle,
        cell.startAngle,
        true
    );

    _path.closePath ( );

    return _path;
}

/**
 * Map a dB threshold into a color in the green→yellow→red range.
 *
 * The input is gently clamped to [−12, +12] for visual stability.
 */
export function colorForDb ( decibel: number ): string
{
    const _clamped = Math.max ( DISPLAY_DB_MIN, Math.min ( DISPLAY_DB_MAX, decibel ) );
    const _t       = ( _clamped - DISPLAY_DB_MIN ) / DISPLAY_DB_RANGE;  // Interpolation factor; 0..1

    const _hue     = HUE_GREEN_DEG - HUE_GREEN_DEG * _t;       // 120 (green) → 0 (red)
    const _light   = LIGHTNESS_BASE + LIGHTNESS_RANGE * _t;  // slightly brighter as it gets louder

    return `hsl(${_hue},100%,${_light}%)`;
}
