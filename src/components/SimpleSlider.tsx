interface SimpleSliderProps {
    value: number;
    setValue: (value: number) => void;
    min: number;
    max: number;
    step?: number;
    label?: string;
    disabled?: boolean;
}

const SimpleSlider: React.FC<SimpleSliderProps> = ({
    value,
    setValue,
    min,
    max,
    step = 1,
    label,
    disabled = false,
}) => {
    function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = parseFloat(e.target.value);
        setValue(newValue);
    }

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <div className="flex justify-between">
                    <p
                        className={`${
                            disabled ? 'btn-secondary opacity-50' : ''
                        }`}
                    >
                        <span className="font-bold">{label}:</span> {value}
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
                className={`range range-xs ${disabled ? 'btn-secondary opacity-50' : ''}`}
                disabled={disabled}
            />
        </div>
    );
};

export default SimpleSlider;
