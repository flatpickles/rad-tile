import React, { useEffect, useRef, useState } from 'react';
import { TileManager } from './TileManager';

const Canvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [tileManager] = useState(() => new TileManager());
    const rafIdRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Resize the canvas to the window size as needed
        const handleResize = () => {
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        // Set up the render loop
        const render = () => {
            tileManager.render(canvas);
            rafIdRef.current = requestAnimationFrame(render);
        };
        render();

        // Clean up
        return () => {
            window.removeEventListener('resize', handleResize);
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    });

    const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        tileManager.inputSelect(
            event.nativeEvent.offsetX,
            event.nativeEvent.offsetY,
        );
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        tileManager.inputMove(
            event.nativeEvent.offsetX,
            event.nativeEvent.offsetY,
        );
    };

    return (
        <canvas
            ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            className="absolute top-0 left-0"
        />
    );
};

export default Canvas;
