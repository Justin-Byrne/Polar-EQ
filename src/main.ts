// ========================================================
// main.ts
// Browser entrypoint for the polar EQ visualizer.
//
// Responsibilities:
// - Canvas + geometry setup
// - Wiring audio (mic or file) into the analyser
// - Driving the animation loop
// - Handling UI (buttons, keyboard, tooltip, FFT slider)
// ========================================================

import { buildShapes, pathForCell, colorForDb } from "./canvas";
import { dbFromByte, norm01FromDb, displayDb, logFreqBounds } from "./utils";
import { initAudio } from "./audio";
import type { PolarCell } from "./types";
import { createTooltip } from "./tooltip";
import { animateRotation } from "./animation";

//**    CONFIGURATION    ********************************//

  const RINGS      = 24;
  const SECTORS    = 24;
  const PEAK_DECAY = 1 / 60; // ≈1 dB per second
  const ROTATE_UP  = - Math.PI / 2;

//**    DOM ELEMENTS    *********************************//

  const ELEMENTS =
  {
      canvas: document.getElementById ( "polarCanvas" ) as HTMLCanvasElement,
      buttons:
      {
          init:     document.getElementById ( "button-init" )     as HTMLButtonElement,
          mic:      document.getElementById ( "button-mic" )      as HTMLButtonElement,
          play:     document.getElementById ( "button-play" )     as HTMLButtonElement,
          export:   document.getElementById ( "button-export" )   as HTMLButtonElement,
          selfTest: document.getElementById ( "button-selfTest" ) as HTMLButtonElement,
      },
      inputs:
      {
          fileAudio: document.getElementById ( "fileAudio" ) as HTMLInputElement,
          fft:       document.getElementById ( "fft" )       as HTMLInputElement,
          glow:      document.getElementById ( "chkGlow" )   as HTMLInputElement,
      },
      status:      document.getElementById ( "statusPanel" ) as HTMLDivElement,
      testResult:  document.getElementById ( "testResult" )  as HTMLSpanElement,
      tooltip:     createTooltip ( )
  };

//**    CANVAS AND GEOMETRY    **************************//

  const CANVAS_CONTEXT = ELEMENTS.canvas.getContext ( "2d" )!;
  const CENTER         = { x: ELEMENTS.canvas.width / 2, y: ELEMENTS.canvas.height / 2 };
  const RADIUS         = ELEMENTS.canvas.width * 0.48;

  let rotationOffset = ROTATE_UP;
  let targetRotation = ROTATE_UP;
  let currentSector  = 0;
  let animating      = false;

  let Shapes: PolarCell [ ] = buildShapes ( RINGS, SECTORS, CENTER, RADIUS );

//**    AUDIO STATE    **********************************//

  const PEAKS           = new Array ( SECTORS ).fill ( -12 );
  const LAST_DISPLAY_DB = new Array ( SECTORS ).fill ( -12 );

  let usingAudio = false;
  let AudioEnvironment: Awaited<ReturnType<typeof initAudio>> | null = null;

  let FreqBounds:   number [ ] = new Array;
  let AudioElement: HTMLAudioElement | null = null;
  let AudioSource:  MediaElementAudioSourceNode | null = null;

