import { Point, TileModel } from './TileModel';

export class TileManager {
    private model: TileModel = new TileModel();
    private progressPoints: Point[] = [];

    inputSelect(x: number, y: number) {
        // Start a new tile:
        if (this.progressPoints.length === 0) {
            // Find the nearest anchor point to start from
            const anchor = this.model.getNearestAnchor(x, y);
            if (anchor) {
                this.progressPoints.push(anchor);
            } else {
                throw new Error('No nearest anchor');
            }
        }
        // Add the first corner:
        else if (this.progressPoints.length === 1) {
            const newPoint = { x, y }; // todo: snapping?
            this.progressPoints.push(newPoint);
        }
        // Add the second corner, commit & reset:
        else if (this.progressPoints.length === 2) {
            this.model.setProgressTile(
                this.progressPoints[0],
                this.progressPoints[1],
                { x, y },
            );
            this.model.commitProgressTile();
            this.progressPoints = [];
        }
    }

    inputMove(x: number, y: number) {
        // Set the progress tile, only if we have two points
        if (this.progressPoints.length === 2) {
            this.model.setProgressTile(
                this.progressPoints[0],
                this.progressPoints[1],
                { x, y },
            );
        }
    }

    render(canvas: HTMLCanvasElement) {
        // Get the context
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('No context');
        }

        // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw existing tiles
        this.model.tiles.forEach((tile) => {
            context.fillStyle = 'red';
            context.beginPath();
            context.moveTo(tile.corners[0].x, tile.corners[0].y);
            context.lineTo(tile.corners[1].x, tile.corners[1].y);
            context.lineTo(tile.corners[3].x, tile.corners[3].y);
            context.lineTo(tile.corners[2].x, tile.corners[2].y);
            context.closePath();
            context.fill();
        });

        // Draw the progress tile
        if (this.model.progressTile) {
            context.fillStyle = 'blue';
            context.beginPath();
            context.moveTo(
                this.model.progressTile.corners[0].x,
                this.model.progressTile.corners[0].y,
            );
            context.lineTo(
                this.model.progressTile.corners[1].x,
                this.model.progressTile.corners[1].y,
            );
            context.lineTo(
                this.model.progressTile.corners[3].x,
                this.model.progressTile.corners[3].y,
            );
            context.lineTo(
                this.model.progressTile.corners[2].x,
                this.model.progressTile.corners[2].y,
            );
            context.closePath();
            context.fill();
        }

        // Draw the progress points OR the available anchors
        if (this.progressPoints.length > 0) {
            this.progressPoints.forEach((point) => {
                context.fillStyle = 'green';
                context.beginPath();
                context.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                context.fill();
            });
        } else {
            this.model.anchors.forEach((anchor) => {
                context.fillStyle = 'yellow';
                context.beginPath();
                context.arc(anchor.x, anchor.y, 5, 0, 2 * Math.PI);
                context.fill();
            });
        }
    }
}
