import NoCameraDeviceError from '@/components/NoCameraDeviceError';
import PermissionsPage from '@/components/Permission';
import React, { useRef, useState } from 'react'
import { StyleSheet } from 'react-native';
import { useCameraDevice, useCameraPermission } from 'react-native-vision-camera'
import { Camera } from 'react-native-vision-camera-text-recognition';

function App() {
    const [data, setData] = useState(null)
    const device = useCameraDevice('back');
    const { hasPermission } = useCameraPermission();

    if (!hasPermission) return <PermissionsPage />
    if (device == null) return <NoCameraDeviceError />

    const [lastResult, setLastResult] = useState('');

    if (data?.resultText && data.resultText !== lastResult) {
        setLastResult(data.resultText);
        console.log(data.resultText);
    }

    const lastReadRef = useRef(Date.now());
    const onOcrCallback = (d) => {
        const now = Date.now();
        if (now - lastReadRef.current >= 2000) { // 2 segundos
            lastReadRef.current = now;
            setData(d);
        }
    };

    return (
        <>
            {!!device && (
                <Camera
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive
                    options={{
                        language: 'latin'
                    }}
                    mode={'recognize'}
                    callback={onOcrCallback}
                />
            )}
        </>
    )
}

export default App;


