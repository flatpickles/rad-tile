import React from 'react';
import ColorPicker from '../components/ColorPicker';
import SimpleSlider from '../components/SimpleSlider';
import useStateContext from './StateContext';

const ContentsRender: React.FC = () => {
    const {
        currentColor,
        setCurrentColor,
        backgroundColor,
        setBackgroundColor,
        strokeColor,
        setStrokeColor,
        strokeWidth,
        setStrokeWidth,
    } = useStateContext();

    return (
        <div className="flex flex-col gap-2">
            <ColorPicker
                color={currentColor}
                setColor={setCurrentColor}
                label="Apply Color"
            />
            <ColorPicker
                color={backgroundColor}
                setColor={setBackgroundColor}
                label="Background Color"
            />
            <ColorPicker
                color={strokeColor}
                setColor={setStrokeColor}
                label="Stroke Color"
            />
            <SimpleSlider
                value={strokeWidth}
                setValue={setStrokeWidth}
                min={0}
                max={20}
                step={1}
                label="Stroke Width"
            />
        </div>
    );
};

export default ContentsRender;
