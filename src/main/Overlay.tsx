import React, { useState } from 'react';
import ClearButton from '../components/ClearButton';
import ModeSelector from '../components/ModeSelector';
import OverlayHeader from '../components/OverlayHeader';
import { ShapeType, TileManager, TileManagerMode } from '../tile/TileManager';
import ContentsBuild from './ContentsBuild';
import ContentsPaint from './ContentsPaint';

const DEFAULT_REPEATS = 8;

interface OverlayProps {
    manager: TileManager;
}

const Overlay: React.FC<OverlayProps> = ({ manager }) => {
    const [activeMode, setActiveMode] = useState<TileManagerMode>('build');
    const [repeats, setRepeats] = useState(DEFAULT_REPEATS);
    const [baseRepeats, setBaseRepeats] = useState<number | null>(null);
    const [activeShape, setActiveShape] = useState<ShapeType>('quad');

    const handleModeChange = (mode: TileManagerMode) => {
        setActiveMode(mode);
        manager?.setMode(mode);
    };

    const handleReset = () => {
        setRepeats(DEFAULT_REPEATS);
        setBaseRepeats(null);
        setActiveShape('quad');
        manager.setRepeats(DEFAULT_REPEATS);
        manager.setShape('quad');
        manager.clear();
        handleModeChange('build');
    };

    return (
        <div className="absolute top-10 right-10 p-4 shadow-sm rounded-lg bg-base-100 border bg-opacity-90 backdrop-blur-lg w-72 flex flex-col gap-2">
            <OverlayHeader />
            <div className="flex flex-row gap-2 w-full">
                <ModeSelector
                    activeMode={activeMode}
                    handleModeChange={handleModeChange}
                />
                <ClearButton handleClear={handleReset} />
            </div>
            {activeMode === 'build' && (
                <ContentsBuild
                    manager={manager}
                    repeats={repeats}
                    setRepeats={setRepeats}
                    baseRepeats={baseRepeats}
                    setBaseRepeats={setBaseRepeats}
                    activeShape={activeShape}
                    setActiveShape={setActiveShape}
                />
            )}
            {activeMode === 'paint' && <ContentsPaint manager={manager} />}
        </div>
    );
};

export default Overlay;
