import React from 'react';

const Overlay: React.FC = () => {
    return (
        <div className="absolute top-10 right-10 p-4 shadow-lg max-w-72 bg-blue-100">
            <h2 className="text-xl font-bold">Rad Tile</h2>
            <p className="text-sm">
                A tool for making radial tiled patterns. Click to add tile
                corners. New tiles must start from an existing tile corner. This
                is a{' '}
                <a
                    className="text-blue-500 hover:underline"
                    href="https://github.com/flatpickles/rad-tile"
                >
                    work in progress
                </a>
                !
            </p>
        </div>
    );
};

export default Overlay;
