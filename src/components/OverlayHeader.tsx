import { FaCircleInfo } from 'react-icons/fa6';

const OverlayHeader: React.FC = () => {
    return (
        <div className="text-center">
            <h2 className="header-title">Rad Tile</h2>

            <a
                href="https://github.com/flatpickles/rad-tile"
                className="absolute top-3 right-3"
            >
                <FaCircleInfo className="text-xl text-neutral-content cursor-pointer hover:text-base-content" />
            </a>
        </div>
    );
};

export default OverlayHeader;
