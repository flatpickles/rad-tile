import * as polyclip from 'polyclip-ts';

import Color from 'color';
import {
    isLineIntersectingShape,
    isPointInShape,
    Point,
    polygonArea,
    polygonWindingClockwise,
    rotatePoint,
    rotatePoints,
} from '../util/Geometry';
import { ShapeType } from './TileTypes';

export type AnchorPoint = Point & {
    repeats: number;
    tileIds: string[];
};

export function newAnchor(point: Point, repeats = 1): AnchorPoint {
    return {
        ...point,
        repeats: repeats,
        tileIds: [],
    };
}

export type Tile = {
    corners: AnchorPoint[];
    repeats: number;
    color: string;
    id: string;
    isCenter: boolean;
};

export function tileRotationPoints(tile: Tile): Point[][] {
    const rotatedTilePoints: Point[][] = [];
    const alphaStep = (2 * Math.PI) / tile.repeats;
    for (let step = 1; step < tile.repeats; step++) {
        const alpha = step * alphaStep;
        const rotatedTile = rotatePoints(tile.corners, alpha);
        rotatedTilePoints.push(rotatedTile);
    }
    return rotatedTilePoints;
}

function getCenterTile(pointCount: number, radius = 100): Tile {
    const center = { x: 0, y: 0 };
    const corners = Array.from({ length: pointCount }, (_, i) => {
        const angle = (2 * Math.PI * i) / pointCount;
        return {
            x: center.x + Math.cos(angle) * radius,
            y: center.y + Math.sin(angle) * radius,
            repeats: 1,
            tileIds: [],
        };
    });
    return {
        corners,
        repeats: 1,
        color: randomColor(),
        id: crypto.randomUUID(),
        isCenter: true,
    };
}

function randomColor() {
    return Color.hsl(Math.random() * 360, 100, 45).toString();
}

export class TileModel {
    anchors: Set<AnchorPoint> = new Set([
        { x: 0, y: 0, repeats: 1, tileIds: [] },
    ]);
    tiles: Tile[] = [];
    progressTile: Tile | null = null;
    minRepeats: number = Infinity;
    currentColor: string = randomColor();
    currentId: string = crypto.randomUUID();

    initializeWithStartTile(pointCount: number) {
        this.clear();
        this.anchors = new Set();
        this.progressTile = getCenterTile(pointCount);
        this.commitProgressTile();
        this.minRepeats = pointCount; // todo: allow for higher repeats
    }

    getNearestAnchor(
        x: number,
        y: number,
        withinDistance = Infinity,
        excludePoints: Point[] = [],
        includeRepeats = false,
        newAnchorRepeats = 1,
    ): AnchorPoint | null {
        const pointsToCheck: Set<AnchorPoint> = new Set(this.anchors);
        if (includeRepeats) {
            // Add repeats of anchors
            this.anchors.forEach((anchor) => {
                if (anchor.repeats <= 1) return;
                const alphaStep = (2 * Math.PI) / anchor.repeats;
                pointsToCheck.add(
                    newAnchor(rotatePoint(anchor, alphaStep), newAnchorRepeats),
                );
                pointsToCheck.add(
                    newAnchor(
                        rotatePoint(anchor, -alphaStep),
                        newAnchorRepeats,
                    ),
                );
            });
            // Add repeats of progress tile corners
            if (this.progressTile && this.progressTile.repeats > 1) {
                const alphaStep = (2 * Math.PI) / this.progressTile.repeats;
                this.progressTile.corners.forEach((corner) => {
                    pointsToCheck.add(
                        newAnchor(
                            rotatePoint(corner, alphaStep),
                            newAnchorRepeats,
                        ),
                    );
                    pointsToCheck.add(
                        newAnchor(
                            rotatePoint(corner, -alphaStep),
                            newAnchorRepeats,
                        ),
                    );
                });
            }
        }

        let nearestAnchor: AnchorPoint | null = null;
        let nearestDistance = Infinity;
        for (const anchor of pointsToCheck) {
            // Skip points that should be excluded
            let skip = false;
            excludePoints.forEach((excludePoint) => {
                if (anchor.x == excludePoint.x && anchor.y == excludePoint.y) {
                    skip = true;
                }
            });
            if (skip) continue;

            // Calculate distance to the anchor
            const distance = Math.sqrt(
                (x - anchor.x) ** 2 + (y - anchor.y) ** 2,
            );
            if (distance < nearestDistance && distance < withinDistance) {
                nearestDistance = distance;
                nearestAnchor = anchor;
            }
        }
        return nearestAnchor;
    }

