import { TileManagerMode } from '../tile/TileManager';

interface ModeSelectorProps {
    activeMode: TileManagerMode;
    handleModeChange: (mode: TileManagerMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({
    activeMode,
    handleModeChange,
}) => {
    return (
        <div className="join w-full">
            <button
                className={`join-item btn btn-sm flex-grow ${activeMode === 'add' ? 'btn-active' : ''}`}
                onClick={() => handleModeChange('add')}
            >
                Add
            </button>
            <button
                className={`join-item btn btn-sm flex-grow ${activeMode === 'view' ? 'btn-active' : ''}`}
                onClick={() => handleModeChange('view')}
            >
                View
            </button>
        </div>
    );
};

export default ModeSelector;
