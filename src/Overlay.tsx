import React, { useState } from 'react';
import { TileManager, TileManagerMode } from './TileManager';

interface OverlayProps {
    manager: TileManager | null;
}

const Overlay: React.FC<OverlayProps> = ({ manager }) => {
    const [activeMode, setActiveMode] = useState<TileManagerMode>('add');

    const handleModeChange = (mode: TileManagerMode) => {
        setActiveMode(mode);
        manager?.setMode(mode);
    };

    return (
        <div className="absolute top-10 right-10 p-4 shadow-lg rounded-lg bg-base-300 w-72 flex flex-col gap-2">
            <h2 className="text-xl font-bold">Rad Tile</h2>
            <p className="text-sm">
                ... is a{' '}
                <a
                    className="text-blue-500 hover:underline"
                    href="https://github.com/flatpickles/rad-tile"
                >
                    work in progress
                </a>
                !
            </p>
            <div className="flex flex-row gap-2 w-full">
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
                <button
                    className="btn btn-sm"
                    onClick={() => {
                        manager?.clear();
                        handleModeChange('add');
                    }}
                >
                    Clear
                </button>
            </div>
        </div>
    );
};

export default Overlay;
