export type TileManagerMode = 'build' | 'render';
export type ShapeType = 'quad' | 'tri' | 'free';

export type TileManagerEventType = 'add' | 'remove';
export type TileManagerEvent = {
    type: TileManagerEventType;
    newMinRepeats: number;
};

export type TileStyle = {
    backgroundColor: string;
    strokeColor: string;
    strokeWidth: number;
    currentColor: string;
};
