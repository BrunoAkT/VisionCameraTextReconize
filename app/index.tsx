import NoCameraDeviceError from '@/components/NoCameraDeviceError';
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { useHeartRateProcessor } from '@/components/useHeartRateProcessor'; 

export default function PPGCamera() {
  const device = useCameraDevice('back');
  const [bpm, setBpm] = useState<number | null>(null);
  const frameProcessor = useHeartRateProcessor(setBpm);

  if (!device) return <NoCameraDeviceError />;

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={{ flex: 1 }}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
      />
      <Text style={{ position: 'absolute', bottom: 40, fontSize: 24, textAlign: 'center', width: '100%', zIndex: 20 }}>
        BPM: {bpm ?? 'Detectando...'}
      </Text>
    </View>
  );
}
