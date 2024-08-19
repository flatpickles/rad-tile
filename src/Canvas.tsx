import React, { useEffect, useRef, useState } from 'react';
import { TileManager } from './TileManager';

const Canvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [tileManager] = useState(() => new TileManager());
    const rafIdRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Get the device pixel ratio
        const dpr = window.devicePixelRatio || 1;

        // Resize the canvas to the window size as needed
        const handleResize = () => {
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                canvas.style.width = `${rect.width}px`;
                canvas.style.height = `${rect.height}px`;

                // Scale the canvas context
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.scale(dpr, dpr);
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                }
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
    }, [tileManager]);

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
            className="w-full h-full absolute top-0 left-0"
            onClick={handleClick}
            onMouseMove={handleMouseMove}
        />
    );
};

export default Canvas;
