export type Point = {
    x: number;
    y: number;
    // todo: track connected tiles for deletion?
};

export type Tile = {
    corners: [
        Point, // inner anchor
        Point, // left anchor (counterclockwise)
        Point, // right anchor (clockwise)
        Point, // outer anchor
    ];
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

export class TileModel {
    anchors: Set<Point> = new Set([{ x: 0, y: 0 }]);
    tiles: Tile[] = [];
    progressTile: Tile | null = null;

    getNearestAnchor(
        x: number,
        y: number,
        withinDistance = Infinity,
        excludePoints: Point[] = [],
        alphaStep: number | null = null,
    ): Point | null {
        let nearestAnchor: Point | null = null;
        let nearestDistance = Infinity;
        const pointsToCheck = new Set(this.anchors);
        if (alphaStep) {
            [...this.anchors, ...(this.progressTile?.corners || [])].forEach(
                (anchor) => {
                    pointsToCheck.add(rotatePoint(anchor, alphaStep));
                    pointsToCheck.add(rotatePoint(anchor, -alphaStep));
                },
            );
        }

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

    setProgressTile(inner: Point, left: Point, right: Point) {
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
        };
    }

    commitProgressTile() {
        if (!this.progressTile) {
            throw new Error('No progress tile');
        }

        // Add the new tile, and corners as anchors
        this.tiles.push(this.progressTile);
        this.anchors.add(this.progressTile.corners[0]);
        this.anchors.add(this.progressTile.corners[1]);
        this.anchors.add(this.progressTile.corners[2]);
        this.anchors.add(this.progressTile.corners[3]);
        this.progressTile = null;
    }
}
