import React, { useState } from 'react';
import Canvas from './Canvas';
import Overlay from './Overlay';

const App: React.FC = () => {
    const [rectSize, setRectSize] = useState(50);

    return (
        <div className="relative h-screen w-screen">
            <Canvas rectSize={rectSize} />
            <Overlay rectSize={rectSize} setRectSize={setRectSize} />
        </div>
    );
};

export default App;
