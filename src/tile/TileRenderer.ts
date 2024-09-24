import Color from 'color';
import offsetPolygon from 'offset-polygon';
import { Point } from '../util/Geometry';
import { TileManager } from './TileManager';
import { AnchorPoint, Tile, tileRotationPoints } from './TileModel';

// Scale constants
const HANDLE_SIZE = 14;
const BUILD_STROKE_WIDTH = 7;
const BUILD_STROKE_BACKDROP_WIDTH = 3;
const HANDLE_STROKE_WIDTH = 5;

// Color constants for build mode
const COLOR_DISABLED = 'rgba(128, 128, 128, 1.0)';
const ANCHOR_COLOR_LIGHT = 'rgba(0, 256, 0, 1.0)';
const ANCHOR_COLOR_DARK = 'rgba(0, 170, 0, 1.0)';
const ANCHOR_COLOR_DELETE = 'rgba(256, 0, 0, 1.0)';
const ACTIVE_STROKE_COLOR_DARK = '#222222';
const ACTIVE_STROKE_COLOR_LIGHT = '#DDDDDD';

type RenderConfig = {
    fillColor: string;
    strokeColor: string;
    lineWidth: number;
    shouldStroke: boolean;
};

// todo: clean this up, reduce reliance on manager state

export default class TileRenderer {
    private manager: TileManager;

    constructor(manager: TileManager) {
        this.manager = manager;
    }

    // Rendering

    renderHandle(context: CanvasRenderingContext2D, point: AnchorPoint) {
        const renderConfig = this.#getHandleRenderConfig(point);
        if (!renderConfig) return;

        // Draw the handle
        const scaledHandleSize = HANDLE_SIZE / this.manager.zoom; // constant across zoom levels
        context.beginPath();
        context.arc(point.x, point.y, scaledHandleSize, 0, 2 * Math.PI);
        context.fillStyle = renderConfig.fillColor;
        context.strokeStyle = renderConfig.strokeColor;
        context.fill();
        context.lineWidth = renderConfig.lineWidth;
        context.stroke();
    }

    #getHandleRenderConfig(point: AnchorPoint): RenderConfig | null {
        // Don't render handles that are not along the selected tile
        const hasSelectedTile = this.manager.selectedTileId !== null;
        const alongSelectedTile =
            this.manager.selectedTileId !== null &&
            point.tileIds.includes(this.manager.selectedTileId);
        if (hasSelectedTile && !alongSelectedTile) return null;

        // Get handle status for rendering
        const alongProgressTile =
            this.manager.progressPoints.includes(point) ||
            (this.manager.hoverPoint?.x === point.x &&
                this.manager.hoverPoint?.y === point.y);
        const isDisabled = alongProgressTile && !this.manager.canCommit;
        const isHovered =
            point.x === this.manager.hoverPoint?.x &&
            point.y === this.manager.hoverPoint?.y;
        const alongHoveredTile =
            this.manager.hoveredTileId !== null &&
            point.tileIds.includes(this.manager.hoveredTileId);

        // Get fill & stroke colors
        const passiveAnchorColor = ANCHOR_COLOR_DARK;
        const activeAnchorColor = ANCHOR_COLOR_LIGHT;
        let fillColor: string;
        if (hasSelectedTile && alongSelectedTile) {
            fillColor = ANCHOR_COLOR_DELETE;
        } else if (alongHoveredTile) {
            fillColor = activeAnchorColor;
        } else {
            fillColor = isDisabled
                ? COLOR_DISABLED
                : isHovered
                  ? activeAnchorColor
                  : passiveAnchorColor;
        }
        const activeStrokeColor = Color(
            this.manager.style.backgroundColor,
        ).isDark()
            ? ACTIVE_STROKE_COLOR_LIGHT
            : ACTIVE_STROKE_COLOR_DARK;

