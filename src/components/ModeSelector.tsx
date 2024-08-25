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
                className={`join-item btn btn-sm flex-grow ${activeMode === 'build' ? 'btn-active' : ''}`}
                onClick={() => handleModeChange('build')}
            >
                Build
            </button>
            <button
                className={`join-item btn btn-sm flex-grow ${activeMode === 'paint' ? 'btn-active' : ''}`}
                onClick={() => handleModeChange('paint')}
            >
                Paint
            </button>
        </div>
    );
};

export default ModeSelector;
