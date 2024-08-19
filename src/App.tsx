import React, { useState } from 'react';
import Canvas from './Canvas';
import Overlay from './Overlay';

const App: React.FC = () => {
    const [rectSize, setRectSize] = useState(50);

    return (
        <div className="relative h-screen w-screen">
            <Canvas />
            <Overlay rectSize={rectSize} setRectSize={setRectSize} />
        </div>
    );
};

export default App;
