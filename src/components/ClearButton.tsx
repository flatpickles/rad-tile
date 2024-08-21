import { useState } from 'react';

interface ClearButtonProps {
    handleClear: () => void;
}

type ClearConfirmState = {
    confirming: boolean;
    timeout?: number;
};

const ClearButton: React.FC<ClearButtonProps> = ({ handleClear }) => {
    const [clearConfirm, setClearConfirm] = useState<ClearConfirmState>({
        confirming: false,
    });

    const handleClearPress = () => {
        if (clearConfirm.confirming) {
            handleClear();
            setClearConfirm({ confirming: false });
        } else {
            const confirmTimeout = window.setTimeout(() => {
                setClearConfirm({
                    confirming: false,
                });
            }, 3000);
            setClearConfirm({
                confirming: true,
                timeout: confirmTimeout,
            });
        }
    };

    return (
        <button
            className={`btn btn-sm ${clearConfirm.confirming ? 'btn-error' : ''}`}
            onClick={handleClearPress}
            onMouseOut={() => {
                clearTimeout(clearConfirm.timeout);
                setClearConfirm({ confirming: false });
            }}
        >
            Clear
        </button>
    );
};

export default ClearButton;
