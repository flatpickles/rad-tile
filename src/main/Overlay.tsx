import React from 'react';
import ClearButton from '../components/ClearButton';
import ModeSelector from '../components/ModeSelector';
import OverlayHeader from '../components/OverlayHeader';
import ContentsBuild from './ContentsBuild';
import ContentsRender from './ContentsRender';
import useStateContext from './StateContext';

const Overlay: React.FC = () => {
    const { activeMode } = useStateContext();

    return (
        <div className="absolute shadow-sm p-4 rounded-lg bg-base-100 border bg-opacity-90 backdrop-blur-lg flex flex-col gap-2 inset-4 top-auto max-h-[calc(50vh-4rem)] sm:top-8 sm:left-auto sm:right-8 sm:bottom-auto sm:w-72 sm:max-h-[calc(100vh-4rem)] overflow-y-auto">
            <OverlayHeader />
            <div className="flex flex-col gap-3">
                <div className="flex flex-row gap-2 w-full">
                    <ModeSelector />
                    <ClearButton />
                </div>
                {activeMode === 'build' && <ContentsBuild />}
                {activeMode === 'render' && <ContentsRender />}
            </div>
        </div>
    );
};

export default Overlay;
