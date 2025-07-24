import { Worklets } from 'react-native-worklets-core';
import { useFrameProcessor } from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';

let redChannelValues: number[] = [];

export function useHeartRateProcessor(onUpdate: (bpm: number) => void) {
    return useFrameProcessor((frame) => {
        'worklet';

        const width = frame.width;
        const height = frame.height;

        let redSum = 0;
        const pixels = frame?.planes?.[0]?.bytes;

        if (!pixels) return;

        // Percorre os pixels do frame (simplificação para performance)
        for (let i = 0; i < pixels.length; i += 4 * 100) {
            redSum += pixels[i]; // canal R
        }

        const avgRed = redSum / (pixels.length / (4 * 100));

        // Armazena o valor para análise
        runOnJS(storeRedValue)(avgRed, onUpdate);
    }, []);
}

function storeRedValue(value: number, onUpdate: (bpm: number) => void) {
    redChannelValues.push(value);

    if (redChannelValues.length >= 100) {
        const bpm = estimateBPM(redChannelValues);
        redChannelValues = [];
        onUpdate(bpm);
    }
}

function estimateBPM(values: number[]): number {
    // Simples filtro passa-alta para remover ruído
    const mean = values.reduce((a, b) => a + b) / values.length;
    const filtered = values.map(v => v - mean);

    // Contagem de picos (batimentos)
    let peaks = 0;
    for (let i = 1; i < filtered.length - 1; i++) {
        if (filtered[i] > filtered[i - 1] && filtered[i] > filtered[i + 1] && filtered[i] > 0.5) {
            peaks++;
        }
    }

    // Assume ~30 fps => duração total ~3.3s
    const durationSec = values.length / 30;
    const bpm = (peaks / durationSec) * 60;

    return Math.round(bpm);
}
