// ========================================================
// types.ts
// Core shared type definitions for the polar EQ visualizer.
// ========================================================

/**
 * Describes a single polar cell: one ring-sector tile on the analyzer grid.
 */
export interface PolarCell
{
    id:         string;                /** Stable identifier, e.g. "ring-sector". */
    ring:       number;                /** Zero-based ring index (0 is inner ring). */
    sector:     number;                /** Zero-based sector index (0 is at rotation offset). */
    innerRing:  number;                /** Inner radius of this cell in canvas pixels. */
    outerRing:  number;                /** Outer radius of this cell in canvas pixels. */
    startAngle: number;                /** Start angle in radians (canvas polar space). */
    endAngle:   number;                /** End angle in radians (canvas polar space). */
    centerX:    number;                /** Precomputed center X coordinate of the cell. */
    centerY:    number;                /** Precomputed center Y coordinate of the cell. */
}
