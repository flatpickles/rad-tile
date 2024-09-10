import { ShapeType } from '../tile/TileTypes';

interface ShapeSelectorProps {
    activeShape: ShapeType;
    setActiveShape: (shape: ShapeType) => void;
}

const ShapeSelector: React.FC<ShapeSelectorProps> = ({
    activeShape,
    setActiveShape,
}) => {
    return (
        <div className="join w-full">
            <button
                className={`join-item btn btn-sm flex-grow ${activeShape === 'quad' ? 'btn-active' : ''}`}
                onClick={() => setActiveShape('quad')}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                >
                    <path d="M5 3L21 3L19 21L3 21Z" />
                </svg>
            </button>
            <button
                className={`join-item btn btn-sm flex-grow ${activeShape === 'tri' ? 'btn-active' : ''}`}
                onClick={() => setActiveShape('tri')}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                >
                    <path d="M8 3L3 19L21 21L8 3Z" />
                </svg>
            </button>
            <button
                className={`join-item btn btn-sm flex-grow ${activeShape === 'free' ? 'btn-active' : ''}`}
                onClick={() => setActiveShape('free')}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                >
                    <path d="M4 4L12 3L20 12L12 21L4 12Z" />
                </svg>
            </button>
        </div>
    );
};

export default ShapeSelector;
