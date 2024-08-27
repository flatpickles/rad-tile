import React, { useEffect, useState } from 'react';
import ColorPicker from '../components/ColorPicker';
import SimpleSlider from '../components/SimpleSlider';
import { TileManager } from '../tile/TileManager';

interface ContentsPaintProps {
    manager: TileManager;
}

const ContentsPaint: React.FC<ContentsPaintProps> = ({ manager }) => {
    const [strokeColor, setStrokeColor] = useState<string>(
        manager.style.strokeColor,
    );
    const [strokeWidth, setStrokeWidth] = useState(manager.style.strokeWidth);

    useEffect(() => {
        manager.style.strokeWidth = strokeWidth;
    }, [strokeWidth, manager.style]);

    const handleColorChange = (color: string) => {
        setStrokeColor(color);
        manager.style.strokeColor = color;
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
        </div>
    );
};

export default ContentsPaint;