////    AUDIO    //////////////////////////////////////////

  /**
   * Start (or continue) the visualizer loop.
   *
   * - Pulls spectrum data from the analyser
   * - Aggregates into log-spaced bands
   * - Renders the grid, peaks, and optional bass glow
   */
  function startVisualizerLoop ( ): void
  {
      if ( ! AudioEnvironment ) return;

      const { context: _audioContext, analyser: _analyser, data: _data } = AudioEnvironment;

      const _bins         = _analyser.frequencyBinCount;
      const _perSectorMax = new Array ( SECTORS ).fill ( 0 );

      FreqBounds = logFreqBounds ( _audioContext.sampleRate, SECTORS );

      const loop = ( ) =>
      {
          if ( _audioContext.state === "running" )

              _analyser.getByteFrequencyData ( _data );

          CANVAS_CONTEXT.clearRect ( 0, 0, ELEMENTS.canvas.width, ELEMENTS.canvas.height );

          // Aggregate bins into log frequency bands
          for ( let _sector = 0; _sector < SECTORS; _sector++ )
          {
              const _freqA = FreqBounds [ _sector ], _freqB = FreqBounds [ _sector + 1 ];

              const _binA = Math.floor ( ( _freqA / ( _audioContext.sampleRate / 2 ) ) * _bins );
              const _binB = Math.floor ( ( _freqB / ( _audioContext.sampleRate / 2 ) ) * _bins );

              let _max = 0;

              for ( let _i = _binA; _i <= _binB; _i++ )

                  _max = Math.max ( _max, _data [ _i ] ?? 0 );

              _perSectorMax [ _sector ] = _max;
          }

          // Fill grid cells based on thresholds
          for ( const _cell of Shapes )
          {
              const _sector       = _cell.sector;
              const _vector       = _perSectorMax [ _sector ];
              const _decibel      = dbFromByte ( _vector );
              const _normalizedDb = norm01FromDb ( _decibel );
              const _display      = displayDb ( _normalizedDb );

              LAST_DISPLAY_DB [ _sector ] = _display;

              const _threshold = - 12 + ( ( _cell.ring + 1 ) / RINGS ) * 24;

              if ( _threshold <= _display )
              {
                  CANVAS_CONTEXT.fillStyle = colorForDb ( _threshold );
                  CANVAS_CONTEXT.fill ( pathForCell ( _cell, CENTER ) );
              }

              CANVAS_CONTEXT.strokeStyle = "rgba(255,255,255,0.1)";

              CANVAS_CONTEXT.stroke ( pathForCell ( _cell, CENTER ) );

              PEAKS [ _sector ] = Math.max ( _display, PEAKS [ _sector ] - PEAK_DECAY );
          }

          // Draw per-sector peak rings
          CANVAS_CONTEXT.strokeStyle = "white";

          for ( let _sector = 0; _sector < SECTORS; _sector++ )
          {
              const _ringIndex  = Math.floor ( ( ( PEAKS [ _sector ] + 12 ) / 24 ) * RINGS );
              const _ringStep   = RADIUS / RINGS;
              const _ring       = ( _ringIndex + 1 ) * _ringStep;
              const _startAngle = ( _sector * Math.PI * 2 ) / SECTORS + ROTATE_UP;
              const _endAngle   = ( ( _sector + 1 ) * Math.PI * 2 ) / SECTORS + ROTATE_UP;

              CANVAS_CONTEXT.beginPath ( );
              CANVAS_CONTEXT.arc ( CENTER.x, CENTER.y, _ring, _startAngle, _endAngle );
              CANVAS_CONTEXT.stroke ( );
          }

          // Bass glow
          if ( ELEMENTS.inputs.glow.checked )
          {
              const _bassBins = Math.max ( 1, Math.floor ( data.length * 0.05 ) );

              let _sum = 0;

              for ( let _i = 0; _i < _bassBins; _i++)

                  _sum += data [ _i ];

              const _bass = _sum / ( _bassBins * 255 );

              drawGlow ( _bass );
          }

          requestAnimationFrame ( loop );
      };

      loop ( );
  }

////    GRAPHICS    ///////////////////////////////////////

  /**
   * Redraw the static grid when idle (no audio activity).
   */
  function drawGrid ( )
  {
      CANVAS_CONTEXT.clearRect ( 0, 0, ELEMENTS.canvas.width, ELEMENTS.canvas.height );

      CANVAS_CONTEXT.strokeStyle = "rgba(255,255,255,0.15)";

      for ( const _cell of Shapes )

          CANVAS_CONTEXT.stroke ( pathForCell ( _cell, CENTER ) );
  }

  /**
   * Simple radial bass glow centered on the canvas.
   */
  function drawGlow ( bass: number )
  {
      const RADIUS   = RADIUS * ( 0.15 + bass * 0.2 );
      const _gradient = CANVAS_CONTEXT.createRadialGradient ( CENTER.x, CENTER.y, 0, CENTER.x, CENTER.y, r );

            _gradient.addColorStop ( 0, `rgba(255, 200, 90, ${0.3 + bass * 0.4})` );
            _gradient.addColorStop ( 1, "rgba(0,0,0,0)" );

      CANVAS_CONTEXT.save ( );

      CANVAS_CONTEXT.globalCompositeOperation = "lighter";
      CANVAS_CONTEXT.fillStyle = _gradient;

      CANVAS_CONTEXT.beginPath ( );
      CANVAS_CONTEXT.arc ( CENTER.x, CENTER.y, RADIUS, 0, Math.PI * 2 );
      CANVAS_CONTEXT.fill ( );

      CANVAS_CONTEXT.restore ( );
  }

