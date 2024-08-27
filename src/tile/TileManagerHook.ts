import { useCallback, useEffect, useRef } from 'react';
import { TileManager } from '../tile/TileManager';

export function useTileManager() {
    const managerRef = useRef<TileManager | null>(null);
    const requestRef = useRef<number>();

    if (!managerRef.current) {
        managerRef.current = new TileManager();
    }

    const animate = useCallback(() => {
        if (managerRef.current) {
            managerRef.current.render();
        }
        requestRef.current = requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [animate]);

    return managerRef.current;
}
