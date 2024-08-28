import { useEffect, useState } from 'react';

const useIsTouchDevice = () => {
    const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

    useEffect(() => {
        const hasTouchCapability =
            'ontouchstart' in window || navigator.maxTouchPoints > 0;
        setIsTouchDevice(hasTouchCapability);
    }, []);

    return isTouchDevice;
};

export default useIsTouchDevice;
