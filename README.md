# Rad Tile

This is a lightweight tool for easily making radial tile patterns, like the [Sandbox logo](https://sandbox.is). It's a React app, work in progress!

## short todo:

-   deleting: hover, unselect shape when mousing out // after timeout
-   snap to angles (adjustable, based on repeat count & relative center position)
-   paint mode: select palette and apply colors (new shapes random color from palette)
-   confirm no duplicate points (from anchor set)
-   break down TileManager
-   info screen
-   smooth mouse wheel scrolling

## long todo:

-   start with a shape in the center
-   disable internal points for starting / snapping (track hull)
-   reflection across repeat increments? (for even repeat counts, resetting base?)
-   equilateral mode (during add, for quad & tri)
-   hotkeys:
    -   repeat count
    -   equilateral
    -   shape type
    -   quad: swap inference direction
-   snap to edges / hull
-   snap relative points in progress tile
-   prevent adding shapes that overlap // better overlap behavior
-   mobile layout & UX
-   no overlap mode: snap to edges + remove fully utilized anchors
-   persistence for config + tiles (local storage)
-   ux: better completion instructions for free polygon
-   undo / redo
-   image + svg export
-   perhaps punch up typography, theme colors, dark mode, assorted styling
