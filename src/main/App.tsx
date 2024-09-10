import React from 'react';
import { useTileManager } from '../tile/TileManagerHook';
import useIsTouchDevice from '../util/TouchDeviceHook';
import Canvas from './Canvas';
import Overlay from './Overlay';
import { StateProvider } from './StateContext';

const App: React.FC = () => {
    const manager = useTileManager();
    const isTouchDevice = useIsTouchDevice();

    return (
        <StateProvider manager={manager}>
            {!isTouchDevice ? (
                <div className="relative h-screen w-screen select-none">
                    <Canvas />
                    <Overlay />
                </div>
            ) : (
                <div className="flex w-screen items-center justify-center px-16 py-32">
                    <p className="text-left text-lg max-w-screen-sm">
                        <b>Rad Tile</b> is not yet optimized for touch devices.
                        Please return in a desktop browser for the best
                        experience!
                    </p>
                </div>
            )}
        </StateProvider>
    );
};

export default App;
