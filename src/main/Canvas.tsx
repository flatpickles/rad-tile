import React, { useEffect, useRef } from 'react';
import { TileManager } from '../tile/TileManager';

const dpr = window.devicePixelRatio || 1;

interface CanvasProps {
    manager: TileManager;
}

const Canvas: React.FC<CanvasProps> = ({ manager }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Make it smoooooth
        const ctx = canvas.getContext('2d', {
            antialias: true,
        }) as CanvasRenderingContext2D;
        if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
        }

        // Set manager canvas
        manager.canvas = canvas;

        // Resize the canvas to the window size as needed
        const handleResize = () => {
            if (canvas) {
                // Set the canvas size with DPR
                canvas.width = canvas.clientWidth * dpr;
                canvas.height = canvas.clientHeight * dpr;
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        // Add wheel event listener for zooming on the canvas only
        const handleWheel = (event: WheelEvent) => {
            event.preventDefault();
            manager.applyZoom(event.deltaY);
        };
        canvas.addEventListener('wheel', handleWheel, { passive: false });

        // Add keydown event listener for escape
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                manager.cancelInput();
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        // Clean up
        return () => {
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', handleKeyDown);
        };
    });

    const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        manager.inputSelect(
            event.nativeEvent.offsetX * dpr,
            event.nativeEvent.offsetY * dpr,
        );
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        manager.inputMove(
            event.nativeEvent.offsetX * dpr,
            event.nativeEvent.offsetY * dpr,
        );
    };

    const handleContextMenu = (event: React.MouseEvent<HTMLCanvasElement>) => {
        // Prevent default if the input is used
        if (manager.inputContextSelect()) {
            event.preventDefault();
        }
    };

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full absolute top-0 left-0"
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            onMouseMove={handleMouseMove}
        />
    );
};

export default Canvas;
