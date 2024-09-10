import React, { useEffect } from 'react';
import CenterShapeSelector from '../components/CenterShapeSelector';
import RepeatSlider from '../components/RepeatSlider';
import ShapeSelector from '../components/ShapeSelector';
import { ShapeType, TileManagerEvent } from '../tile/TileTypes';
import useStateContext from './StateContext';

const ContentsBuild: React.FC = () => {
    const {
        manager,
        repeats,
        setRepeats,
        baseRepeats,
        setBaseRepeats,
        activeShape,
        setActiveShape,
        centerShapeEnabled,
        setCenterShapeEnabled,
        useCenterShape,
        setUseCenterShape,
        shapeCorners,
        setShapeCorners,
    } = useStateContext();

    const initializeWithCenterShape = (corners: number) => {
        manager.initializeWithCenterShape(corners);
        setRepeats(corners);
        setBaseRepeats(corners);
        manager.setRepeats(corners);
    };

    const handleShapeChange = (shape: ShapeType) => {
        setActiveShape(shape);
        manager.setShape(shape);
    };

    const repeatSliderSet = (repeatCount: number) => {
        setRepeats(repeatCount);
        manager.setRepeats(repeatCount);
    };

    const handleUseCenterShapeChange = (useCenterShape: boolean) => {
        setUseCenterShape(useCenterShape);
        if (useCenterShape) {
            initializeWithCenterShape(shapeCorners);
        } else {
            manager.reset(false);
            setBaseRepeats(null);
        }
    };

    const handleCenterShapeCornersChange = (corners: number) => {
        setShapeCorners(corners);
        if (useCenterShape) {
            initializeWithCenterShape(corners);
        }
    };

    useEffect(() => {
        const addRemoveListener = (event: TileManagerEvent) => {
            const centerOnly =
                event.currentTiles.length === 1 &&
                event.currentTiles[0].isCenter;
            setBaseRepeats(
                event.newMinRepeats !== Infinity
                    ? event.newMinRepeats
                    : centerOnly
                      ? event.currentTiles[0].corners.length
                      : null,
            );
            setCenterShapeEnabled(
                event.currentTiles.length === 0 || centerOnly,
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
        <div className="flex flex-col gap-4">
            <ShapeSelector
                activeShape={activeShape}
                handleShapeChange={handleShapeChange}
            />
            <RepeatSlider
                repeats={repeats}
                setRepeats={repeatSliderSet}
                baseRepeats={baseRepeats}
            />
            <CenterShapeSelector
                enabled={centerShapeEnabled}
                shapeCorners={shapeCorners}
                setShapeCorners={handleCenterShapeCornersChange}
                useCenterShape={useCenterShape}
                setUseCenterShape={handleUseCenterShapeChange}
            />
        </div>
    );
};

export default ContentsBuild;
