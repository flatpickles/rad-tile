import React, { useState } from 'react';
import ClearButton from '../components/ClearButton';
import ModeSelector from '../components/ModeSelector';
import OverlayHeader from '../components/OverlayHeader';
import RepeatSlider from '../components/RepeatSlider';
import { TileManager, TileManagerMode } from '../tile/TileManager';

interface OverlayProps {
    manager: TileManager | null;
}

const Overlay: React.FC<OverlayProps> = ({ manager }) => {
    const [activeMode, setActiveMode] = useState<TileManagerMode>('add');
    const [repetitionCount, setRepetitionCount] = useState<number>(8);

    const handleModeChange = (mode: TileManagerMode) => {
        setActiveMode(mode);
        manager?.setMode(mode);
    };

    const handleRepetitionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRepetitionCount(parseInt(e.target.value));
        manager?.setRepetitionCount(parseInt(e.target.value));
    };

    const handleClear = () => {
        manager?.clear();
        handleModeChange('add');
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
            <RepeatSlider
                repeatCount={repetitionCount}
                handleRepeatChange={handleRepetitionChange}
            />
        </div>
    );
};

export default Overlay;
