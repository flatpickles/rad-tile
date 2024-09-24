import React from 'react';
import './ColorPicker.css';

interface ColorPickerProps {
    color: string;
    setColor: (color: string) => void;
    label?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
    color,
    setColor,
    label,
}) => {
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColor(e.target.value);
    };

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <div className="flex justify-between font-bold">
                    <p>{label}:</p>
                </div>
            )}

            <div className="w-full join h-8">
                <input
                    type="text"
                    value={color}
                    onChange={handleColorChange}
                    className="input input-bordered join-item h-full w-full"
                />
                <div className="color-picker-wrapper">
                    <input
                        type="color"
                        value={color}
                        onChange={handleColorChange}
                        className="color-picker"
                    />
                </div>
            </div>
        </div>
    );
};

export default ColorPicker;
