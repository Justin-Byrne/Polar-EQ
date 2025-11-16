// audio.constants.ts

// Maximum value returned by getByteFrequencyData()
export const BYTE_MAX = 255;

// Minimum dBFS clamp for silence
export const DB_MIN_CLAMP = -60;

// Allowed FFT sizes for the analyser
export const VALID_FFT_SIZES = [ 32, 64, 128, 256, 512, 1024, 2048 ] as const;
