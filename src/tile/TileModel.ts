export type Point = {
    x: number;
    y: number;
    // todo: track connected tiles for deletion?
};

export type AnchorPoint = Point & {
    repetitions: number;
};

export type Tile = {
    corners: [
        Point, // inner anchor
        Point, // left anchor (counterclockwise)
        Point, // right anchor (clockwise)
        Point, // outer anchor
    ];
    repetitions: number;
};

export function rotateTile(tile: Tile, angle: number): Point[] {
    return tile.corners.map((corner) => rotatePoint(corner, angle));
}

export function rotatePoint(point: Point, angle: number): Point {
    return {
        x: point.x * Math.cos(angle) - point.y * Math.sin(angle),
        y: point.x * Math.sin(angle) + point.y * Math.cos(angle),
    };
}

export function allTileRotations(tile: Tile): Point[][] {
    const rotatedTilePoints: Point[][] = [];
    const alphaStep = (2 * Math.PI) / tile.repetitions;
    for (let alpha = alphaStep; alpha < 2 * Math.PI; alpha += alphaStep) {
        const rotatedTile = rotateTile(tile, alpha);
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
        inner: Point,
        left: Point,
        right: Point,
        repetitions: number,
    ) {
        // Calculate the outer corner
        const innerX = inner.x;
        const innerY = inner.y;
        const midpointX = (left.x + right.x) / 2;
        const midpointY = (left.y + right.y) / 2;
        const outerX = innerX + (midpointX - innerX) * 2;
        const outerY = innerY + (midpointY - innerY) * 2;

        // Create and set the progress tile
        this.progressTile = {
            corners: [inner, left, right, { x: outerX, y: outerY }],
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
