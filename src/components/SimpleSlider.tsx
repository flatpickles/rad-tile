interface SimpleSliderProps {
    value: number;
    setValue: (value: number) => void;
    min: number;
    max: number;
    step?: number;
    label?: string;
}

const SimpleSlider: React.FC<SimpleSliderProps> = ({
    value,
    setValue,
    min,
    max,
    step = 1,
    label,
}) => {
    function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = parseFloat(e.target.value);
        setValue(newValue);
    }

    return (
        <div className="flex flex-col">
            {label && (
                <div className="flex justify-between">
                    <p>
                        {label}: {value}
                    </p>
                </div>
            )}
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleSliderChange}
                className="range range-xs"
            />
        </div>
    );
};

export default SimpleSlider;
