import React, { useState } from 'react';
import SimpleSlider from './SimpleSlider';

/*
    todo:
    - centralize state values
    - disable after shape is started
    - set repeats accordingly
    - handle reset
    - make it pretty
*/

interface CenterShapeSelectorProps {
    enabled: boolean;
}

const CenterShapeSelector: React.FC<CenterShapeSelectorProps> = ({
    enabled,
}) => {
    const [useCenterShape, setUseCenterShape] = useState(false);
    const [shapeCorners, setShapeCorners] = useState(3);
    const [shapeSize, setShapeSize] = useState(100);

    return (
        <div
            className={`flex flex-col gap-2 ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}
        >
            <div className="form-control">
                <label className="label cursor-pointer p-0">
                    <span
                        className={`font-bold label-text text-base ${
                            !enabled ? 'btn-secondary opacity-50' : ''
                        }`}
                    >
                        Use Center Shape
                    </span>
                    <input
                        type="checkbox"
                        className="toggle"
                        checked={useCenterShape}
                        onChange={(e) => setUseCenterShape(e.target.checked)}
                    />
                </label>
            </div>

            <SimpleSlider
                value={shapeCorners}
                setValue={setShapeCorners}
                min={3}
                max={12}
                step={1}
                label="Shape Corners"
                disabled={!useCenterShape}
            />

            <SimpleSlider
                value={shapeSize}
                setValue={setShapeSize}
                min={50}
                max={200}
                step={10}
                label="Shape Size"
                disabled={!useCenterShape}
            />
        </div>
    );
};

export default CenterShapeSelector;
