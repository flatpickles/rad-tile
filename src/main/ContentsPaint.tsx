import React, { useState } from 'react';
import { TileManager } from '../tile/TileManager';

interface ContentsPaintProps {
    manager: TileManager;
}

const ContentsPaint: React.FC<ContentsPaintProps> = ({ manager }) => {
    const [activeColor, setActiveColor] = useState<string>('#000000');

    const handleColorChange = (color: string) => {
        setActiveColor(color);
        console.log(color, manager); // todo
    };

    return (
        <div className="contents-paint">
            <p className="text-center">Painting tools coming soon.</p>
            <div className="mb-4 hidden">
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
        </div>
    );
};

export default ContentsPaint;
