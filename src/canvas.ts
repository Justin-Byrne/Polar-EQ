import type { PolarCell } from "./types";

/** Build the 24×24 polar grid of cells. */
export function buildShapes ( rings: number, sectors: number, center: { x: number; y: number }, radius: number ): PolarCell[]
{
    const _result: PolarCell [ ] = new Array;

    const _ringStep   = radius / rings;
    const _sectorStep = ( Math.PI * 2 ) / sectors;

    const ROTATE_UP   = - Math.PI / 2;

    for ( let _ring = 0; _ring < rings; _ring++ )
    {
        const _innerRing = _ring * _ringStep;
        const _outerRing = ( _ring + 1 ) * _ringStep;

        for ( let _sector = 0; _sector < sectors; _sector++ )
        {
            const _startAngle  = _sector * _sectorStep + ROTATE_UP;
            const _endAngle    = ( _sector + 1 ) * _sectorStep + ROTATE_UP;
            const _middleRing  = ( _innerRing + _outerRing ) / 2;
            const _middleAngle = ( _startAngle + _endAngle ) / 2;

            _result.push (
            {
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

/** Construct a Path2D for a given polar cell. */
export function pathForCell ( cell: PolarCell, center: { x: number; y: number } ): Path2D
{
    const _path = new Path2D ( );

          _path.arc ( center.x, center.y, cell.innerRing, cell.startAngle, cell.endAngle, false );
          _path.lineTo ( center.x + Math.cos ( cell.endAngle ) * cell.outerRing, center.y + Math.sin ( cell.endAngle ) * cell.outerRing );
          _path.arc ( center.x, center.y, cell.outerRing, cell.endAngle, cell.startAngle, true );
          _path.closePath ( );

    return _path;
}

/** Map amplitude to hue (green→yellow→red). */
export function colorForDb ( decibel: number ): string
{
    const _t     = ( Math.max ( - 12, Math.min ( 12, decibel ) ) + 12 ) / 24;  // Interpolation factor
    const _hue   = 120 - 120 * _t;
    const _light = 40 + 40 * _t;

    return `hsl(${_hue},100%,${_light}%)`;
}
