import React, { useEffect, useState } from 'react';
import ColorPicker from '../components/ColorPicker';
import SimpleSlider from '../components/SimpleSlider';
import { TileManager } from '../tile/TileManager';

interface ContentsRenderProps {
    manager: TileManager;
}

const ContentsRender: React.FC<ContentsRenderProps> = ({ manager }) => {
    const [strokeColor, setStrokeColor] = useState<string>(
        manager.style.strokeColor,
    );
    const [backgroundColor, setBackgroundColor] = useState<string>(
        manager.style.backgroundColor,
    );
    const [strokeWidth, setStrokeWidth] = useState(manager.style.strokeWidth);

    useEffect(() => {
        manager.style.strokeWidth = strokeWidth;
    }, [strokeWidth, manager.style]);

    const handleColorChange = (color: string) => {
        setStrokeColor(color);
        manager.style.strokeColor = color;
    };

    const handleBackgroundColorChange = (color: string) => {
        setBackgroundColor(color);
        manager.style.backgroundColor = color;
    };

    return (
        <div className="flex flex-col gap-2">
            <SimpleSlider
                value={strokeWidth}
                setValue={setStrokeWidth}
                min={0}
                max={20}
                step={1}
                label="Stroke Width"
            />
            <ColorPicker
                color={strokeColor}
                setColor={handleColorChange}
                label="Stroke Color"
            />
            <ColorPicker
                color={backgroundColor}
                setColor={handleBackgroundColorChange}
                label="Background Color"
            />
        </div>
    );
};

export default ContentsRender;
