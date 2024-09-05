import { FaCircleInfo } from 'react-icons/fa6';

const OverlayHeader: React.FC = () => {
    return (
        <div className="flex flex-row justify-between items-start">
            <h2 className="text-2xl font-bold">Rad Tile</h2>
            <a href="https://github.com/flatpickles/rad-tile">
                <FaCircleInfo className="text-xl text-neutral-content cursor-pointer hover:text-base-content" />
            </a>
        </div>
    );
};

export default OverlayHeader;
