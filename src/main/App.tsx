import React from 'react';
import { useTileManager } from '../tile/TileManagerHook';
import Canvas from './Canvas';
import Overlay from './Overlay';

const App: React.FC = () => {
    const manager = useTileManager();

    return (
        <div className="relative h-screen w-screen select-none">
            <Canvas manager={manager} />
            <Overlay manager={manager} />
        </div>
    );
};

export default App;
