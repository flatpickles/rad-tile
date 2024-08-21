interface RepeatSliderProps {
    repeatCount: number;
    handleRepeatChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const RepeatSlider: React.FC<RepeatSliderProps> = ({
    repeatCount,
    handleRepeatChange,
}) => {
    return (
        <div>
            <p>New tile repetitions: {repeatCount}</p>
            <input
                type="range"
                min={1}
                max={16}
                value={repeatCount}
                onChange={handleRepeatChange}
                className="range range-xs"
            />
        </div>
    );
};

export default RepeatSlider;
