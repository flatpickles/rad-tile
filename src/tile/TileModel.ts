import { Point, rotatePoint, rotatePoints } from '../util/Geometry';
import { ShapeType } from './TileManager';

export type AnchorPoint = Point & {
    repetitions: number;
};

export type Tile = {
    corners: Point[];
    repetitions: number;
};

export function tileRotationPoints(tile: Tile): Point[][] {
    const rotatedTilePoints: Point[][] = [];
    const alphaStep = (2 * Math.PI) / tile.repetitions;
    for (let alpha = alphaStep; alpha < 2 * Math.PI; alpha += alphaStep) {
        const rotatedTile = rotatePoints(tile.corners, alpha);
        rotatedTilePoints.push(rotatedTile);
    }
    return rotatedTilePoints;
}

export class TileModel {
    anchors: Set<AnchorPoint> = new Set([{ x: 0, y: 0, repetitions: 0 }]);
    tiles: Tile[] = [];
    progressTile: Tile | null = null;

    getNearestAnchor(
        x: number,
        y: number,
        withinDistance = Infinity,
        excludePoints: Point[] = [],
        includeRotations = false,
    ): Point | null {
        const pointsToCheck: Set<Point> = new Set(this.anchors);
        if (includeRotations) {
            // Add rotations of anchors
            this.anchors.forEach((anchor) => {
                if (anchor.repetitions <= 1) return;
                const alphaStep = (2 * Math.PI) / anchor.repetitions;
                pointsToCheck.add(rotatePoint(anchor, alphaStep));
                pointsToCheck.add(rotatePoint(anchor, -alphaStep));
            });
            // Add rotations of progress tile corners
            if (this.progressTile && this.progressTile.repetitions > 1) {
                const alphaStep = (2 * Math.PI) / this.progressTile.repetitions;
                this.progressTile.corners.forEach((corner) => {
                    pointsToCheck.add(rotatePoint(corner, alphaStep));
                    pointsToCheck.add(rotatePoint(corner, -alphaStep));
                });
            }
        }

        let nearestAnchor: Point | null = null;
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

    setProgressTile(
        corners: Point[],
        shapeType: ShapeType,
        repetitions: number,
    ) {
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
            cornersToUse.splice(2, 0, { x: outerX, y: outerY });
        }
        this.progressTile = {
            corners: cornersToUse,
            repetitions: repetitions,
        };
    }

    commitProgressTile() {
        if (!this.progressTile) {
            throw new Error('No progress tile');
        }

        // Add the new tile, and corners as anchors
        const progressTile = this.progressTile;
        this.tiles.push(progressTile);
        progressTile.corners.forEach((corner) => {
            this.anchors.add({
                x: corner.x,
                y: corner.y,
                repetitions: progressTile.repetitions,
            });
        });
        this.progressTile = null;
    }

    clear() {
        this.tiles = [];
        this.anchors = new Set([{ x: 0, y: 0, repetitions: 0 }]);
        this.progressTile = null;
    }
}
