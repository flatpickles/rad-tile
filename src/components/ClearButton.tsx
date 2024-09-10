import { useState } from 'react';
import useStateContext from '../main/StateContext';

type ClearConfirmState = {
    confirming: boolean;
    timeout?: number;
};

const ClearButton: React.FC = () => {
    const { handleReset } = useStateContext();
    const [clearConfirm, setClearConfirm] = useState<ClearConfirmState>({
        confirming: false,
    });

    const handleClearPress = () => {
        if (clearConfirm.confirming) {
            handleReset();
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
