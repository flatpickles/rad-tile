import React, { useEffect } from 'react';
import RepeatSlider from '../components/RepeatSlider';
import ShapeSelector from '../components/ShapeSelector';
import { TileManager } from '../tile/TileManager';
import { ShapeType, TileManagerEvent } from '../tile/TileTypes';

interface ContentsBuildProps {
    manager: TileManager;
    repeats: number;
    setRepeats: (repeats: number) => void;
    activeShape: ShapeType;
    setActiveShape: (shape: ShapeType) => void;
    baseRepeats: number | null;
    setBaseRepeats: (baseRepeats: number | null) => void;
}

const ContentsBuild: React.FC<ContentsBuildProps> = ({
    manager,
    repeats,
    setRepeats,
    baseRepeats,
    setBaseRepeats,
    activeShape,
    setActiveShape,
}) => {
    const handleShapeChange = (shape: ShapeType) => {
        setActiveShape(shape);
        manager.setShape(shape);
    };

    const repeatSliderSet = (repeatCount: number) => {
        setRepeats(repeatCount);
        manager.setRepeats(repeatCount);
    };

    useEffect(() => {
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
    });

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
