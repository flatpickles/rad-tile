import Color from 'color';
import {
    AnchorPoint,
    newAnchor,
    Tile,
    TileModel,
    tileRotationPoints,
} from './TileModel';

// Zoom constants
const ZOOM_FACTOR = 0.01;
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 10;

// Scale constants
const HANDLE_SIZE = 14;
const STROKE_WIDTH = 7;
const HANDLE_STROKE_WIDTH = 5;
const SNAP_DISTANCE = 40;

// Color constants
const BACKGROUND_COLOR = '#f0f0f0';
const COLOR_DISABLED = 'rgba(128, 128, 128, 1.0)';
const ANCHOR_COLOR = 'rgba(0, 128, 0, 1.0)';
const ANCHOR_COLOR_ACTIVE = 'rgba(0, 216, 0, 1.0)';
const ACTIVE_STROKE_COLOR = '#000000';
const DEFAULT_STROKE_COLOR = BACKGROUND_COLOR;
const REPEAT_ATTENUATION = 0.4;

export type TileManagerMode = 'build' | 'paint';
export type ShapeType = 'quad' | 'tri' | 'free';

export type TileManagerEventType = 'add' | 'remove';
export type TileManagerEvent = {
    type: TileManagerEventType;
    newMinRepeats: number;
};

type HandleType = 'anchor' | 'hover' | 'disabled';
type TileType = 'progress' | 'hover' | 'default' | 'disabled';

export class TileManager {
    canvas: HTMLCanvasElement | null = null;

    private model: TileModel = new TileModel();
    private zoom: number = 1;
    private progressPoints: AnchorPoint[] = [];
    private hoverPoint: AnchorPoint | null = null;
    private selectedTileIndex: number | null = null;
    private canCommit: boolean = true;

    // todo: centralize default values
    private mode: TileManagerMode = 'build';
    private repeats: number = 8;
    private shapeType: ShapeType = 'quad';

    // Event listeners

    listeners: { [event: string]: ((event: TileManagerEvent) => void)[] } = {};

