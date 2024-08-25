import React, { useEffect, useState } from 'react';
import ClearButton from '../components/ClearButton';
import ModeSelector from '../components/ModeSelector';
import OverlayHeader from '../components/OverlayHeader';
import RepeatSlider from '../components/RepeatSlider';
import ShapeSelector from '../components/ShapeSelector';
import {
    ShapeType,
    TileManager,
    TileManagerEvent,
    TileManagerMode,
} from '../tile/TileManager';

const DEFAULT_REPEATS = 8;

interface OverlayProps {
    manager: TileManager | null;
}

const Overlay: React.FC<OverlayProps> = ({ manager }) => {
    const [activeMode, setActiveMode] = useState<TileManagerMode>('build');
    const [repeats, setRepeats] = useState<number>(DEFAULT_REPEATS);
    const [baseRepeats, setBaseRepeats] = useState<number | null>(null);
    const [activeShape, setActiveShape] = useState<ShapeType>('quad');

    const handleShapeChange = (shape: ShapeType) => {
        setActiveShape(shape);
        manager?.setShape(shape);
    };

    useEffect(() => {
        const addRemoveListener = (event: TileManagerEvent) => {
            setBaseRepeats(
                event.newMinRepeats !== Infinity ? event.newMinRepeats : null,
            );
        };

        if (manager) {
            manager.addEventListener('add', addRemoveListener);
            manager.addEventListener('remove', addRemoveListener);
        }
        return () => {
            manager?.removeEventListener('add', addRemoveListener);
            manager?.removeEventListener('remove', addRemoveListener);
        };
    }, [manager, baseRepeats, repeats]);

    const handleModeChange = (mode: TileManagerMode) => {
        setActiveMode(mode);
        manager?.setMode(mode);
    };

    const repeatSliderSet = (repeatCount: number) => {
        setRepeats(repeatCount);
        manager?.setRepeats(repeatCount);
    };

    const handleClear = () => {
        manager?.clear();
        handleModeChange('build');
        setBaseRepeats(null);
        setRepeats(DEFAULT_REPEATS);
        manager?.setRepeats(DEFAULT_REPEATS);
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
                <>
                    <ShapeSelector
                        activeShape={activeShape}
                        handleShapeChange={handleShapeChange}
                    />
                    <RepeatSlider
                        repeats={repeats}
                        setRepeats={repeatSliderSet}
                        baseRepeats={baseRepeats}
                    />
                </>
            )}
            {activeMode === 'paint' && (
                <p className="text-center">Painting tools coming soon.</p>
            )}
        </div>
    );
};

export default Overlay;
