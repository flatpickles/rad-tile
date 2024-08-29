import Color from 'color';
import { Defaults } from '../util/Defaults';
import {
    AnchorPoint,
    newAnchor,
    Tile,
    TileModel,
    tileRotationPoints,
} from './TileModel';
import {
    ShapeType,
    TileManagerEvent,
    TileManagerEventType,
    TileManagerMode,
    TileStyle,
} from './TileTypes';

// Zoom constants
const ZOOM_FACTOR = 0.005;
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 10;

// Scale constants
const HANDLE_SIZE = 14;
const STROKE_WIDTH = 7;
const HANDLE_STROKE_WIDTH = 5;
const SNAP_DISTANCE = 40;

// Color constants for build mode
const COLOR_DISABLED = 'rgba(128, 128, 128, 1.0)';
const COLOR_DELETE_CONFIRM = 'rgba(256, 0, 0, 1.0)';
const ANCHOR_COLOR = 'rgba(0, 200, 0, 1.0)';
const ANCHOR_COLOR_ACTIVE = 'rgba(0, 256, 0, 1.0)';
const ACTIVE_STROKE_COLOR_DARK = '#000000';
const ACTIVE_STROKE_COLOR_LIGHT = '#EEEEEE';
const COLOR_MOD = 0.4;

type HandleType = 'anchor' | 'hover' | 'disabled';
type TileType = 'progress' | 'hover' | 'default' | 'disabled' | 'selected';

export class TileManager {
    canvas: HTMLCanvasElement | null = null;
    style: TileStyle = Defaults.style;

    private model: TileModel = new TileModel();
    private zoom: number = 1;
    private progressPoints: AnchorPoint[] = [];
    private hoverPoint: AnchorPoint | null = null;
    private hoveredTileId: string | null = null;
    private selectedTileId: string | null = null;
    private canCommit: boolean = true;

    private mode: TileManagerMode = Defaults.mode;
    private repeats: number = Defaults.repeats;
    private shapeType: ShapeType = Defaults.shape;

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
        if (this.mode === 'render') return;
        if (!this.canvas) return;

        // Translate the input coordinates to the canvas coordinates, incorporating the zoom level
        const canvasX = (x - this.canvas.width / 2) / this.zoom;
        const canvasY = (y - this.canvas.height / 2) / this.zoom;

