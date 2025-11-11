/** Polar cell describing one ring-sector tile on the analyzer grid. */
export interface PolarCell
{
    id:         string;
    ring:       number;
    sector:     number;
    innerRing:  number;
    outerRing:  number;
    startAngle: number;
    endAngle:   number;
    centerX:    number;
    centerY:    number;
}