    addEventListener(
        event: TileManagerEventType,
        listener: (event: TileManagerEvent) => void,
    ) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
    }

    removeEventListener(
        event: string,
        listener: (event: TileManagerEvent) => void,
    ) {
        this.listeners[event] = this.listeners[event].filter(
            (l) => l !== listener,
        );
    }

    #broadcast(event: TileManagerEvent) {
        this.listeners[event.type]?.forEach((listener) => listener(event));
    }

    // Input handling

    applyZoom(delta: number) {
        this.zoom *= 1 + delta * ZOOM_FACTOR;
        this.zoom = Math.max(this.zoom, ZOOM_MIN);
        this.zoom = Math.min(this.zoom, ZOOM_MAX);
    }

    inputSelect(x: number, y: number) {
        if (this.mode === 'paint') return;
        if (!this.canvas) return;

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

        // Start a new tile, or select an existing one:
        if (this.progressPoints.length === 0) {
            // Find the nearest anchor point to start from
            if (hoverIsAnchor) {
                this.progressPoints.push(this.hoverPoint);
            } else {
                // Select the nearest tile
                const newSelectedTileIndex = this.model.getNearestTileIndex(
                    this.hoverPoint.x,
                    this.hoverPoint.y,
                );
                // Change the selected tile, or remove it if it's already selected
                if (
                    newSelectedTileIndex !== null &&
                    this.selectedTileIndex === newSelectedTileIndex
                ) {
                    this.model.removeTileAtIndex(this.selectedTileIndex);
                    this.selectedTileIndex = null;
                    this.#broadcast({
                        type: 'remove',
                        newMinRepeats: this.model.minRepeats,
                    });
                } else {
                    this.selectedTileIndex = newSelectedTileIndex;
                }
            }
        }
        // Add the first corner:
        else if (this.progressPoints.length === 1 && this.canCommit) {
            this.progressPoints.push(this.hoverPoint);
        }
        // Add the second corner, commit & reset if appropriate:
        else if (this.progressPoints.length >= 2) {
            const closingShape =
                this.hoverPoint.x === this.progressPoints[0].x &&
                this.hoverPoint.y === this.progressPoints[0].y;
            this.canCommit = this.model.setProgressTile(
                closingShape
                    ? this.progressPoints
                    : [...this.progressPoints, this.hoverPoint],
                this.shapeType,
                this.repeats,
            );
            if (this.shapeType !== 'free' || closingShape) {
                this.completeProgressTile();
            } else {
                this.progressPoints.push(this.hoverPoint);
            }
        }
    }

    inputContextSelect(): boolean {
        // Finish shape if we have enough points
        if (this.mode === 'build' && this.progressPoints.length > 2) {
            this.canCommit = this.model.setProgressTile(
                this.progressPoints,
                this.shapeType,
                this.repeats,
            );
            return this.completeProgressTile();
        }
        // Otherwise, use default context menu behavior
        return false;
    }

    inputMove(x: number, y: number) {
        if (this.mode === 'paint') return;
        if (!this.canvas) return;

        // Translate the input coordinates to the canvas coordinates, incorporating the zoom level
        const canvasX = (x - this.canvas.width / 2) / this.zoom;
        const canvasY = (y - this.canvas.height / 2) / this.zoom;
        [this.hoverPoint] = this.#pointOrNearestAnchor(
            canvasX,
            canvasY,
            this.progressPoints.length > 0,
        );

        // Set commit flag if we have a line
        if (this.progressPoints.length == 1) {
            this.canCommit = this.model.canCommitLine([
                this.progressPoints[0],
                this.hoverPoint,
            ]);
        }

        // Set the progress tile and commit flag, only if we have two or more points
        if (this.progressPoints.length >= 2) {
            this.canCommit = this.model.setProgressTile(
                [...this.progressPoints, this.hoverPoint],
                this.shapeType,
                this.repeats,
            );
        }
    }

    cancelInput() {
        this.progressPoints = [];
        this.model.progressTile = null;
        this.selectedTileIndex = null;
        this.hoverPoint = null;
        this.canCommit = true;
    }

    completeProgressTile(): boolean {
        if (!this.canCommit) return false;
        this.model.commitProgressTile();
        this.progressPoints = [];
        this.#broadcast({
            type: 'add',
            newMinRepeats: this.model.minRepeats,
        });
        return true;
    }

    // State handling

    setRepeats(repeats: number) {
        this.repeats = repeats;
        if (this.model.progressTile) {
            this.model.progressTile.repeats = this.repeats;
        }
    }

    clear() {
        this.model.clear();
        this.zoom = 1;
        this.cancelInput();
    }

    setMode(mode: TileManagerMode) {
        this.cancelInput();
        this.mode = mode;
    }

    setShape(shape: ShapeType) {
        this.cancelInput();
        this.shapeType = shape;
    }

    #pointOrNearestAnchor(
        x: number,
        y: number,
        includeRepeats: boolean = false,
    ): [AnchorPoint, boolean] {
        const excludePoints =
            this.shapeType === 'free' && this.progressPoints.length >= 3
                ? this.progressPoints.slice(1)
                : this.progressPoints;
        const nearest = this.model.getNearestAnchor(
            x,
            y,
            SNAP_DISTANCE / this.zoom,
            excludePoints,
            includeRepeats,
            this.repeats,
        );
        return [nearest ?? newAnchor({ x, y }, this.repeats), nearest !== null];
    }

    // Rendering

    renderHandle(
        context: CanvasRenderingContext2D,
        point: AnchorPoint,
        type: HandleType,
    ) {
        const scaledHandleSize = HANDLE_SIZE / this.zoom; // constant across zoom levels
        context.fillStyle =
            type === 'anchor'
                ? ANCHOR_COLOR
                : type === 'hover'
                  ? ANCHOR_COLOR_ACTIVE
                  : COLOR_DISABLED;
        context.beginPath();
        context.arc(point.x, point.y, scaledHandleSize, 0, 2 * Math.PI);
        context.fill();
        context.lineWidth = HANDLE_STROKE_WIDTH / this.zoom;
        context.stroke();
    }

    renderTile(
        context: CanvasRenderingContext2D,
        tile: Tile,
        type: TileType,
        rotationsOnly = false,
    ) {
        if (!rotationsOnly) {
            // Draw tiles in progress area
            context.fillStyle =
                type === 'disabled' ? COLOR_DISABLED : tile.color;
            context.strokeStyle =
                this.mode === 'build'
                    ? ACTIVE_STROKE_COLOR
                    : DEFAULT_STROKE_COLOR;
            context.beginPath();
            context.moveTo(tile.corners[0].x, tile.corners[0].y);
            for (let i = 1; i < tile.corners.length; i++) {
                context.lineTo(tile.corners[i].x, tile.corners[i].y);
            }
            context.closePath();
            context.fill();
            context.stroke();
        } else {
            // Draw tile rotations
            context.fillStyle =
                this.mode === 'build'
                    ? Color(tile.color)
                          .desaturate(REPEAT_ATTENUATION)
                          .lighten(REPEAT_ATTENUATION)
                          .toString()
                    : tile.color;
            context.strokeStyle = DEFAULT_STROKE_COLOR;
            tileRotationPoints(tile).forEach((rotatedPoints) => {
                context.beginPath();
                context.moveTo(rotatedPoints[0].x, rotatedPoints[0].y);
                for (let i = 1; i < rotatedPoints.length; i++) {
                    context.lineTo(rotatedPoints[i].x, rotatedPoints[i].y);
                }
                context.closePath();
                context.fill();
                context.stroke();
            });
        }
    }

    render() {
        // Get the context
        if (!this.canvas) return;
        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('No context');
        }

        // Clear, setup, and translate the canvas
        context.fillStyle = BACKGROUND_COLOR;
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        context.save();
        context.translate(this.canvas.width / 2, this.canvas.height / 2);
        context.scale(this.zoom, this.zoom);
        context.lineWidth = STROKE_WIDTH / this.zoom;
        context.lineJoin = 'round';
        context.lineCap = 'round';

        // Draw tile repeats first
        this.model.tiles.forEach((tile) => {
            // todo: check hover state
            this.renderTile(context, tile, 'default', true);
        });
        if (this.model.progressTile) {
            this.renderTile(context, this.model.progressTile, 'progress', true);
        }

        // Now draw the active area
        this.model.tiles.forEach((tile) => {
            // todo: check hover state
            this.renderTile(context, tile, 'default');
        });
        if (this.model.progressTile) {
            this.renderTile(
                context,
                this.model.progressTile,
                this.canCommit ? 'progress' : 'disabled',
            );
        }

        if (this.mode === 'build') {
            // Draw the progress OR the available anchors
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
                this.progressPoints.forEach((point) => {
                    this.renderHandle(
                        context,
                        point,
                        this.canCommit ? 'anchor' : 'disabled',
                    );
                });
                // Draw hover point
                this.renderHandle(
                    context,
                    this.hoverPoint,
                    this.canCommit ? 'hover' : 'disabled',
                );
            } else {
                // Draw anchors
                this.model.anchors.forEach((anchor) => {
                    const hovered =
                        anchor.x === this.hoverPoint?.x &&
                        anchor.y === this.hoverPoint?.y;
                    this.renderHandle(
                        context,
                        anchor,
                        hovered ? 'hover' : 'anchor',
                    );
                });
            }
        }

        // Reset translation
        context.restore();
    }
}
