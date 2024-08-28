import React from 'react';
import { useTileManager } from '../tile/TileManagerHook';
import useIsTouchDevice from '../util/TouchDeviceHook';
import Canvas from './Canvas';
import Overlay from './Overlay';

const App: React.FC = () => {
    const manager = useTileManager();
    const isTouchDevice = useIsTouchDevice();

    return (
        <>
            {!isTouchDevice ? (
                <div className="relative h-screen w-screen select-none">
                    <Canvas manager={manager} />
                    <Overlay manager={manager} />
                </div>
            ) : (
                <div className="flex h-screen w-screen items-center justify-center p-4">
                    <p className="text-left text-lg max-w-screen-sm">
                        <b>Rad Tile</b> is not yet optimized for touch devices.
                        Please return in a desktop browser for the best
                        experience!
                    </p>
                </div>
            )}
        </>
    );
};

export default App;