    canCommitTile(tile: Tile): boolean {
        // todo: make more efficient (memoize rotations, avoid excessive maps etc)
        // todo: factor stuff out, including a centralized epsilon value / decimal precision

        // polyclip is sensitive to floating point precision, so let's do some rounding and hope
        const DECIMAL_PLACES = 5;
        const EPSILON = 1 / 10 ** DECIMAL_PLACES; // Small value to account for floating-point precision

        // We'll translate everything into GeoJSON format
        const newShape: polyclip.Geom = [
            [
                tile.corners.map((c) => [
                    Number(c.x.toFixed(DECIMAL_PLACES)),
                    Number(c.y.toFixed(DECIMAL_PLACES)),
                ]),
            ],
        ];
        // Start with the rotations of the new tile
        const testShapes: polyclip.Geom[] = tileRotationPoints(tile).map(
            (rotatedTile) => [
                [
                    rotatedTile.map((c) => [
                        Number(c.x.toFixed(DECIMAL_PLACES)),
                        Number(c.y.toFixed(DECIMAL_PLACES)),
                    ]),
                ],
            ],
        );
        // Add all tiles and their rotations
        this.tiles.forEach((tile) => {
            testShapes.push([
                [
                    tile.corners.map((c) => [
                        Number(c.x.toFixed(DECIMAL_PLACES)),
                        Number(c.y.toFixed(DECIMAL_PLACES)),
                    ]),
                ],
            ]);
            const rotatedTiles = tileRotationPoints(tile);
            rotatedTiles.forEach((rotatedTile) => {
                testShapes.push([
                    [
                        rotatedTile.map((c) => [
                            Number(c.x.toFixed(DECIMAL_PLACES)),
                            Number(c.y.toFixed(DECIMAL_PLACES)),
                        ]),
                    ],
                ]);
            });
        });
        // Check for intersections
        for (const testShape of testShapes) {
            try {
                const intersection = polyclip.intersection(newShape, testShape);
                if (intersection.length > 0) {
                    const area = intersection.reduce(
                        (sum: number, poly: polyclip.Geom) => {
                            return (
                                sum +
                                Math.abs(polygonArea(poly[0] as number[][]))
                            );
                        },
                        0,
                    );
                    if (area > EPSILON) {
                        return false;
                    }
                }
            } catch (e) {
                console.error(e);
                return false;
            }
        }
        return true;
    }

    canCommitLine(line: [Point, Point]): boolean {
        const testShapes: Point[][] = [
            ...this.tiles.map((tile) => tile.corners),
            ...this.tiles.flatMap((tile) => tileRotationPoints(tile)),
        ];
        for (const testShape of testShapes) {
            if (isLineIntersectingShape(line[0], line[1], testShape)) {
                return false;
            }
        }
        return true;
    }

    getNearestTile(
        x: number,
        y: number,
        withPointRotations = false,
    ): Tile | null {
        for (let i = this.tiles.length - 1; i >= 0; i--) {
            const shapesToCheck = withPointRotations
                ? [...tileRotationPoints(this.tiles[i]), this.tiles[i].corners]
                : [this.tiles[i].corners];
            for (const shape of shapesToCheck) {
                if (isPointInShape({ x, y }, shape)) {
                    return this.tiles[i];
                }
            }
        }
        return null;
    }

