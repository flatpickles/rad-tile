import React, { useEffect, useRef } from 'react';
import { TileManager } from './TileManager';

const dpr = window.devicePixelRatio || 1;

interface CanvasProps {
    setManager: (manager: TileManager) => void;
}

const Canvas: React.FC<CanvasProps> = ({ setManager }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const tileManagerRef = useRef<TileManager | null>(null);
    const rafIdRef = useRef<number | null>(null);

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

        // Initialize TileManager only once
        if (!tileManagerRef.current) {
            tileManagerRef.current = new TileManager(canvas);
            setManager(tileManagerRef.current);
        }

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

        // Add wheel event listener for zooming
        const handleWheel = (event: WheelEvent) => {
            event.preventDefault();
            if (tileManagerRef.current) {
                if (event.deltaY > 0) {
                    tileManagerRef.current.zoomOut();
                } else {
                    tileManagerRef.current.zoomIn();
                }
            }
        };
        window.addEventListener('wheel', handleWheel, { passive: false });

        // Add keydown event listener for escape
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (tileManagerRef.current) {
                    tileManagerRef.current.cancelInput();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        // Set up the render loop
        const render = () => {
            if (tileManagerRef.current) {
                tileManagerRef.current.render();
            }
            rafIdRef.current = requestAnimationFrame(render);
        };
        render();

        // Clean up
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', handleKeyDown);
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    });

    const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (tileManagerRef.current) {
            tileManagerRef.current.inputSelect(
                event.nativeEvent.offsetX * dpr,
                event.nativeEvent.offsetY * dpr,
            );
        }
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (tileManagerRef.current) {
            tileManagerRef.current.inputMove(
                event.nativeEvent.offsetX * dpr,
                event.nativeEvent.offsetY * dpr,
            );
        }
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
