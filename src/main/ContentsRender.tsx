import React from 'react';
import ColorPicker from '../components/ColorPicker';
import ExportControls from '../components/ExportControls';
import SimpleSlider from '../components/SimpleSlider';
import useStateContext from './StateContext';

const ContentsRender: React.FC = () => {
    const {
        manager,
        currentColor,
        setCurrentColor,
        backgroundColor,
        setBackgroundColor,
        strokeColor,
        setStrokeColor,
        strokeWidth,
        setStrokeWidth,
        tileInset,
        setTileInset,
    } = useStateContext();

    return (
        <div className="flex flex-col gap-3">
            <ColorPicker
                color={currentColor}
                setColor={setCurrentColor}
                label="Apply Color"
            />
            <ColorPicker
                color={backgroundColor}
                setColor={setBackgroundColor}
                label="Background Color"
            />
            <ColorPicker
                color={strokeColor}
                setColor={setStrokeColor}
                label="Stroke Color"
            />
            <SimpleSlider
                value={strokeWidth}
                setValue={setStrokeWidth}
                min={0}
                max={20}
                step={1}
                label="Stroke Width"
            />
            <SimpleSlider
                value={tileInset}
                setValue={setTileInset}
                min={0}
                max={20}
                step={1}
                label="Tile Inset"
            />
            <ExportControls
                exportSVG={() => manager.exportSVG()}
                exportPNG={() => manager.exportPNG()}
            />
        </div>
    );
};

export default ContentsRender;
