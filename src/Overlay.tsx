import React from 'react';

interface OverlayProps {
    rectSize: number;
    setRectSize: (size: number) => void;
}

const Overlay: React.FC<OverlayProps> = ({ rectSize, setRectSize }) => {
    return (
        <div className="absolute top-10 right-10 p-4 shadow-lg">
            Overlay!!
            <p>Rectangle Size: {rectSize}px</p>
            <input
                type="range"
                min="10"
                max="200"
                value={rectSize}
                onChange={(e) => setRectSize(parseInt(e.target.value, 10))}
                className="w-full"
            />
        </div>
    );
};

export default Overlay;
