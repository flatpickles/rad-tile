# Rad Tile

This is a lightweight tool for easily making radial tile patterns, like the [Sandbox logo](https://sandbox.is). Work in progress, project planning below!

## short todo:

-   cursor over canvas
-   improve TileRenderer (factor out direct manager dependency, perhaps)
-   favicon

## medium todo:

-   svg & png export
-   persistence for config + composition (local storage)
-   info overlay: click an (i) to learn about what rad tile is (intent, usage, attribution, etc)
-   disable internal anchors for starting / snapping (track hull, or angular saturation for each anchor)
-   deselect (build) on mouse out and timer expiration (like reset button)
-   ux bug: can't delete tiny tiles
-   basic mobile UX:
    -   canvas/page sizing for safari
    -   tap/drag/release to start/preview/set new corners
    -   button: cancel current tile addition
    -   hide overlay (except info screen)
-   snapping:
    -   existing tile edges emerging from last anchor point
    -   angles in space (adjustable, based on repeat count & relative center position)
    -   distances in space (from center, from initial tile corner, from last tile corner)
    -   far corner of parallelogram progress tiles
    -   visualize spatial snapping: polar grid(s)

## long todo:

-   advanced mobile UX:
    -   pinch to zoom
    -   mobile-friendly overlay
    -   button: complete free shape
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
