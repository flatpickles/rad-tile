import React from 'react';
import CenterShapeSelector from '../components/CenterShapeSelector';
import RepeatSlider from '../components/RepeatSlider';
import ShapeSelector from '../components/ShapeSelector';
import { ShapeType } from '../tile/TileTypes';
import useStateContext from './StateContext';

const ContentsBuild: React.FC = () => {
    const {
        manager,
        repeats,
        setRepeats,
        baseRepeats,
        activeShape,
        setActiveShape,
        centerShapeAvailable,
        useCenterShape,
        setUseCenterShape,
        shapeCorners,
        setShapeCorners,
    } = useStateContext();

    const handleShapeChange = (shape: ShapeType) => {
        setActiveShape(shape);
        manager.setShape(shape);
    };

    const repeatSliderSet = (repeatCount: number) => {
        setRepeats(repeatCount);
        manager.setRepeats(repeatCount);
    };

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
                enabled={centerShapeAvailable}
                shapeCorners={shapeCorners}
                setShapeCorners={setShapeCorners}
                useCenterShape={useCenterShape}
                setUseCenterShape={setUseCenterShape}
            />
        </div>
    );
};

export default ContentsBuild;
