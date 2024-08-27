import React, { useState } from 'react';
import ClearButton from '../components/ClearButton';
import ModeSelector from '../components/ModeSelector';
import OverlayHeader from '../components/OverlayHeader';
import { TileManager, TileManagerMode } from '../tile/TileManager';
import ContentsBuild from './ContentsBuild';
import ContentsPaint from './ContentsPaint';

interface OverlayProps {
    manager: TileManager;
}

const Overlay: React.FC<OverlayProps> = ({ manager }) => {
    const [activeMode, setActiveMode] = useState<TileManagerMode>('build');
    const [resetKey, setResetKey] = useState<number>(0);

    const handleModeChange = (mode: TileManagerMode) => {
        setActiveMode(mode);
        manager?.setMode(mode);
    };

    const handleClear = () => {
        manager?.clear();
        handleModeChange('build');
        setResetKey(resetKey + 1);
    };

    return (
        <div className="absolute top-10 right-10 p-4 shadow-sm rounded-lg bg-base-100 border bg-opacity-90 backdrop-blur-lg w-72 flex flex-col gap-2">
            <OverlayHeader />
            <div className="flex flex-row gap-2 w-full">
                <ModeSelector
                    activeMode={activeMode}
                    handleModeChange={handleModeChange}
                />
                <ClearButton handleClear={handleClear} />
            </div>
            {activeMode === 'build' && (
                <ContentsBuild manager={manager} key={resetKey} />
            )}
            {activeMode === 'paint' && <ContentsPaint manager={manager} />}
        </div>
    );
};

export default Overlay;
