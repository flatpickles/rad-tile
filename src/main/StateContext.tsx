import { createContext, useContext, useState } from 'react';
import { TileManager } from '../tile/TileManager';
import { ShapeType } from '../tile/TileTypes';
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
