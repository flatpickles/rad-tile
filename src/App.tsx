import React, { useState } from 'react';
import Canvas from './Canvas';
import Overlay from './Overlay';
import { TileManager } from './TileManager';

const App: React.FC = () => {
    const [manager, setManager] = useState<TileManager | null>(null);

    return (
        <div className="relative h-screen w-screen">
            <Canvas setManager={setManager} />
            <Overlay manager={manager} />
        </div>
    );
};

export default App;
