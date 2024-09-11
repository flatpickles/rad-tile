import { createContext, useContext, useEffect, useState } from 'react';
import { TileManager } from '../tile/TileManager';
import {
    ShapeType,
    TileManagerEvent,
    TileManagerMode,
} from '../tile/TileTypes';
import { Defaults } from '../util/Defaults';

// todo: rework this with useReducer, perhaps

interface StateContextType {
    manager: TileManager;
    handleReset: () => void;
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
    strokeColor: string;
    setStrokeColor: (color: string) => void;
    backgroundColor: string;
    setBackgroundColor: (color: string) => void;
    strokeWidth: number;
    setStrokeWidth: (width: number) => void;
    currentColor: string;
    setCurrentColor: (color: string) => void;
    globalRotation: number;
    setGlobalRotation: (rotation: number) => void;
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

    // Build state:
    const [repeats, setRepeatsState] = useState(Defaults.repeats);
    const [activeShape, setActiveShapeState] = useState<ShapeType>(
        Defaults.shape,
    );
    const [baseRepeats, setBaseRepeats] = useState<number | null>(null);
    const [centerShapeAvailable, setCenterShapeAvailable] = useState(true);
    const [useCenterShape, setUseCenterShapeState] = useState(false);
    const [shapeCorners, setShapeCornersState] = useState(3);
    const [globalRotation, setGlobalRotationState] = useState(0);

    const initializeWithCenterShape = (corners: number) => {
        setRepeatsState(corners);
        setBaseRepeats(corners);
        manager.initializeWithCenterShape(corners);
        manager.setRepeats(corners);
    };

    const setActiveShape = (shape: ShapeType) => {
        setActiveShapeState(shape);
        manager.setShape(shape);
    };

    const setGlobalRotation = (rotation: number) => {
        setGlobalRotationState(rotation);
        manager.globalRotation = rotation;
    };

    const setRepeats = (repeats: number) => {
        setRepeatsState(repeats);
        manager.setRepeats(repeats);
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

    // Render state:
    const [strokeColor, setStrokeColorState] = useState<string>(
        manager.style.strokeColor,
    );
    const [backgroundColor, setBackgroundColorState] = useState<string>(
        manager.style.backgroundColor,
    );
    const [strokeWidth, setStrokeWidthState] = useState(
        manager.style.strokeWidth,
    );
    const [currentColor, setCurrentColorState] = useState<string>(
        manager.style.currentColor,
    );

    const setStrokeColor = (color: string) => {
        setStrokeColorState(color);
        manager.style.strokeColor = color;
    };

    const setBackgroundColor = (color: string) => {
        setBackgroundColorState(color);
        manager.style.backgroundColor = color;
    };

    const setStrokeWidth = (width: number) => {
        setStrokeWidthState(width);
        manager.style.strokeWidth = width;
    };

    const setCurrentColor = (color: string) => {
        setCurrentColorState(color);
        manager.style.currentColor = color;
    };

    // Other state management:

    const handleReset = () => {
        setRepeats(Defaults.repeats);
        setBaseRepeats(null);
        setActiveShapeState(Defaults.shape);
        setCenterShapeAvailable(true);
        setUseCenterShapeState(false);
        setShapeCornersState(3);
        setActiveModeState(Defaults.mode);
        setGlobalRotationState(0);
        manager.reset();
    };

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
                handleReset,
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
                strokeColor,
                setStrokeColor,
                backgroundColor,
                setBackgroundColor,
                strokeWidth,
                setStrokeWidth,
                currentColor,
                setCurrentColor,
                globalRotation,
                setGlobalRotation,
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
