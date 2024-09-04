import { useState } from 'react';
import { Defaults } from '../util/Defaults';

interface RepeatSliderProps {
    repeats: number;
    setRepeats: (repeatCount: number) => void;
    baseRepeats: number | null;
}

const RepeatSlider: React.FC<RepeatSliderProps> = ({
    repeats,
    setRepeats,
    baseRepeats,
}) => {
    const [sliderValue, setSliderValue] = useState(repeats);
    if (!baseRepeats && sliderValue !== repeats) setSliderValue(repeats);

    const repeatSliderVals = baseRepeats
        ? getFactors(baseRepeats)
        : Array.from({ length: Defaults.maxRepeats }, (_, i) => i + 1);
    const sliderMax = repeatSliderVals.length;

    function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = parseInt(e.target.value, 10);
        setSliderValue(newValue);
        const newRepeatCount = repeatSliderVals[newValue - 1]; // Adjust for 0-based index
        setRepeats(newRepeatCount);
    }

    return (
        <div className="flex flex-col gap-1">
            <div className="flex justify-between">
                <p>Repeats: {repeats}</p>
                {baseRepeats && <p>Base: {baseRepeats}</p>}
            </div>
            <input
                type="range"
                min={1}
                max={sliderMax}
                value={sliderValue}
                onChange={handleSliderChange}
                className="range range-xs"
            />
        </div>
    );
};

export default RepeatSlider;

function getFactors(num: number): number[] {
    const factors: number[] = [];
    for (let i = 1; i <= Math.sqrt(num); i++) {
        if (num % i === 0) {
            factors.push(i);
            if (i !== num / i) factors.push(num / i);
        }
    }
    return factors.sort((a, b) => a - b);
}
