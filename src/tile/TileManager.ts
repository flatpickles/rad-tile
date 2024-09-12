import { Defaults } from '../util/Defaults';
import { Point } from '../util/Geometry';
import { AnchorPoint, newAnchor, TileModel } from './TileModel';
import TileRenderer from './TileRenderer';
import {
    ShapeType,
    TileManagerEvent,
    TileManagerEventType,
    TileManagerMode,
    TileStyle,
} from './TileTypes';

const ZOOM_FACTOR = 0.005;
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 10;
const SNAP_DISTANCE = 40;

export class TileManager {
    canvas: HTMLCanvasElement | null = null;
    renderer = new TileRenderer(this);
    style: TileStyle = Defaults.style;
    globalRotation: number = 0;

    model: TileModel = new TileModel();
    zoom: number = 1;
    progressPoints: AnchorPoint[] = [];
    hoverPoint: AnchorPoint | null = null;
    hoveredTileId: string | null = null;
    selectedTileId: string | null = null;
    canCommit: boolean = true;

    mode: TileManagerMode = Defaults.mode;
    repeats: number = Defaults.repeats;
    shapeType: ShapeType = Defaults.shape;

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
        if (!this.canvas) return;

        // Apply global rotation
        const rotation = -this.globalRotation * (Math.PI / 180);
        const rotatedPoint = rotatePoint(
            { x, y },
            { x: this.canvas.width / 2, y: this.canvas.height / 2 },
            rotation,
        );

        // Translate the input coordinates to the canvas coordinates, incorporating the zoom level
        const canvasX = (rotatedPoint.x - this.canvas.width / 2) / this.zoom;
        const canvasY = (rotatedPoint.y - this.canvas.height / 2) / this.zoom;

        // Selecting also sets the hover point
        const [hoverPoint, hoverIsAnchor] = this.#snappedPoint(
            canvasX,
            canvasY,
            this.progressPoints.length > 0,
        );
        this.hoverPoint = hoverPoint;

        // If we're in render mode, apply the current color to the tile
        if (this.mode === 'render' && this.hoveredTileId) {
            const tileObj = this.model.tiles.find(
                (tile) => tile.id === this.hoveredTileId,
            );
            if (tileObj) {
                tileObj.color = this.style.currentColor;
            }
            return;
        }

        // Start a new tile, or select an existing one:
        if (this.progressPoints.length === 0) {
            // Find the nearest anchor point to start from
            if (hoverIsAnchor) {
                this.progressPoints.push(this.hoverPoint);
            } else {
                // Select the nearest tile if it's removable
                const tileToSelect = this.model.getNearestTile(
                    this.hoverPoint.x,
                    this.hoverPoint.y,
                );
                if (tileToSelect?.isCenter) return;
                const newSelectedTileId = tileToSelect?.id;
                // Change the selected tile, or remove it if it's already selected
                if (
                    newSelectedTileId !== null &&
                    this.selectedTileId === newSelectedTileId
                ) {
                    const tileRemoved = this.model.removeTileWithId(
                        this.selectedTileId,
                    );
                    if (tileRemoved) {
                        this.selectedTileId = null;
                        this.#broadcast({
                            type: 'remove',
                            newMinRepeats: this.model.minRepeats,
                            currentTiles: this.model.tiles,
                        });
                    }
                } else {
                    this.selectedTileId = newSelectedTileId ?? null;
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

        // Apply global rotation
        const rotation = -this.globalRotation * (Math.PI / 180);
        const rotatedPoint = rotatePoint(
            { x, y },
            { x: this.canvas.width / 2, y: this.canvas.height / 2 },
            rotation,
        );

        // Translate the input coordinates to the canvas coordinates, incorporating the zoom level
        const canvasX = (rotatedPoint.x - this.canvas.width / 2) / this.zoom;
        const canvasY = (rotatedPoint.y - this.canvas.height / 2) / this.zoom;
        const [hoverPoint, hoverIsAnchor] = this.#snappedPoint(
            canvasX,
            canvasY,
            this.progressPoints.length > 0,
        );
        this.hoverPoint = hoverPoint;

        // If we're not creating a new shape, look for hovered tile (with rotations in render mode)
        if (this.progressPoints.length === 0 && !hoverIsAnchor) {
            // Set the hovered tile
            this.hoveredTileId =
                this.model.getNearestTile(
                    hoverPoint.x,
                    hoverPoint.y,
                    this.mode === 'render',
                )?.id ?? null;
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
            currentTiles: this.model.tiles,
        });
        return true;
    }

    // State handling

    initializeWithCenterShape(corners: number) {
        this.reset(false);
        this.model.initializeWithStartTile(corners);
    }

    setRepeats(repeats: number) {
        this.repeats = repeats;
        if (this.model.progressTile) {
            this.model.progressTile.repeats = this.repeats;
        }
    }

    reset(setDefaults: boolean = true) {
        this.model.clear();
        this.zoom = 1;
        this.cancelInput();
        this.progressPoints = [];
        this.globalRotation = 0;
        if (setDefaults) {
            this.setMode(Defaults.mode);
            this.setRepeats(Defaults.repeats);
            this.setShape(Defaults.shape);
        }
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

    render() {
        this.renderer.render();
    }
}

function rotatePoint(point: Point, center: Point, angle: number): Point {
    const cosRotation = Math.cos(angle);
    const sinRotation = Math.sin(angle);

    const rotatedX =
        (point.x - center.x) * cosRotation -
        (point.y - center.y) * sinRotation +
        center.x;
    const rotatedY =
        (point.x - center.x) * sinRotation +
        (point.y - center.y) * cosRotation +
        center.y;

    return { x: rotatedX, y: rotatedY };
}
