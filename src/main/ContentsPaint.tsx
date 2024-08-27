import React, { useEffect, useState } from 'react';
import SimpleSlider from '../components/SimpleSlider';
import { TileManager } from '../tile/TileManager';

interface ContentsPaintProps {
    manager: TileManager;
}

const ContentsPaint: React.FC<ContentsPaintProps> = ({ manager }) => {
    const [activeColor, setActiveColor] = useState<string>('#000000');
    const [strokeWidth, setStrokeWidth] = useState(manager.style.strokeWidth);

    useEffect(() => {
        manager.style.strokeWidth = strokeWidth;
    }, [strokeWidth, manager.style]);

    const handleColorChange = (color: string) => {
        setActiveColor(color);
        console.log(color, manager); // todo
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2 hidden">
                <label
                    htmlFor="colorPicker"
                    className="block text-sm font-medium text-gray-700"
                >
                    Select Color
                </label>
                <input
                    type="color"
                    id="colorPicker"
                    value={activeColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>
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

export default ContentsPaint;
