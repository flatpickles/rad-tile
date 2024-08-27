import React, { useEffect, useState } from 'react';
import RepeatSlider from '../components/RepeatSlider';
import ShapeSelector from '../components/ShapeSelector';
import { ShapeType, TileManager, TileManagerEvent } from '../tile/TileManager';

// todo centralize deafults
const DEFAULT_REPEATS = 8;

interface ContentsBuildProps {
    manager: TileManager;
}

const ContentsBuild: React.FC<ContentsBuildProps> = ({ manager }) => {
    const [repeats, setRepeats] = useState<number>(DEFAULT_REPEATS);
    const [baseRepeats, setBaseRepeats] = useState<number | null>(null);
    const [activeShape, setActiveShape] = useState<ShapeType>('quad');

    const handleShapeChange = (shape: ShapeType) => {
        setActiveShape(shape);
        manager.setShape(shape);
    };

    const repeatSliderSet = (repeatCount: number) => {
        setRepeats(repeatCount);
        manager?.setRepeats(repeatCount);
    };

    useEffect(() => {
        // Reset state
        setBaseRepeats(null);
        setRepeats(DEFAULT_REPEATS);
        manager.setRepeats(DEFAULT_REPEATS);

        // Track shape addition and removal
        const addRemoveListener = (event: TileManagerEvent) => {
            setBaseRepeats(
                event.newMinRepeats !== Infinity ? event.newMinRepeats : null,
            );
        };
        manager.addEventListener('add', addRemoveListener);
        manager.addEventListener('remove', addRemoveListener);
        return () => {
            manager.removeEventListener('add', addRemoveListener);
            manager.removeEventListener('remove', addRemoveListener);
        };
    }, [manager]);

    return (
        <div className="flex flex-col gap-2">
            <ShapeSelector
                activeShape={activeShape}
                handleShapeChange={handleShapeChange}
            />
            <RepeatSlider
                repeats={repeats}
                setRepeats={repeatSliderSet}
                baseRepeats={baseRepeats}
            />
        </div>
    );
};

export default ContentsBuild;
