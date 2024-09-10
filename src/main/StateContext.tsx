import { createContext, useContext, useEffect, useState } from 'react';
import { TileManager } from '../tile/TileManager';
import {
    ShapeType,
    TileManagerEvent,
    TileManagerMode,
} from '../tile/TileTypes';
import { Defaults } from '../util/Defaults';

interface StateContextType {
    manager: TileManager;
    repeats: number;
    setRepeats: (repeats: number) => void;
    activeShape: ShapeType;
    setActiveShape: (shape: ShapeType) => void;
    baseRepeats: number | null;
    setBaseRepeats: (baseRepeats: number | null) => void;
    centerShapeAvailable: boolean;
    setCenterShapeAvailable: (centerShapeAvailable: boolean) => void;
    useCenterShape: boolean;
    setUseCenterShape: (useCenterShape: boolean) => void;
    shapeCorners: number;
    setShapeCorners: (shapeCorners: number) => void;
    activeMode: TileManagerMode;
    setActiveMode: (mode: TileManagerMode) => void;
    handleReset: () => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateProvider: React.FC<{
    children: React.ReactNode;
    manager: TileManager;
}> = ({ children, manager }) => {
    // Mode state:
    const [activeMode, setActiveModeState] = useState<TileManagerMode>(
        Defaults.mode,
    );

    const setActiveMode = (mode: TileManagerMode) => {
        setActiveModeState(mode);
        manager.setMode(mode);
    };

    const handleReset = () => {
        setRepeats(Defaults.repeats);
        setBaseRepeats(null);
        setActiveShape(Defaults.shape);
        setCenterShapeAvailable(true);
        setUseCenterShapeState(false);
        setShapeCornersState(3);
        setActiveModeState(Defaults.mode);
        manager.reset();
    };

    // Build state:
    const [repeats, setRepeats] = useState(Defaults.repeats);
    const [activeShape, setActiveShape] = useState<ShapeType>(Defaults.shape);
    const [baseRepeats, setBaseRepeats] = useState<number | null>(null);
    const [centerShapeAvailable, setCenterShapeAvailable] = useState(true);
    const [useCenterShape, setUseCenterShapeState] = useState(false);
    const [shapeCorners, setShapeCornersState] = useState(3);

    const initializeWithCenterShape = (corners: number) => {
        manager.initializeWithCenterShape(corners);
        setRepeats(corners);
        setBaseRepeats(corners);
        manager.setRepeats(corners);
    };

    const setUseCenterShape = (useCenterShape: boolean) => {
        setUseCenterShapeState(useCenterShape);
        if (useCenterShape) {
            initializeWithCenterShape(shapeCorners);
        } else {
            manager.reset(false);
            setBaseRepeats(null);
        }
    };

    const setShapeCorners = (corners: number) => {
        setShapeCornersState(corners);
        if (useCenterShape) {
            initializeWithCenterShape(corners);
        }
    };

    // Render state: todo

    useEffect(() => {
        // Reset on hot reload
        if (import.meta.hot) {
            const hot = import.meta.hot;
            hot.on('vite:beforeUpdate', () => {
                console.log('Hot update detected, resetting StateContext');
                handleReset();
            });
        }

        // Handle tile manager events:
        const addRemoveListener = (event: TileManagerEvent) => {
            const centerOnly =
                event.currentTiles.length === 1 &&
                event.currentTiles[0].isCenter;
            setBaseRepeats(
                event.newMinRepeats !== Infinity
                    ? event.newMinRepeats
                    : centerOnly
                      ? event.currentTiles[0].corners.length
                      : null,
            );
            setCenterShapeAvailable(
                event.currentTiles.length === 0 || centerOnly,
            );
        };
        manager.addEventListener('add', addRemoveListener);
        manager.addEventListener('remove', addRemoveListener);
        return () => {
            manager.removeEventListener('add', addRemoveListener);
            manager.removeEventListener('remove', addRemoveListener);
        };
    });

    // Return state provider:
    return (
        <StateContext.Provider
            value={{
                manager,
                repeats,
                setRepeats,
                activeShape,
                setActiveShape,
                baseRepeats,
                setBaseRepeats,
                centerShapeAvailable,
                setCenterShapeAvailable,
                useCenterShape,
                setUseCenterShape,
                shapeCorners,
                setShapeCorners,
                activeMode,
                setActiveMode,
                handleReset,
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

const useStateContext = () => {
    const context = useContext(StateContext);
    if (!context) {
        throw new Error('useStateContext must be used within a StateProvider');
    }
    return context;
};

// eslint-disable-next-line react-refresh/only-export-components
export default useStateContext;
