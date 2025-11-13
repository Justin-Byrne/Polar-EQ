export interface AudioEnvironment
{
    context:  AudioContext;
    analyser: AnalyserNode;
    data:     Uint8Array;
}

/** Create AudioContext + AnalyserNode and optionally connect mic. */
export async function initAudio ( fftSize: number, mic = false ): Promise<AudioEnvironment>
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
