import React, { useState } from 'react';
import { TileManager } from '../tile/TileManager';
import Canvas from './Canvas';
import Overlay from './Overlay';

const App: React.FC = () => {
    // todo: lift manager ownership out of canvas component
    const [manager, setManager] = useState<TileManager | null>(null);

    return (
        <div className="relative h-screen w-screen">
            <Canvas setManager={setManager} />
            <Overlay manager={manager} />
        </div>
    );
};

export default App;
