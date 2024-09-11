import React from 'react';
import CenterShapeSelector from '../components/CenterShapeSelector';
import RepeatSlider from '../components/RepeatSlider';
import ShapeSelector from '../components/ShapeSelector';
import SimpleSlider from '../components/SimpleSlider';
import useStateContext from './StateContext';

const ContentsBuild: React.FC = () => {
    const {
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
        globalRotation,
        setGlobalRotation,
    } = useStateContext();

    return (
        <div className="flex flex-col gap-4">
            <ShapeSelector
                activeShape={activeShape}
                setActiveShape={setActiveShape}
            />
            <RepeatSlider
                repeats={repeats}
                setRepeats={setRepeats}
                baseRepeats={baseRepeats}
            />
            <CenterShapeSelector
                enabled={centerShapeAvailable}
                shapeCorners={shapeCorners}
                setShapeCorners={setShapeCorners}
                useCenterShape={useCenterShape}
                setUseCenterShape={setUseCenterShape}
            />
            <SimpleSlider
                label="Rotation"
                value={globalRotation}
                setValue={setGlobalRotation}
                min={0}
                max={360}
            />
        </div>
    );
};

export default ContentsBuild;
