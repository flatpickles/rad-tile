import React from 'react';
import Canvas from './Canvas';
import Overlay from './Overlay';

const App: React.FC = () => {
    return (
        <div className="relative h-screen w-screen">
            <Canvas />
            <Overlay />
        </div>
    );
};

export default App;
