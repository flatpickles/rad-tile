import React from 'react';
import { Defaults } from '../util/Defaults';
import SimpleSlider from './SimpleSlider';

interface CenterShapeSelectorProps {
    enabled: boolean;
    shapeCorners: number;
    setShapeCorners: (value: number) => void;
    useCenterShape: boolean;
    setUseCenterShape: (value: boolean) => void;
}

const CenterShapeSelector: React.FC<CenterShapeSelectorProps> = ({
    enabled,
    shapeCorners,
    setShapeCorners,
    useCenterShape,
    setUseCenterShape,
}) => {
    return (
        <div
            className={`flex flex-col gap-1 ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}
        >
            <div className="form-control">
                <label className="label cursor-pointer p-0">
                    <span
                        className={`label-text text-base ${
                            !enabled ? 'btn-secondary opacity-50' : ''
                        }`}
                    >
                        Center Corners: {shapeCorners}
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
                max={Defaults.maxCenterCorners}
                step={1}
                disabled={!useCenterShape}
            />
        </div>
    );
};

export default CenterShapeSelector;
