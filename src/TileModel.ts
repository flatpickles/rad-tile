export type Point = {
    x: number;
    y: number;
    // todo: track connected tiles?
};

export type Tile = {
    corners: [
        Point, // inner anchor
        Point, // left anchor (counterclockwise)
        Point, // right anchor (clockwise)
        Point, // outer anchor
    ];
};

export class TileModel {
    anchors: Set<Point> = new Set([{ x: 0, y: 0 }]);
    tiles: Tile[] = [];
    progressTile: Tile | null = null;

    getNearestAnchor(x: number, y: number): Point | null {
        let nearestAnchor: Point | null = null;
        let nearestDistance = Infinity;
        for (const anchor of this.anchors) {
            const distance = Math.sqrt(
                (x - anchor.x) ** 2 + (y - anchor.y) ** 2,
            );
            if (distance < nearestDistance) {
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
