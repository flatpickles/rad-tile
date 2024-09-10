import { createContext, useContext, useState } from 'react';
import { TileManager } from '../tile/TileManager';
import { ShapeType, TileManagerMode } from '../tile/TileTypes';
import { Defaults } from '../util/Defaults';

interface StateContextType {
    manager: TileManager;
    repeats: number;
    setRepeats: (repeats: number) => void;
    activeShape: ShapeType;
    setActiveShape: (shape: ShapeType) => void;
    baseRepeats: number | null;
    setBaseRepeats: (baseRepeats: number | null) => void;
    centerShapeEnabled: boolean;
    setCenterShapeEnabled: (centerShapeEnabled: boolean) => void;
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
    const [repeats, setRepeats] = useState(Defaults.repeats);
    const [activeShape, setActiveShape] = useState<ShapeType>(Defaults.shape);
    const [baseRepeats, setBaseRepeats] = useState<number | null>(null);
    const [centerShapeEnabled, setCenterShapeEnabled] = useState(true);
    const [useCenterShape, setUseCenterShape] = useState(false);
    const [shapeCorners, setShapeCorners] = useState(3);
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
        setCenterShapeEnabled(true);
        setUseCenterShape(false);
        setShapeCorners(3);
        setActiveModeState(Defaults.mode);
        manager.reset();
    };

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
                centerShapeEnabled,
                setCenterShapeEnabled,
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
