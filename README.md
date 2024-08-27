# Rad Tile

This is a lightweight tool for easily making radial tile patterns, like the [Sandbox logo](https://sandbox.is). It's a React app, work in progress!

## short todo:

-   deleting: hover, unselect shape when mousing out // after timeout
-   paint mode: select palette and apply colors (new shapes random color from palette)
-   snap to angles (adjustable, based on repeat count & relative center position)
-   confirm no duplicate points (from anchor set)
-   break down TileManager
-   info screen (describing what Rad Tile is)
-   smooth mouse wheel scrolling
-   cursor updates over canvas
-   persistence for config + tiles (local storage)

## long todo:

-   start with a shape in the center
-   disable internal points for starting / snapping (track hull)
-   pan + recenter
-   reflection across repeat increments? (for even repeat counts, resetting base?)
-   equilateral mode (during add, for quad & tri)
-   hotkeys:
    -   repeat count
    -   equilateral
    -   shape type
    -   quad: swap inference direction
-   snap to edges / hull
-   snap relative points in progress tile
-   mobile layout & UX (tap & drag)
    -   cancel input? (e.g. non-committable free shape)
-   allow overlaps, but cut out overlapped shapes when applying
-   no overlap mode: snap to edges + remove fully utilized anchors
-   ux: better completion instructions for free polygon
-   undo / redo
-   image + svg export
-   perhaps punch up typography, theme colors, dark mode, assorted styling

## tips:

Tips in the UI could include:

-   Right-click to finalize free shape input.
