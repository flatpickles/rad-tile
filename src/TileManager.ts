import { Point, rotateTile, TileModel } from './TileModel';

// todo: parameterize
const REPETITION_COUNT = 8;
const SNAPPING = true;

// Zoom constants
const ZOOM_IN = 1.05;
const ZOOM_OUT = 0.95;
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 10;

// Scale constants
const HANDLE_SIZE = 10;
const STROKE_WIDTH = 7;
const SNAP_DISTANCE = 40;

// Color constants
const ANCHOR_COLOR = 'rgba(0, 128, 0, 1.0)';
const ANCHOR_COLOR_ACTIVE = 'rgba(0, 216, 0, 1.0)';
const ACTIVE_COLOR_TILE = 'rgba(128, 0, 128, 1.0)';
const ACTIVE_COLOR_PROGRESS = 'rgba(0, 0, 128, 1.0)';
const ACTIVE_COLOR_STROKE = 'rgba(0, 0, 0, 1.0)';
const REPEAT_COLOR_TILE = 'rgba(128, 0, 128, 0.4)';
const REPEAT_COLOR_PROGRESS = 'rgba(0, 0, 128, 0.4)';
const REPEAT_COLOR_STROKE = 'rgba(0, 0, 0, 1.0)';

export class TileManager {
    private model: TileModel = new TileModel();
    private canvas: HTMLCanvasElement;
    private zoom: number = 1;
    private progressPoints: Point[] = [];
    private hoverPoint: Point | null = null;

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

