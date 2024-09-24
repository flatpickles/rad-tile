interface ExportControlsProps {
    exportSVG: () => void;
    exportPNG: () => void;
}

const ExportControls: React.FC<ExportControlsProps> = ({
    exportSVG,
    exportPNG,
}) => {
    return (
        <div className="flex flex-row gap-2 w-full pt-2">
            <button
                className={`btn btn-sm flex-grow text-btn`}
                onClick={exportPNG}
            >
                Export PNG
            </button>
            <button
                className={`btn btn-sm flex-grow text-btn`}
                onClick={exportSVG}
            >
                Export SVG
            </button>
        </div>
    );
};

export default ExportControls;