        // Selecting also sets the hover point
        const [hoverPoint, hoverIsAnchor] = this.#snappedPoint(
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
                const newSelectedTileId = this.model.getNearestTileId(
                    this.hoverPoint.x,
                    this.hoverPoint.y,
                );
                // Change the selected tile, or remove it if it's already selected
                if (
                    newSelectedTileId !== null &&
                    this.selectedTileId === newSelectedTileId
                ) {
                    this.model.removeTileWithId(this.selectedTileId);
                    this.selectedTileId = null;
                    this.#broadcast({
                        type: 'remove',
                        newMinRepeats: this.model.minRepeats,
                    });
                } else {
                    this.selectedTileId = newSelectedTileId;
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
        if (!this.canvas) return;

        // Translate the input coordinates to the canvas coordinates, incorporating the zoom level
        const canvasX = (x - this.canvas.width / 2) / this.zoom;
        const canvasY = (y - this.canvas.height / 2) / this.zoom;
        const [hoverPoint, hoverIsAnchor] = this.#snappedPoint(
            canvasX,
            canvasY,
            this.progressPoints.length > 0,
        );
        this.hoverPoint = hoverPoint;

        // If we're not creating a new shape, look for hovered tile (with rotations in render mode)
        if (this.progressPoints.length === 0 && !hoverIsAnchor) {
            // Set the hovered tile
            this.hoveredTileId = this.model.getNearestTileId(
                hoverPoint.x,
                hoverPoint.y,
                this.mode === 'render',
            );
            // Deselect the selected tile if we're not still hovering over it
            if (this.hoveredTileId !== this.selectedTileId) {
                this.selectedTileId = null;
            }
        } else {
            // Reset hover & selection if we're creating a shape or hovering over an anchor
            this.hoveredTileId = null;
            this.selectedTileId = null;
        }

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
        this.selectedTileId = null;
        this.hoveredTileId = null;
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

    reset() {
        this.model.clear();
        this.zoom = 1;
        this.cancelInput();
        this.setRepeats(Defaults.repeats);
        this.setShape(Defaults.shape);
    }

    setMode(mode: TileManagerMode) {
        this.cancelInput();
        this.mode = mode;
    }

    setShape(shape: ShapeType) {
        this.cancelInput();
        this.shapeType = shape;
    }

    #snappedPoint(
        x: number,
        y: number,
        includeRepeats: boolean = false,
    ): [AnchorPoint, boolean] {
        // No snapping in render mode
        if (this.mode === 'render') {
            return [newAnchor({ x, y }, this.repeats), false];
        }
        // Snapping in build mode
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
        const shouldStroke =
            this.mode === 'build' || this.style.strokeWidth > 0;
        context.lineWidth =
            this.mode === 'build'
                ? STROKE_WIDTH / this.zoom
                : this.style.strokeWidth;
        const activeStrokeColor = Color(this.style.backgroundColor).isDark()
            ? ACTIVE_STROKE_COLOR_LIGHT
            : ACTIVE_STROKE_COLOR_DARK;

        // Determine fill color
        let fillColor = tile.color;
        if (this.mode === 'build') {
            if (type === 'disabled') {
                fillColor = COLOR_DISABLED;
            } else if (rotationsOnly) {
                fillColor = Color(fillColor)
                    .desaturate(COLOR_MOD)
                    .lighten(COLOR_MOD)
                    .toString();
            } else if (type === 'hover') {
                fillColor = Color(fillColor).lighten(COLOR_MOD).toString();
            } else if (type === 'selected') {
                fillColor = COLOR_DELETE_CONFIRM;
            }
        } else if (type === 'hover') {
            fillColor = Color(fillColor)
                .saturate(COLOR_MOD)
                .lighten(COLOR_MOD)
                .toString();
        }
        context.fillStyle = fillColor;

        if (!rotationsOnly) {
            // Draw tiles in progress area
            context.strokeStyle =
                this.mode === 'build'
                    ? activeStrokeColor
                    : this.style.strokeColor;
            context.beginPath();
            context.moveTo(tile.corners[0].x, tile.corners[0].y);
            for (let i = 1; i < tile.corners.length; i++) {
                context.lineTo(tile.corners[i].x, tile.corners[i].y);
            }
            context.closePath();
            context.fill();
            if (shouldStroke) context.stroke();
        } else {
            // Draw tile rotations
            context.strokeStyle =
                this.mode === 'build'
                    ? this.style.backgroundColor
                    : this.style.strokeColor;
            tileRotationPoints(tile).forEach((rotatedPoints) => {
                context.beginPath();
                context.moveTo(rotatedPoints[0].x, rotatedPoints[0].y);
                for (let i = 1; i < rotatedPoints.length; i++) {
                    context.lineTo(rotatedPoints[i].x, rotatedPoints[i].y);
                }
                context.closePath();
                context.fill();
                if (shouldStroke) context.stroke();
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
        context.fillStyle = this.style.backgroundColor;
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        context.save();
        context.translate(this.canvas.width / 2, this.canvas.height / 2);
        context.scale(this.zoom, this.zoom);
        context.lineWidth = STROKE_WIDTH / this.zoom;
        context.lineJoin = 'round';
        context.lineCap = 'round';

        // Draw tile repeats first
        this.model.tiles.forEach((tile) => {
            const type = tile.id === this.hoveredTileId ? 'hover' : 'default';
            this.renderTile(context, tile, type, true);
        });
        if (this.model.progressTile) {
            this.renderTile(context, this.model.progressTile, 'progress', true);
        }

        // Now draw the active area
        this.model.tiles.forEach((tile) => {
            const type =
                tile.id === this.selectedTileId
                    ? 'selected'
                    : tile.id === this.hoveredTileId
                      ? 'hover'
                      : 'default';
            this.renderTile(context, tile, type);
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
                    context.lineWidth = STROKE_WIDTH / this.zoom;
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
