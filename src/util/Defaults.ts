import { ShapeType, TileManagerMode, TileStyle } from '../tile/TileTypes';

export const Defaults: {
    repeats: number;
    maxRepeats: number;
    maxCenterCorners: number;
    shape: ShapeType;
    mode: TileManagerMode;
    style: TileStyle;
} = {
    repeats: 8,
    maxRepeats: 16,
    maxCenterCorners: 8,
    shape: 'quad',
    mode: 'build',
    style: {
        backgroundColor: '#f0f0f0',
        strokeColor: '#000000',
        strokeWidth: 7,
        currentColor: '#facade',
        tileInset: 0,
    },
};