////    ANIMATION    //////////////////////////////////////

  /**
   * Rotate the entire polar grid to align a given sector "up".
   */
  function setSectorAlignment ( index: number )
  {
      const _sectorStep  = ( Math.PI * 2 ) / SECTORS;
      const _newRotation = - Math.PI / 2 - ( index * _sectorStep + _sectorStep / 2 );

      targetRotation = _newRotation;

      const onUpdate = ( angle ) =>
      {
          rotationOffset = angle;
          Shapes         = buildShapes ( RINGS, SECTORS, CENTER, RADIUS, rotationOffset );

          drawGrid ( );
      };

      const onComplete = ( ) => [ rotationOffset, animating ] = [ targetRotation, false ];

      animateRotation ( rotationOffset, targetRotation, 500, onUpdate, onComplete );
  }

  /** Advance to the next sector (clockwise) and rotate smoothly. */
  function nextSector ( )
  {
      if ( animating ) return;

      currentSector = ( currentSector + 1 ) % SECTORS;

      setSectorAlignment ( currentSector );
  }

  /** Move to the previous sector (counter-clockwise) and rotate smoothly. */
  function prevSector ( )
  {
      if ( animating ) return;

      currentSector = ( currentSector - 1 + SECTORS ) % SECTORS;

      setSectorAlignment ( currentSector );
  }

////    MISC    ///////////////////////////////////////////

  /**
   * Update the status panel to indicate whether audio is live or idle.
   */
  function setStatus ( live: boolean )
  {
      if ( live )
      {
          ELEMENTS.status.textContent = "Status: Live (Audio Connected)";
          ELEMENTS.status.className   = "status live";
      }
      else
      {
          ELEMENTS.status.textContent = "Status: Idle (Static Grid)";
          ELEMENTS.status.className   = "status idle";
      }
  }

  /**
   * Export the current polar cell geometry as JSON for offline analysis.
   */
  function exportShapes ( )
  {
      const _json = JSON.stringify ( Shapes, null, 2 );
      const _blob = new Blob ( [ json ], { type: "application/json" } );
      const _url  = URL.createObjectURL ( _blob );
      const _a    = document.createElement ( "a" );

            _a.href     = _url;
            _a.download = "polar-576-Shapes.json";

            _a.click ( );

      URL.revokeObjectURL ( _url );
  }

