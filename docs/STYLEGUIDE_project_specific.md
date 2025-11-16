# Polar EQ Visualizer -- Code Style Guide

## 1. General Principles

-   Prefer clear, descriptive names using `camelCase` for variables and
    functions.
-   Group related code into well‑labeled sections using banner comments
    such as `//// GRAPHICS ////`.
-   Use `const` for values that never change; use `let` for stateful
    variables.
-   Avoid magic numbers; define configuration at the top of each module.
-   Keep functions small and focused on a single responsibility.

## 2. File & Module Organization

-   Each logical subsystem (audio, animation, canvas, main UI logic)
    resides in its own file.
-   Public APIs are exported explicitly; internal helpers remain
    file‑local.
-   Maintain clear headers indicating file purpose and responsibilities.

## 3. Naming Conventions

-   **Constants:** UPPER_SNAKE_CASE (e.g., `RINGS`, `SECTORS`)
-   **Configuration variables:** UPPER_SNAKE_CASE near the top of
    modules.
-   **Runtime state:** `camelCase` (`rotationOffset`, `animating`)
-   **Private/internal locals:** prefixed with `_` (e.g., `_max`,
    `_delta`) to signal temporary or internal values.
-   **Types and interfaces:** PascalCase (`PolarCell`,
    `AudioEnvironment`)
-   **Functions:** camelCase, verbs where appropriate (`drawGrid`,
    `bindTooltip`, `setSectorAlignment`)

## 4. Commenting & Documentation

-   Use JSDoc for all public functions.
-   Include parameter and return descriptions.
-   Include high‑level block comments above major functionality
    sections.
-   In combined builds, ensure each original file is clearly delimited
    by headers.

## 5. Geometry & Rendering Conventions

-   Centralize canvas context, center coordinates, and derived geometry
    values at the start.
-   Favor pure helper functions for geometry (`buildShapes`,
    `pathForCell`).
-   Always save/restore canvas state when applying compositing,
    gradients, or transformations.
-   Use HSL or rgba strings for consistent color definitions.

## 6. Animation Guidelines

-   Use requestAnimationFrame exclusively for visual updates.
-   Implement smoothstep or similar easing curves for motion.
-   Keep animation state (`rotationOffset`, `targetRotation`) explicit
    rather than relying on implicit globals.

## 7. Audio Processing Style

-   Do not assume microphone presence; guard start/stop logic.
-   Normalize analyzer data consistently using helper functions
    (`dbFromByte`, `norm01FromDb`).
-   Maintain arrays for per‑sector maxima, peaks, and last‑displayed
    values.

## 8. UI & Interaction Patterns

-   Centralize DOM element lookups into an `ELEMENTS` object.
-   Use typed element references (e.g., `as HTMLCanvasElement`).
-   Bind events in dedicated helpers (`bindTooltip`, button event
    assignments).
-   Prefer declarative UI state helpers (e.g., `setStatus(live)`).

## 9. Error Prevention & Safety

-   Guard early returns (`if (!AudioEnvironment) return;`).
-   Always clamp indices for FFT bin extraction.
-   Ensure all exported functions behave safely even if called in
    unexpected order.

## 10. Exporting & Tools

-   Provide explicit exporters (`exportShapes`) with clear naming and
    file suffix.
-   Revoke object URLs when finished.
-   When adding new utilities, place them in the appropriate module
    (audio, animation, canvas, utils).
