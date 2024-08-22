# Rad Tile

This is a lightweight tool for easily making radial tile patterns, like the [Sandbox logo](https://sandbox.is). It's a React app, work in progress!

## short todo:

-   snap to angles (adjustable, based on repeat count & relative center position)
-   delete tiles (remove mode; set base to min repeat of all tiles)
-   color schemes (randomize?)
-   confirm no duplicate points (from anchor set)
-   break down TileManager
-   info screen
-   typography, theme colors, dark mode, assorted styling

## long todo:

-   start with a shape in the center
-   disable internal points for starting / snapping (track hull)
-   reflection across repeat increments? (for even repeat counts, resetting base?)
-   equilateral mode (during add, for quad & tri)
-   hotkeys: repeat count, equilateral, shape, etc
-   snap to edges / hull
-   snap relative points in progress tile
-   prevent adding shapes that overlap // better overlap behavior
-   mobile layout & UX
-   no overlap mode: snap to edges + remove fully utilized anchors
-   persistence for config + tiles (local storage)
-   ux: better completion instructions for free polygon
-   undo / redo
-   image + svg export
