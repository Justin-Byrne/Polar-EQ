// ====================================================
// tooltip.ts
// Lightweight, reusable tooltip helper for canvas hover info.
// ====================================================

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
    _element.style.background    = "rgba(30,30,30,0.9)";
    _element.style.border        = "1px solid rgba(255,255,255,0.15)";
    _element.style.borderRadius  = "8px";
    _element.style.padding       = "6px 10px";
    _element.style.fontSize      = "13px";
    _element.style.pointerEvents = "none";
    _element.style.color         = "#fff";
    _element.style.opacity       = "0";
    _element.style.transition    = "opacity 0.15s ease";
    _element.style.whiteSpace    = "nowrap";

    document.body.appendChild ( _element );

    return {
        element: _element,
        show ( clientX, clientY, html )
        {
            _element.style.opacity = "1";
            _element.style.left = clientX + 12 + "px";
            _element.style.top = clientY + 12 + "px";
            _element.innerHTML = html;
        },
        hide ( ) { _element.style.opacity = "0"; },
    };
}
