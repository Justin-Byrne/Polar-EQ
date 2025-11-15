// ========================================================
// audio.ts
// Audio context + analyser setup and microphone wiring.
// ========================================================

export interface AudioEnvironment
{
    context:  AudioContext;            /** Shared AudioContext used by the visualizer. */
    analyser: AnalyserNode;            /** Analyser node providing FFT data. */
    data:     Uint8Array;              /** Backing buffer for frequency-domain magnitudes (0–255). */
}

/**
 * Create an `AudioContext` + `AnalyserNode` and optionally connect the mic.
 *
 * @param fftSize - Desired FFT size (must be power-of-two and supported by the browser).
 * @param mic - When true, connects the default microphone to the analyser.
 */
export async function initAudio (
    fftSize: number,
    mic = false
): Promise<AudioEnvironment>
{
    const AUDIOCONTEXT = window.AudioContext || (window as any).webkitAudioContext;

    const context  = new AUDIOCONTEXT ( );
    const analyser = context.createAnalyser ( );

    analyser.fftSize = fftSize;

    const data = new Uint8Array ( analyser.frequencyBinCount );

    if ( mic )
    {
        const _stream = await navigator.mediaDevices.getUserMedia ( { audio: true } );
        const _source = context.createMediaStreamSource ( _stream );

        _source.connect ( analyser );
    }

    return { context, analyser, data };
}