        // Selecting also sets the hover point
        const [hoverPoint, hoverIsAnchor] = this.#pointOrNearestAnchor(
            canvasX,
            canvasY,
            this.progressPoints.length > 0,
        );
        this.hoverPoint = hoverPoint;

        // Start a new tile:
        if (this.progressPoints.length === 0) {
            // Find the nearest anchor point to start from
            if (hoverIsAnchor) {
                this.progressPoints.push(this.hoverPoint);
            }
        }
        // Add the first corner:
        else if (this.progressPoints.length === 1) {
            this.progressPoints.push(this.hoverPoint);
        }
        // Add the second corner, commit & reset:
        else if (this.progressPoints.length === 2) {
            this.model.setProgressTile(
                this.progressPoints[0],
                this.progressPoints[1],
                this.hoverPoint,
            );
            this.model.commitProgressTile();
            this.progressPoints = [];
        }
    }

    inputMove(x: number, y: number) {
        // Translate the input coordinates to the canvas coordinates, incorporating the zoom level
        const canvasX = (x - this.canvas.width / 2) / this.zoom;
        const canvasY = (y - this.canvas.height / 2) / this.zoom;
        [this.hoverPoint] = this.#pointOrNearestAnchor(
            canvasX,
            canvasY,
            this.progressPoints.length > 0,
        );

        // Set the progress tile, only if we have two points
        if (this.progressPoints.length === 2) {
            this.model.setProgressTile(
                this.progressPoints[0],
                this.progressPoints[1],
                this.hoverPoint,
            );
        }
    }

    cancelInput() {
        this.progressPoints = [];
        this.model.progressTile = null;
    }

    #pointOrNearestAnchor(
        x: number,
        y: number,
        includeRotations: boolean = false,
    ): [Point, boolean] {
        if (SNAPPING) {
            const nearest = this.model.getNearestAnchor(
                x,
                y,
                SNAP_DISTANCE / this.zoom,
                this.progressPoints,
                includeRotations ? (2 * Math.PI) / REPETITION_COUNT : null,
            );
            return [nearest ?? { x, y }, nearest !== null];
        }
        return [{ x, y }, false];
    }

    render() {
        // Get the context
        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('No context');
        }

        // Clear, setup, and translate the canvas
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        context.save();
        context.translate(this.canvas.width / 2, this.canvas.height / 2);
        context.scale(this.zoom, this.zoom);
        context.lineWidth = STROKE_WIDTH / this.zoom;
        context.lineJoin = 'round';
        context.lineCap = 'round';

        // Draw radial repeats below active area
        context.strokeStyle = REPEAT_COLOR_STROKE;
        const alphaStep = (2 * Math.PI) / REPETITION_COUNT;
        for (let alpha = alphaStep; alpha < 2 * Math.PI; alpha += alphaStep) {
            // Existing tiles
            context.fillStyle = REPEAT_COLOR_TILE;
            this.model.tiles.forEach((tile) => {
                const rotatedPoints = rotateTile(tile, alpha);
                context.beginPath();
                context.moveTo(rotatedPoints[0].x, rotatedPoints[0].y);
                context.lineTo(rotatedPoints[1].x, rotatedPoints[1].y);
                context.lineTo(rotatedPoints[3].x, rotatedPoints[3].y);
                context.lineTo(rotatedPoints[2].x, rotatedPoints[2].y);
                context.closePath();
                context.fill();
                context.stroke();
            });

            // Progress tile
            if (this.model.progressTile) {
                context.fillStyle = REPEAT_COLOR_PROGRESS;
                const rotatedProgressPoints = rotateTile(
                    this.model.progressTile,
                    alpha,
                );
                context.beginPath();
                context.moveTo(
                    rotatedProgressPoints[0].x,
                    rotatedProgressPoints[0].y,
                );
                context.lineTo(
                    rotatedProgressPoints[1].x,
                    rotatedProgressPoints[1].y,
                );
                context.lineTo(
                    rotatedProgressPoints[3].x,
                    rotatedProgressPoints[3].y,
                );
                context.lineTo(
                    rotatedProgressPoints[2].x,
                    rotatedProgressPoints[2].y,
                );
                context.closePath();
                context.fill();
                context.stroke();
            }
        }

        // Existing tiles (in active area)
        context.strokeStyle = ACTIVE_COLOR_STROKE;
        context.fillStyle = ACTIVE_COLOR_TILE;
        this.model.tiles.forEach((tile) => {
            context.beginPath();
            context.moveTo(tile.corners[0].x, tile.corners[0].y);
            context.lineTo(tile.corners[1].x, tile.corners[1].y);
            context.lineTo(tile.corners[3].x, tile.corners[3].y);
            context.lineTo(tile.corners[2].x, tile.corners[2].y);
            context.closePath();
            context.fill();
            context.stroke();
        });

        // Progress tile (in active area)
        if (this.model.progressTile) {
            context.fillStyle = ACTIVE_COLOR_PROGRESS;
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
            context.stroke();
        }

        // Draw the progress OR the available anchors
        const scaledHandleSize = HANDLE_SIZE / this.zoom; // constant across zoom levels
        if (this.progressPoints.length > 0 && this.hoverPoint) {
            // Draw path to hover point if there is no progress tile
            if (!this.model.progressTile) {
                context.beginPath();
                context.moveTo(
                    this.progressPoints[0].x,
                    this.progressPoints[0].y,
                );
                context.lineTo(this.hoverPoint.x, this.hoverPoint.y);
                context.stroke();
            }
            // Draw progress points
            context.fillStyle = ANCHOR_COLOR;
            this.progressPoints.forEach((point) => {
                context.beginPath();
                context.arc(point.x, point.y, scaledHandleSize, 0, 2 * Math.PI);
                context.fill();
            });
            // Draw hover point
            context.fillStyle = ANCHOR_COLOR_ACTIVE;
            context.beginPath();
            context.arc(
                this.hoverPoint.x,
                this.hoverPoint.y,
                scaledHandleSize,
                0,
                2 * Math.PI,
            );
            context.fill();
        } else {
            // Draw anchors
            this.model.anchors.forEach((anchor) => {
                if (anchor === this.hoverPoint) {
                    context.fillStyle = ANCHOR_COLOR_ACTIVE;
                } else {
                    context.fillStyle = ANCHOR_COLOR;
                }
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