        return {
            fillColor,
            strokeColor: activeStrokeColor,
            lineWidth: HANDLE_STROKE_WIDTH / this.manager.zoom,
            shouldStroke: true,
        };
    }

    renderTile(
        context: CanvasRenderingContext2D,
        tile: Tile,
        rotationsOnly = false,
    ) {
        // Get the render config
        const renderConfig = this.#getTileRenderConfig(tile, rotationsOnly);
        context.fillStyle = renderConfig.fillColor;
        context.strokeStyle = renderConfig.strokeColor;
        context.lineWidth = renderConfig.lineWidth;

        // Apply tile inset in render mode only
        const tileInset =
            this.manager.mode === 'render' ? this.manager.style.tileInset : 0;

        // Draw the tile
        const points = rotationsOnly
            ? tileRotationPoints(tile)
            : [tile.corners];
        points.forEach((pointSet) => {
            this.#drawShape(context, pointSet, tileInset);
            context.fill();
            if (renderConfig.shouldStroke) context.stroke();
        });
    }

    #getTileRenderConfig(tile: Tile, rotationsOnly: boolean): RenderConfig {
        const buildMode = this.manager.mode === 'build';
        const shouldStroke = buildMode || this.manager.style.strokeWidth > 0;
        const hasSelection = this.manager.selectedTileId !== null;
        const isSelected = tile.id === this.manager.selectedTileId;
        let lineWidth = this.manager.style.strokeWidth;
        if (buildMode) {
            const isBuildBackdrop =
                (hasSelection && !isSelected) || rotationsOnly;
            lineWidth =
                (isBuildBackdrop
                    ? BUILD_STROKE_BACKDROP_WIDTH
                    : BUILD_STROKE_WIDTH) / this.manager.zoom;
        }

        return {
            fillColor: this.#getTileFillColor(tile, rotationsOnly),
            strokeColor: this.#getTileStrokeColor(tile, rotationsOnly),
            lineWidth,
            shouldStroke,
        };
    }

    #getTileFillColor(tile: Tile, rotationsOnly: boolean): string {
        const isBuildMode = this.manager.mode === 'build';
        const isHovered = tile.id === this.manager.hoveredTileId;
        const isDisabled =
            tile.id === this.manager.model.progressTile?.id &&
            !this.manager.canCommit;
        const hasSelection = this.manager.selectedTileId !== null;
        const isSelected = tile.id === this.manager.selectedTileId;

        if (isBuildMode) {
            if (isDisabled) return COLOR_DISABLED;
            if (rotationsOnly || (hasSelection && !isSelected))
                return this.#lowlightColor(tile.color);
            if (isHovered) return this.#highlightColor(tile.color);
        } else if (isHovered) {
            return this.manager.style.currentColor;
        }
        return tile.color;
    }

    #highlightColor(baseColor: string): string {
        return (
            Color(this.manager.style.backgroundColor).isLight()
                ? Color(baseColor).lighten(0.5).toString()
                : Color(baseColor).darken(0.2).toString()
        ).toString();
    }

    #lowlightColor(baseColor: string): string {
        return Color(baseColor).alpha(0.5).toString();
    }

    #getTileStrokeColor(tile: Tile, rotationsOnly: boolean): string {
        const isBuildMode = this.manager.mode === 'build';
        const hasSelection = this.manager.selectedTileId !== null;
        const isSelected = tile.id === this.manager.selectedTileId;

        if (isBuildMode) {
            const activeStrokeColor = Color(
                this.manager.style.backgroundColor,
            ).isDark()
                ? ACTIVE_STROKE_COLOR_LIGHT
                : ACTIVE_STROKE_COLOR_DARK;
            if (rotationsOnly) return this.manager.style.backgroundColor;
            if (hasSelection)
                return isSelected
                    ? activeStrokeColor
                    : this.manager.style.backgroundColor;
            return activeStrokeColor;
        } else {
            return this.manager.style.strokeColor;
        }
    }

    #drawShape(context: CanvasRenderingContext2D, points: Point[], inset = 0) {
        // Inset the points if specified (todo: don't recalculate for each frame)
        points = inset === 0 ? points : offsetPolygon(points, -inset);

        // Draw the shape
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            context.lineTo(points[i].x, points[i].y);
        }
        context.closePath();
    }

    render() {
        // Get the context
        if (!this.manager.canvas) return;
        const context = this.manager.canvas.getContext('2d');
        if (!context) {
            throw new Error('No context');
        }

        // Clear, setup, and translate the canvas
        context.fillStyle = this.manager.style.backgroundColor;
        context.fillRect(
            0,
            0,
            this.manager.canvas.width,
            this.manager.canvas.height,
        );
        context.save();
        context.translate(
            this.manager.canvas.width / 2,
            this.manager.canvas.height / 2,
        );
        context.scale(this.manager.zoom, this.manager.zoom);
        context.lineWidth = BUILD_STROKE_WIDTH / this.manager.zoom;
        context.lineJoin = 'round';
        context.lineCap = 'round';

        // Apply global rotation
        context.rotate(this.manager.globalRotation * (Math.PI / 180));

        // Draw tile repeats first
        const selectedRepeats: Tile[] = [];
        this.manager.model.tiles.forEach((tile) => {
            if (tile.id === this.manager.selectedTileId) {
                selectedRepeats.push(tile);
            } else {
                this.renderTile(context, tile, true);
            }
        });
        if (this.manager.model.progressTile) {
            this.renderTile(context, this.manager.model.progressTile, true);
        }
        selectedRepeats.forEach((tile) => {
            this.renderTile(context, tile, true);
        });

        // Now draw the active area
        let selectedTile: Tile | null = null;
        this.manager.model.tiles.forEach((tile) => {
            if (tile.id === this.manager.selectedTileId) {
                selectedTile = tile;
            } else {
                this.renderTile(context, tile);
            }
        });
        if (this.manager.model.progressTile) {
            this.renderTile(context, this.manager.model.progressTile);
        }
        if (selectedTile) {
            this.renderTile(context, selectedTile);
        }

        if (this.manager.mode === 'build') {
            // Draw the progress OR the available anchors
            if (
                this.manager.progressPoints.length > 0 &&
                this.manager.hoverPoint
            ) {
                // Draw path to hover point if there is no progress tile
                const activeStrokeColor = Color(
                    this.manager.style.backgroundColor,
                ).isDark()
                    ? ACTIVE_STROKE_COLOR_LIGHT
                    : ACTIVE_STROKE_COLOR_DARK;
                context.strokeStyle = activeStrokeColor;
                if (!this.manager.model.progressTile) {
                    context.beginPath();
                    context.moveTo(
                        this.manager.progressPoints[0].x,
                        this.manager.progressPoints[0].y,
                    );
                    context.lineTo(
                        this.manager.hoverPoint.x,
                        this.manager.hoverPoint.y,
                    );
                    context.lineWidth = BUILD_STROKE_WIDTH / this.manager.zoom;
                    context.stroke();
                }
                // Draw progress points
                this.manager.progressPoints.forEach((point) => {
                    this.renderHandle(context, point);
                });
                // Draw hover point
                this.renderHandle(context, this.manager.hoverPoint);
            } else {
                // Draw anchors
                this.manager.model.anchors.forEach((anchor) => {
                    this.renderHandle(context, anchor);
                });
            }
        }

        // Reset translation
        context.restore();
    }
}
