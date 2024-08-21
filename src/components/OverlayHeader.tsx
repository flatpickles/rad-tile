const OverlayHeader: React.FC = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold">Rad Tile</h2>
            <p className="text-sm">
                ... is a{' '}
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

export default OverlayHeader;
