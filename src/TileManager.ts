import { Point, TileModel } from './TileModel';

const ZOOM_IN = 1.05;
const ZOOM_OUT = 0.95;
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 10;
const HANDLE_SIZE = 10;

export class TileManager {
    private model: TileModel = new TileModel();
    private progressPoints: Point[] = [];
    private canvas: HTMLCanvasElement;
    private zoom: number = 1;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    zoomIn() {
        this.zoom *= ZOOM_IN;
        this.zoom = Math.max(this.zoom, ZOOM_MIN);
        this.zoom = Math.min(this.zoom, ZOOM_MAX);
    }

    zoomOut() {
        this.zoom *= ZOOM_OUT;
        this.zoom = Math.max(this.zoom, ZOOM_MIN);
        this.zoom = Math.min(this.zoom, ZOOM_MAX);
    }

    inputSelect(x: number, y: number) {
        // Translate the input coordinates to the canvas coordinates, incorporating the zoom level
        const canvasX = (x - this.canvas.width / 2) / this.zoom;
        const canvasY = (y - this.canvas.height / 2) / this.zoom;

        // Start a new tile:
        if (this.progressPoints.length === 0) {
            // Find the nearest anchor point to start from
            const anchor = this.model.getNearestAnchor(canvasX, canvasY);
            if (anchor) {
                this.progressPoints.push(anchor);
            } else {
                throw new Error('No nearest anchor');
            }
        }
        // Add the first corner:
        else if (this.progressPoints.length === 1) {
            const newPoint = { x: canvasX, y: canvasY }; // todo: snapping?
            this.progressPoints.push(newPoint);
        }
        // Add the second corner, commit & reset:
        else if (this.progressPoints.length === 2) {
            this.model.setProgressTile(
                this.progressPoints[0],
                this.progressPoints[1],
                { x: canvasX, y: canvasY },
            );
            this.model.commitProgressTile();
            this.progressPoints = [];
        }
    }

    inputMove(x: number, y: number) {
        // Translate the input coordinates to the canvas coordinates, incorporating the zoom level
        const canvasX = (x - this.canvas.width / 2) / this.zoom;
        const canvasY = (y - this.canvas.height / 2) / this.zoom;

        // Set the progress tile, only if we have two points
        if (this.progressPoints.length === 2) {
            this.model.setProgressTile(
                this.progressPoints[0],
                this.progressPoints[1],
                { x: canvasX, y: canvasY },
            );
        }
    }

    render() {
        // Get the context
        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('No context');
        }

        // Clear and translate the canvas
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        context.save();
        context.translate(this.canvas.width / 2, this.canvas.height / 2);
        context.scale(this.zoom, this.zoom);

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
        const scaledHandleSize = HANDLE_SIZE / this.zoom; // constant across zoom levels
        if (this.progressPoints.length > 0) {
            this.progressPoints.forEach((point) => {
                context.fillStyle = 'green';
                context.beginPath();
                context.arc(point.x, point.y, scaledHandleSize, 0, 2 * Math.PI);
                context.fill();
            });
        } else {
            this.model.anchors.forEach((anchor) => {
                context.fillStyle = 'green';
                context.beginPath();
                context.arc(
                    anchor.x,
                    anchor.y,
                    scaledHandleSize,
                    0,
                    2 * Math.PI,
                );
                context.fill();
            });
        }

        // Reset translation
        context.restore();
    }
}
