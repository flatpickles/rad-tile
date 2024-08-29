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
    const [currentColor, setCurrentColor] = useState<string>(
        manager.style.currentColor,
    );

    useEffect(() => {
        manager.style.strokeWidth = strokeWidth;
    }, [strokeWidth, manager.style]);

    const handleStrokeColorChange = (color: string) => {
        setStrokeColor(color);
        manager.style.strokeColor = color;
    };

    const handleCurrentColorChange = (color: string) => {
        setCurrentColor(color);
        manager.style.currentColor = color;
    };

    const handleBackgroundColorChange = (color: string) => {
        setBackgroundColor(color);
        manager.style.backgroundColor = color;
    };

    return (
        <div className="flex flex-col gap-2">
            <ColorPicker
                color={currentColor}
                setColor={handleCurrentColorChange}
                label="Apply Color"
            />
            <ColorPicker
                color={backgroundColor}
                setColor={handleBackgroundColorChange}
                label="Background Color"
            />
            <ColorPicker
                color={strokeColor}
                setColor={handleStrokeColorChange}
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
