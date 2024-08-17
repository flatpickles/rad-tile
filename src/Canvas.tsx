import React, { useEffect, useRef } from 'react';

interface CanvasProps {
    rectSize: number;
}

const Canvas: React.FC<CanvasProps> = ({ rectSize }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'lightgray';
                ctx.fillRect(0, 0, canvas.width!, canvas.height!);
            }
        }
    }, []);

    const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const rect = canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                ctx.fillStyle = 'blue';
                ctx.fillRect(
                    x - rectSize / 2,
                    y - rectSize / 2,
                    rectSize,
                    rectSize,
                );
            }
        }
    };

    return (
        <canvas
            ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight}
            onClick={handleClick}
            className="absolute top-0 left-0"
        />
    );
};

export default Canvas;