////    BINDINGS    ///////////////////////////////////////

  /**
   * Bind hover handlers to show frequency band + dB under the cursor.
   */
  function bindTooltip ( ): void
  {
      ELEMENTS.canvas.addEventListener ( "mousemove", ( event ) =>
      {
          const _rectangle = ELEMENTS.canvas.getBoundingClientRect();
          const _x         = event.clientX - _rectangle.left;
          const _y         = event.clientY - _rectangle.top;

          const _dx       = _x - CENTER.x;
          const _dy       = _y - CENTER.y;
          const _distance = Math.sqrt ( _dx * _dx + _dy * _dy );
          const _angle    = Math.atan2 ( _dy, _dx );

          for ( const _cell of Shapes )
          {
              if ( _distance >= _cell.innerRing  && _distance <= _cell.outerRing &&
                   _angle    >= _cell.startAngle && _angle    <= _cell.endAngle )
              {
                  const _sector  = _cell.sector;
                  const _freqA   = FreqBounds [ _sector ];
                  const _freqB   = FreqBounds [ _sector + 1 ];
                  const _decibel = LAST_DISPLAY_DB [ _sector ];

                  if ( _freqA != undefined )

                    ELEMENTS.tooltip.show ( event.clientX, event.clientY, `<b>${_freqA.toFixed ( 0 )} – ${_freqB.toFixed ( 0 )} Hz</b><br>${_decibel.toFixed ( 1 )} dB` );

                  return;
                }
          }

          ELEMENTS.tooltip.hide ( );
    } );

    ELEMENTS.canvas.addEventListener ( "mouseleave", ( ) =>
    {
        ELEMENTS.tooltip.hide ( );
    } );
  }

  /**
   * Wire up buttons, file input, keyboard shortcuts, and FFT slider.
   */
  function bindUI ( )
  {
      ELEMENTS.buttons.init.addEventListener ( "click", ( ) =>
      {
          usingAudio = false;
          setStatus ( false );
          drawGrid ( );
      } );

      ELEMENTS.buttons.mic.addEventListener ( "click", ( ) =>
      {
          usingAudio = true;
          startMicAudio ( ).catch ( console.error );
      } );

      ELEMENTS.inputs.fileAudio.addEventListener ( "change", async ( element ) =>
      {
          const file = ( element.target as HTMLInputElement ).files?.[ 0 ];

          if ( ! file ) return;

          // Reuse or create audio element
          if ( AudioElement )
          {
              AudioElement.pause ( );
              AudioElement.src = "";
          }

          AudioElement             = new Audio ( URL.createObjectURL ( file ) );
          AudioElement.crossOrigin = "anonymous";
          AudioElement.loop        = true;
          AudioElement.preload     = "auto";
          AudioElement.volume      = 1.0;

          // Initialize or reuse the AudioContext + Analyser
          if ( ! AudioEnvironment )

              AudioEnvironment = await initAudio ( parseInt ( ELEMENTS.inputs.fft.value, 10 ), false );

          const { context: _audioContext, analyser: _analyser } = AudioEnvironment;

          // Only create one MediaElementSource for this element
          if ( AudioSource )

              AudioSource.disconnect ( );

          AudioSource = _audioContext.createMediaElementSource ( AudioElement );

          AudioSource.connect ( _analyser );
          _analyser.connect ( _audioContext.destination );

          // Bind context state handlers
          AudioElement.addEventListener ( "play", async ( ) =>
          {
              if ( _audioContext.state === "suspended" )

                  await _audioContext.resume ( );

              setStatus ( true );
          } );

          AudioElement.addEventListener ( "pause", ( ) => setStatus ( false ) );
          AudioElement.addEventListener ( "ended", ( ) => setStatus ( false ) );

          // Start visualizer loop (if not already running)
          startVisualizerLoop ( );

          // Enable Play button
          ELEMENTS.buttons.play.disabled = false;

          await AudioElement.play ( ).catch ( ( ) => { /* ignore autoplay errors */ } );
      } );

      ELEMENTS.buttons.play.addEventListener ( "click", async ( ) =>
      {
          if ( ! AudioElement ) return;

          const _audioContext = AudioEnvironment?.context;

          if ( ! _audioContext ) return;

          if ( AudioElement.paused )
          {
              if ( _audioContext.state === "suspended" )

                  await _audioContext.resume ( );

              await AudioElement.play ( );

              setStatus ( true );
          }
          else
          {
              AudioElement.pause ( );

              setStatus ( false );
          }
      } );

  ////    FFT SLIDER LOGIC (DYNAMIC ANALYZER REINIT + SAFE POWER-OF-TWO)    /////

      ELEMENTS.inputs.fft.addEventListener ( "input", ( ) =>
      {
          const _raw        = parseInt ( ELEMENTS.inputs.fft.value, 10 );
          const _validSizes = [ 32, 64, 128, 256, 512, 1024, 2048 ];
          const _fftSize    = _validSizes.reduce ( ( prev, curr ) => Math.abs ( curr - _raw ) < Math.abs ( prev - _raw ) ? curr : prev );

          ELEMENTS.inputs.fft.value = _fftSize.toString ( );

          const _fftOut = document.getElementById ( "fftValue" ) as HTMLOutputElement;

                _fftOut.textContent = _fftSize.toString ( );

          if ( AudioEnvironment?.analyser )
          {
              // Update FFT size and reallocate data buffer
              const { analyzer: _analyser } = AudioEnvironment;

              _analyser._fftSize     = _fftSize;
              AudioEnvironment.data = new Uint8Array ( _analyser.frequencyBinCount );

              // Log and brief UI feedback
              console.log ( `FFT size changed → ${_fftSize} (bins: ${_analyser.frequencyBinCount})` );

              _fftOut.classList.add ( "updated" );

              setTimeout ( ( ) => _fftOut.classList.remove ( "updated" ), 120 );
          }
      } );

      ELEMENTS.buttons.export.addEventListener ( "click", exportShapes );

      ELEMENTS.buttons.selfTest.addEventListener ( "click", ( ) =>
      {
          try
          {
              if ( ! ( context instanceof CanvasRenderingContext2D ) )

                  throw new Error ( "Canvas context missing" );

              if ( Shapes.length !== RINGS * SECTORS )

                  throw new Error ( "Shape count mismatch" );

              ELEMENTS.testResult.textContent = "✔ All tests passed";
              ELEMENTS.testResult.className   = "note ok";
          }
          catch ( err )
          {
              ELEMENTS.testResult.textContent = `✖ ${ ( err as Error ).message}`;
              ELEMENTS.testResult.className   = "note fail";
          }
      } );

      document.addEventListener ( "keydown", ( event ) =>
      {
          if ( event.key === "ArrowRight" ) nextSector ( );

          if ( event.key === "ArrowLeft"  ) prevSector ( );
      } );

      bindTooltip();
  }

  /**
   * Start capturing audio from the microphone and begin the visualizer loop.
   */
  async function startMicAudio ( ): Promise<void>
  {
      const _fftSize = parseInt ( ELEMENTS.inputs.fft.value, 10 );

      AudioEnvironment = await initAudio ( _fftSize, true );

      startVisualizerLoop ( );
      setStatus ( true );
  }

////    INITIALIZATION    /////////////////////////////////

  function init ( )
  {
      drawGrid ( );
      setStatus ( false );
      bindUI ( );

      console.log ( "Visualizer initialized" );
  }

  init ( );