    removeTileWithId(id: string): boolean {
        // Find the tile
        const index = this.tiles.findIndex((tile) => tile.id === id);

        // If the tile is not found or cannot be removed, return false
        if (index === -1) {
            return false;
        }
        if (this.tiles[index].isCenter) {
            return false;
        }

        // Otherwise, remove the tile
        const [removedTile] = this.tiles.splice(index, 1);

        // Remove anchors that are no longer used (except for the origin)
        removedTile.corners.forEach((corner) => {
            corner.tileIds = corner.tileIds.filter((tileId) => tileId !== id);
            if (
                corner.tileIds.length === 0 &&
                !(corner.x === 0 && corner.y === 0)
            ) {
                this.anchors.delete(corner);
            }
        });

        // Update minRepeats
        let newMinRepeats = Infinity;
        this.tiles.forEach((tile) => {
            if (tile.isCenter) return;
            newMinRepeats = Math.min(newMinRepeats, tile.repeats);
        });
        this.minRepeats = newMinRepeats;

        // Mission complete
        return true;
    }

    setProgressTile(
        corners: AnchorPoint[],
        shapeType: ShapeType,
        repeats: number,
    ): boolean {
        if (corners.length < 3) {
            throw new Error(
                'Cannot set progress tile with fewer than 3 corners',
            );
        }
        const cornersToUse = corners;
        if (shapeType === 'quad') {
            if (corners.length !== 3) {
                throw new Error(
                    'Invalid number of corners for parallelogram (quad)',
                );
            }

            // Calculate the outer corner
            const innerX = corners[0].x;
            const innerY = corners[0].y;
            const midpointX = (corners[1].x + corners[2].x) / 2;
            const midpointY = (corners[1].y + corners[2].y) / 2;
            const outerX = innerX + (midpointX - innerX) * 2;
            const outerY = innerY + (midpointY - innerY) * 2;

            // Add outer corner to cornersToUse
            cornersToUse.splice(
                2,
                0,
                newAnchor({ x: outerX, y: outerY }, repeats),
            );
        }
        this.progressTile = {
            corners: cornersToUse,
            repeats,
            color: this.currentColor,
            id: this.currentId,
            isCenter: false,
        };
        return this.canCommitTile(this.progressTile);
    }

    commitProgressTile() {
        if (!this.progressTile) {
            throw new Error('No progress tile');
        }
        const newTile = this.progressTile;
        this.progressTile = null;

        // Ensure tiles are committed with counter-clockwise winding order
        const windingClockwise = polygonWindingClockwise(newTile.corners);
        if (windingClockwise) {
            newTile.corners.reverse();
        }

        // Add the new tile, and corners as anchors
        newTile.corners.forEach((corner) => {
            if (this.anchors.has(corner)) {
                corner.tileIds.push(newTile.id);
            } else {
                this.anchors.add(corner);
                corner.tileIds.push(newTile.id);
            }
        });
        this.tiles.push(newTile);
        this.minRepeats = Math.min(this.minRepeats, newTile.repeats);
        this.currentColor = randomColor();
        this.currentId = crypto.randomUUID();
    }

    clear() {
        this.tiles = [];
        this.anchors = new Set([{ x: 0, y: 0, repeats: 1, tileIds: [] }]);
        this.progressTile = null;
        this.minRepeats = Infinity;
    }

    getViewBox(): [number, number, number, number] {
        const allPoints: Point[] = [
            ...this.tiles.map((tile) => tile.corners),
            ...this.tiles.flatMap((tile) => tileRotationPoints(tile)),
        ].flat();
        const minX = Math.min(...allPoints.map((point) => point.x));
        const minY = Math.min(...allPoints.map((point) => point.y));
        const maxX = Math.max(...allPoints.map((point) => point.x));
        const maxY = Math.max(...allPoints.map((point) => point.y));
        return [minX, minY, maxX, maxY];
    }
}
