import * as polyclip from 'polyclip-ts';

import Color from 'color';
import {
    isLineIntersectingShape,
    isPointInShape,
    Point,
    polygonArea,
    rotatePoint,
    rotatePoints,
} from '../util/Geometry';
import { ShapeType } from './TileManager';

export type AnchorPoint = Point & {
    repeats: number;
    shapes: number;
};

export function newAnchor(point: Point, repeats = 1, shapes = 1): AnchorPoint {
    return {
        ...point,
        repeats: repeats,
        shapes,
    };
}

export type Tile = {
    corners: AnchorPoint[];
    repeats: number;
    color: string;
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

function randomColor() {
    return Color.hsl(Math.random() * 360, 100, 50).toString();
}

export class TileModel {
    anchors: Set<AnchorPoint> = new Set([
        { x: 0, y: 0, repeats: 1, shapes: 0 },
    ]);
    tiles: Tile[] = [];
    progressTile: Tile | null = null;
    minRepeats: number = Infinity;
    currentColor: string = randomColor();

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

    getNearestTileIndex(x: number, y: number): number | null {
        for (let i = this.tiles.length - 1; i >= 0; i--) {
            if (isPointInShape({ x, y }, this.tiles[i].corners)) {
                return i;
            }
        }
        return null;
    }

    removeTileAtIndex(index: number) {
        const [removedTile] = this.tiles.splice(index, 1);
        // Remove anchors that are no longer used (except for the origin)
        removedTile.corners.forEach((corner) => {
            corner.shapes--;
            if (corner.shapes <= 0 && !(corner.x === 0 && corner.y === 0)) {
                this.anchors.delete(corner);
            }
        });
        // Update minRepeats
        let newMinRepeats = Infinity;
        this.tiles.forEach((tile) => {
            newMinRepeats = Math.min(newMinRepeats, tile.repeats);
        });
        this.minRepeats = newMinRepeats;
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
        };
        return this.canCommitTile(this.progressTile);
    }

    commitProgressTile() {
        if (!this.progressTile) {
            throw new Error('No progress tile');
        }

        // Add the new tile, and corners as anchors
        this.progressTile.corners.forEach((corner) => {
            if (this.anchors.has(corner)) {
                corner.shapes++;
            } else {
                this.anchors.add(corner);
            }
        });
        this.tiles.push(this.progressTile);
        this.minRepeats = Math.min(this.minRepeats, this.progressTile.repeats);
        this.progressTile = null;
        this.currentColor = randomColor();
    }

    clear() {
        this.tiles = [];
        this.anchors = new Set([{ x: 0, y: 0, repeats: 1, shapes: 0 }]);
        this.progressTile = null;
        this.minRepeats = Infinity;
    }
}
