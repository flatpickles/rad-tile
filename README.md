# Rad Tile

This is a lightweight tool for easily making radial tile patterns, like the [Sandbox logo](https://sandbox.is). Work in progress, project planning below!

## short todo:

-   rename "Paint" -> "Render"
-   show hover (build + render): lighten color
-   show delete selection (build): hide other build strokes and corners, use red color in corner dots
-   deselect on new shape addition and hover snap
-   "apply color" param (render): pick a color and apply it to selected shapes
-   "randomize new color" param (build): boolean, either uses a random new color or the latest "apply color" for new shapes
-   info overlay: click an (i) to learn about what rad tile is (intent, usage, attribution, etc)
-   "tile inset" (render): dial in a pixel size reduction for tiles (polyclip "offset")
-   basic mobile UX:
    -   canvas sizing for safari
    -   tap/drag/release to start/preview/set new corners
    -   button: cancel current tile addition
    -   hide overlay (except info screen)
-   improved mouse wheel scrolling (smoother/slower)
-   styling touch up: typography, theme colors, dark mode, input UIs, cursor over canvas
-   refactor (break down) TileManager

## medium todo:

-   svg & png export
-   start with a shape in the center (param)
-   disable internal anchors for starting / snapping (track hull, or angular saturation for each anchor)
-   snapping:
    -   existing tile edges emerging from last anchor point
    -   angles in space (adjustable, based on repeat count & relative center position)
    -   distances in space (from center, from initial tile corner, from last tile corner)
    -   visualize spatial snapping: polar grid(s)
-   deselect (build) on mouse out and timer expiration (like reset button)
-   persistence for config + composition (local storage)
-   advanced mobile UX:
    -   pinch to zoom
    -   mobile-friendly overlay
    -   button: complete free shape

## long todo:

-   paint palette: build a group of colors for tile color assignment
-   pan + recenter canvas position
-   equilateral mode (during add, for quad & tri)
-   undo / redo

## ideas / someday

-   hotkeys:
    -   repeat count
    -   equilateral
    -   shape type
    -   quad: swap inference direction
-   snapping:
    -   all edges (along hull)
    -   existing lengths & angles within progress tile
-   tips:
    -   "Right-click to finalize free shape input."
-   optional reflection across repeat increments (for even repeat counts, resetting base)
-   allow overlaps, but cut out overlapped shapes when applying
