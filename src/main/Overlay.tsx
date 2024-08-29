import React, { useState } from 'react';
import ClearButton from '../components/ClearButton';
import ModeSelector from '../components/ModeSelector';
import OverlayHeader from '../components/OverlayHeader';
import { TileManager } from '../tile/TileManager';
import { ShapeType, TileManagerMode } from '../tile/TileTypes';
import { Defaults } from '../util/Defaults';
import ContentsBuild from './ContentsBuild';
import ContentsRender from './ContentsRender';

interface OverlayProps {
    manager: TileManager;
}

const Overlay: React.FC<OverlayProps> = ({ manager }) => {
    const [activeMode, setActiveMode] = useState<TileManagerMode>('build');
    const [repeats, setRepeats] = useState(Defaults.repeats);
    const [baseRepeats, setBaseRepeats] = useState<number | null>(null);
    const [activeShape, setActiveShape] = useState<ShapeType>('quad');

    const handleModeChange = (mode: TileManagerMode) => {
        setActiveMode(mode);
        manager.setMode(mode);
    };

    const handleReset = () => {
        setRepeats(Defaults.repeats);
        setBaseRepeats(null);
        setActiveShape(Defaults.shape);
        handleModeChange('build');
        manager.reset();
    };

    return (
        <div className="absolute shadow-sm p-4 rounded-lg bg-base-100 border bg-opacity-90 backdrop-blur-lg flex flex-col gap-2 inset-4 top-auto max-h-96 sm:top-8 sm:left-auto sm:right-8 sm:bottom-auto sm:w-72 sm:max-h-[calc(100vh-4rem)] overflow-y-auto">
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
            {activeMode === 'render' && <ContentsRender manager={manager} />}
        </div>
    );
};

export default Overlay;
