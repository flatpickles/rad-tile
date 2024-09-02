import { useEffect, useRef } from 'react';
import { TileManager } from './TileManager';

export function useTileManager() {
    const managerRef = useRef<TileManager | null>(null);
    const requestRef = useRef<number>();

    if (!managerRef.current) {
        managerRef.current = new TileManager();
    }

    useEffect(() => {
        // Reset on hot reload
        if (import.meta.hot) {
            const hot = import.meta.hot;
            hot.on('vite:beforeUpdate', () => {
                console.log('Hot update detected, resetting TileManager');
                managerRef.current = new TileManager();
            });
        }

        // Animate refreshes
        const animate = () => {
            if (managerRef.current) {
                managerRef.current.render();
            }
            requestRef.current = requestAnimationFrame(animate);
        };
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, []);

    return managerRef.current;
}
