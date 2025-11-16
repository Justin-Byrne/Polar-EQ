// ====================================================
// tooltip.ts
// Lightweight, reusable tooltip helper for canvas hover info.
// ====================================================

import
{
    TOOLTIP_BG_COLOR,
    TOOLTIP_BORDER_COLOR,
    TOOLTIP_BORDER_RADIUS_PX,
    TOOLTIP_PADDING_X,
    TOOLTIP_PADDING_Y,
    TOOLTIP_FONT_SIZE_PX,
    TOOLTIP_OPACITY_HIDDEN,
    TOOLTIP_OPACITY_VISIBLE,
    TOOLTIP_FADE_DURATION_SEC,
    TOOLTIP_OFFSET
} from "./constants";

/**
 * Imperative tooltip API for showing small info panels near the cursor.
 */
export interface Tooltip
{
    readonly element: HTMLDivElement;  /** Underlying DOM element for the tooltip. */

    /**
     * Show tooltip at the given client coordinates.
     *
     * @param clientX - Mouse client X coordinate.
     * @param clientY - Mouse client Y coordinate.
     * @param html - Inner HTML content (may include basic markup).
     */
    show ( clientX: number, clientY: number, html: string ): void;

    hide ( ): void;                    /** Hide the tooltip. */
}

/**
 * Create and attach a tooltip element to `document.body`.
 *
 * The element is styled for dark-overlay usage by default.
 */
export function createTooltip ( ): Tooltip
{
    const _element = document.createElement ( "div" );

    _element.style.position      = "fixed";
    _element.style.background    = TOOLTIP_BG_COLOR;
    _element.style.border        = `1px solid ${TOOLTIP_BORDER_COLOR}`;
    _element.style.borderRadius  = `${TOOLTIP_BORDER_RADIUS_PX}px`;
    _element.style.padding       = `${TOOLTIP_PADDING_Y}px ${TOOLTIP_PADDING_X}px`;
    _element.style.fontSize      = `${TOOLTIP_FONT_SIZE_PX}px`;
    _element.style.pointerEvents = "none";
    _element.style.color         = "#fff";
    _element.style.opacity       = TOOLTIP_OPACITY_HIDDEN.toString ( );
    _element.style.transition    = `opacity ${TOOLTIP_FADE_DURATION_SEC}s ease`;
    _element.style.whiteSpace    = "nowrap";

    document.body.appendChild ( _element );

    return {
        element: _element,
        show ( clientX, clientY, html )
        {
            _element.style.opacity = TOOLTIP_OPACITY_VISIBLE.toString ( );
            _element.style.left    = clientX + TOOLTIP_OFFSET + "px";
            _element.style.top     = clientY + TOOLTIP_OFFSET + "px";
            _element.innerHTML     = html;
        },
        hide ( )
        {
            _element.style.opacity = TOOLTIP_OPACITY_HIDDEN.toString ( );
        }
    };
}
