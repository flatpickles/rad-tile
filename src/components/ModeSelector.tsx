import useStateContext from '../main/StateContext';

const ModeSelector: React.FC = () => {
    const { activeMode, setActiveMode } = useStateContext();

    return (
        <div className="join w-full">
            <button
                className={`join-item btn btn-sm flex-grow ${activeMode === 'build' ? 'btn-active' : ''}`}
                onClick={() => setActiveMode('build')}
            >
                Build
            </button>
            <button
                className={`join-item btn btn-sm flex-grow ${activeMode === 'render' ? 'btn-active' : ''}`}
                onClick={() => setActiveMode('render')}
            >
                Render
            </button>
        </div>
    );
};

export default ModeSelector;
