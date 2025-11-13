import { buildShapes, pathForCell, colorForDb } from "./canvas";
import { dbFromByte, norm01FromDb, displayDb, logFreqBounds } from "./utils";
import { initAudio } from "./audio";
import type { PolarCell } from "./types";

////    CONFIGURATION    //////////////////////////////////

  const RINGS      = 24;
  const SECTORS    = 24;
  const PEAK_DECAY = 1 / 60; // ≈1 dB per second
  const ROTATE_UP  = - Math.PI / 2;

////    DOM ELEMENTS    ///////////////////////////////////

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
      testResult:  document.getElementById ( "testResult" )  as HTMLSpanElement
  };

////    CANVAS AND GEOMETRY SETUP    //////////////////////

  const _context = ELEMENTS.canvas.getContext ( "2d" )!;
  const _center  = { x: ELEMENTS.canvas.width / 2, y: ELEMENTS.canvas.height / 2 };
  const _radius  = ELEMENTS.canvas.width * 0.48;

  let _rotationOffset = ROTATE_UP;
  let _targetRotation = ROTATE_UP;
  let _currentSector  = 0;
  let _animating      = false;

  let _shapes: PolarCell [ ] = buildShapes ( RINGS, SECTORS, _center, _radius );

////    AUDIO STATE    ////////////////////////////////////

  let _usingAudio = false;
  let _audioEnvironment: Awaited<ReturnType<typeof initAudio>> | null = null;

  const _peaks         = new Array ( SECTORS ).fill ( -12 );
  const _lastDisplayDb = new Array ( SECTORS ).fill ( -12 );

  let _freqBounds: number [ ] = new Array;

  let _loadedAudioElement: HTMLAudioElement | null = null;
  let _loadedSrcNode:      MediaElementAudioSourceNode | null = null;

////    TOOLTIP    ////////////////////////////////////////

  const _tooltip = document.createElement ( "div" );

        _tooltip.style.position      = "fixed";
        _tooltip.style.background    = "rgba(30,30,30,0.9)";
        _tooltip.style.border        = "1px solid rgba(255,255,255,0.15)";
        _tooltip.style.borderRadius  = "8px";
        _tooltip.style.padding       = "6px 10px";
        _tooltip.style.fontSize      = "13px";
        _tooltip.style.pointerEvents = "none";
        _tooltip.style.color         = "#fff";
        _tooltip.style.opacity       = "0";
        _tooltip.style.transition    = "opacity 0.15s ease";
        _tooltip.style.whiteSpace    = "nowrap";

  document.body.appendChild ( _tooltip );

////    UTILITY FUNCTIONS    //////////////////////////////

  function animateRotation ( target: number, duration = 500 )
  {
      const _start         = performance.now();
      const _startRotation = _rotationOffset;
      const _delta         = target - _startRotation;

      _animating = true;

      function _step ( time: number )
      {
          const _t         = Math.min ( 1, ( time - _start) / duration );
          const _eased     = _t * _t * (3 - 2 * _t);  // smoothstep

          _rotationOffset  = _startRotation + _delta * _eased;
          _shapes          = buildShapes ( RINGS, SECTORS, _center, _radius, _rotationOffset );

          _drawGrid ( );

          if ( _t < 1 )

              requestAnimationFrame ( _step );

          else

              [_rotationOffset, _animating ] = [ target, false ];
      }

      requestAnimationFrame ( _step );
  }

  function _setSectorAlignment ( sectorIndex: number )
  {
      const _sectorStep  = ( Math.PI * 2 ) / SECTORS;
      const _newRotation = - Math.PI / 2 - ( sectorIndex * _sectorStep + _sectorStep / 2 );

      _targetRotation = _newRotation;

      animateRotation ( _targetRotation );
  }

  function _nextSector ( )
  {
      if ( _animating ) return;

      _currentSector = ( _currentSector + 1 ) % SECTORS;

      _setSectorAlignment ( _currentSector );
  }

  function _prevSector ( )
  {
      if ( _animating ) return;

      _currentSector = ( _currentSector - 1 + SECTORS ) % SECTORS;

      _setSectorAlignment ( _currentSector );
  }

  function _setStatus ( live: boolean )
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

  /** Redraw the static grid when idle. */
  function _drawGrid ( )
  {
      _context.clearRect ( 0, 0, ELEMENTS.canvas.width, ELEMENTS.canvas.height );

      _context.strokeStyle = "rgba(255,255,255,0.15)";

      for ( const _cell of _shapes )

          _context.stroke ( pathForCell ( _cell, _center ) );
  }

  /** Export the 576 _shapes as JSON. */
  function _exportShapes ( )
  {
      const _json = JSON.stringify ( _shapes, null, 2 );
      const _blob = new Blob ( [ json ], { type: "application/json" } );
      const _url  = URL.createObjectURL ( _blob );
      const _a    = document.createElement ( "a" );

            _a.href     = _url;
            _a.download = "polar-576-_shapes.json";

            _a.click ( );

      URL.revokeObjectURL ( _url );
  }

  function _startVisualizerLoop ( )
  {
      if ( ! _audioEnvironment ) return;

      const { context: _audioContext, analyser: _analyser, data: _data } = _audioEnvironment;

      const _bins         = _analyser.frequencyBinCount;
      const _perSectorMax = new Array ( SECTORS ).fill ( 0 );

      _freqBounds = logFreqBounds ( _audioContext.sampleRate, SECTORS );

      const loop = ( ) =>
      {
          if ( _audioContext.state === "running" )

              _analyser.getByteFrequencyData ( _data );

          _context.clearRect ( 0, 0, ELEMENTS.canvas.width, ELEMENTS.canvas.height );

          for ( let _sector = 0; _sector < SECTORS; _sector++ )
          {
              const _freqA = _freqBounds [ _sector ], _freqB = _freqBounds [ _sector + 1 ];

              const _binA = Math.floor ( ( _freqA / ( _audioContext.sampleRate / 2 ) ) * _bins );
              const _binB = Math.floor ( ( _freqB / ( _audioContext.sampleRate / 2 ) ) * _bins );

              let _max = 0;

              for ( let _i = _binA; _i <= _binB; _i++ )

                  _max = Math.max ( _max, _data [ _i ] ?? 0 );

              _perSectorMax [ _sector ] = _max;
          }

          for ( const _cell of _shapes )
          {
              const _sector       = _cell.sector;
              const _vector       = _perSectorMax [ _sector ];
              const _decibel      = dbFromByte ( _vector );
              const _normalizedDb = norm01FromDb ( _decibel );
              const _display      = displayDb ( _normalizedDb );

              _lastDisplayDb [ _sector ] = _display;

              const _threshold = - 12 + ( ( _cell.ring + 1 ) / RINGS ) * 24;

              if ( _threshold <= _display )
              {
                  _context.fillStyle = colorForDb ( _threshold );
                  _context.fill ( pathForCell ( _cell, _center ) );
              }

              _context.strokeStyle = "rgba(255,255,255,0.1)";

              _context.stroke ( pathForCell ( _cell, _center ) );

              _peaks [ _sector ] = Math.max ( _display, _peaks [ _sector ] - PEAK_DECAY );
          }

          _context.strokeStyle = "white";

          for ( let _sector = 0; _sector < SECTORS; _sector++ )
          {
              const _ringIndex  = Math.floor ( ( ( _peaks [ _sector ] + 12 ) / 24 ) * RINGS );
              const _ringStep   = _radius / RINGS;
              const _ring       = ( _ringIndex + 1 ) * _ringStep;
              const _startAngle = ( _sector * Math.PI * 2 ) / SECTORS + ROTATE_UP;
              const _endAngle   = ( ( _sector + 1 ) * Math.PI * 2 ) / SECTORS + ROTATE_UP;

              _context.beginPath ( );
              _context.arc ( _center.x, _center.y, _ring, _startAngle, _endAngle );
              _context.stroke ( );
          }

          if ( ELEMENTS.inputs.glow.checked )
          {
              const _bassBins = Math.max ( 1, Math.floor ( data.length * 0.05 ) );

              let _sum = 0;

              for ( let _i = 0; _i < _bassBins; _i++)

                  _sum += data [ _i ];

              const _bass = _sum / ( _bassBins * 255 );

              _drawGlow ( _bass );
          }

          requestAnimationFrame ( loop );
      };

      loop ( );
  }

  /** Simple radial bass glow. */
  function _drawGlow ( bass: number )
  {
      const _radius   = _radius * ( 0.15 + bass * 0.2 );
      const _gradient = _context.createRadialGradient ( _center.x, _center.y, 0, _center.x, _center.y, r );

            _gradient.addColorStop ( 0, `rgba(255, 200, 90, ${0.3 + bass * 0.4})` );
            _gradient.addColorStop ( 1, "rgba(0,0,0,0)" );

      _context.save ( );

      _context.globalCompositeOperation = "lighter";
      _context.fillStyle = _gradient;

      _context.beginPath ( );
      _context.arc ( _center.x, _center.y, _radius, 0, Math.PI * 2 );
      _context.fill ( );

      _context.restore ( );
  }

////    HOVER TOOLTIP LOGIC    ////////////////////////////

  ELEMENTS.canvas.addEventListener ( "mousemove", ( event ) =>
  {
      const _rectangle = ELEMENTS.canvas.getBoundingClientRect ( );
      const _x         = event.clientX - _rectangle.left;
      const _y         = event.clientY - _rectangle.top;
      const _dx        = _x - _center.x;
      const _dy        = _y - _center.y;
      const _distance  = Math.sqrt ( _dx * _dx + _dy * _dy );
      const _angle     = Math.atan2 ( _dy, _dx );

      for ( const _cell of _shapes )
      {
          if ( _distance >= _cell.innerR && _distance <= _cell.outerR && _angle >= _cell.startAngle && _angle <= _cell.endAngle )
          {
              const _sector  = _cell.sector;
              const _freqA   = _freqBounds [ _sector ];
              const _freqB   = _freqBounds [ _sector + 1 ];
              const _decibel = _lastDisplayDb [ _sector ];

              _tooltip.style.opacity = "1";
              _tooltip.style.left    = event.clientX + 12 + "px";
              _tooltip.style.top     = event.clientY + 12 + "px";
              _tooltip.innerHTML     = `<b>${_freqA.toFixed ( 0 )} – ${_freqB.toFixed ( 0 )} Hz</b><br>${_decibel.toFixed ( 1 )} dB`;

              return;
          }
      }

      _tooltip.style.opacity = "0";
  });

  ELEMENTS.canvas.addEventListener ( "mouseleave", ( ) =>
  {
      _tooltip.style.opacity = "0";
  } );

////    EVENT BINDINGS    /////////////////////////////////

  function _wireUI ( )
  {
      ELEMENTS.buttons.init.addEventListener ( "click", ( ) =>
      {
          _usingAudio = false;
          _setStatus ( false );
          _drawGrid ( );
      } );

      ELEMENTS.buttons.mic.addEventListener ( "click", ( ) => startAudio ( ) );

      ELEMENTS.inputs.fileAudio.addEventListener ( "change", async ( element ) =>
      {
          const file = ( element.target as HTMLInputElement ).files?.[ 0 ];

          if ( ! file ) return;

          // Reuse or create audio element
          if ( _loadedAudioElement )
          {
              _loadedAudioElement.pause ( );
              _loadedAudioElement.src = "";
          }

          _loadedAudioElement             = new Audio ( URL.createObjectURL ( file ) );
          _loadedAudioElement.crossOrigin = "anonymous";
          _loadedAudioElement.loop        = true;
          _loadedAudioElement.preload     = "auto";
          _loadedAudioElement.volume      = 1.0;

          // Initialize or reuse the AudioContext + Analyser
          if ( ! _audioEnvironment )

              _audioEnvironment = await initAudio ( parseInt ( ELEMENTS.inputs.fft.value, 10 ), false );

          const { context: _audioContext, analyser: _analyser } = _audioEnvironment;

          // Only create one MediaElementSource for this element
          if ( _loadedSrcNode )

              _loadedSrcNode.disconnect ( );

          _loadedSrcNode = _audioContext.createMediaElementSource ( _loadedAudioElement );

          _loadedSrcNode.connect ( _analyser );
          _analyser.connect ( _audioContext.destination );

          // Bind context state handlers
          _loadedAudioElement.addEventListener ( "play", async ( ) =>
          {
              if ( _audioContext.state === "suspended" )

                  await _audioContext.resume ( );

              _setStatus ( true );
          } );

          _loadedAudioElement.addEventListener ( "pause", ( ) => _setStatus ( false ) );
          _loadedAudioElement.addEventListener ( "ended", ( ) => _setStatus ( false ) );

          // Start visualizer loop (if not already running)
          _startVisualizerLoop ( );

          // Enable Play button
          ELEMENTS.buttons.play.disabled = false;

          await _loadedAudioElement.play ( ).catch ( ( ) => { } );
      } );

      ELEMENTS.buttons.play.addEventListener ( "click", async ( ) =>
      {
          if ( ! _loadedAudioElement ) return;

          const _audioContext = _audioEnvironment?.context;

          if ( ! _audioContext ) return;

          if ( _loadedAudioElement.paused )
          {
              if ( _audioContext.state === "suspended" )

                  await _audioContext.resume ( );

              await _loadedAudioElement.play ( );

              _setStatus ( true );
          }
          else
          {
              _loadedAudioElement.pause ( );

              _setStatus ( false );
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

          if ( _audioEnvironment?.analyser )
          {
              // Update FFT size and reallocate data buffer
              const { analyzer: _analyser } = _audioEnvironment;

              _analyser._fftSize     = _fftSize;
              _audioEnvironment.data = new Uint8Array ( _analyser.frequencyBinCount );

              // Log and brief UI feedback
              console.log ( `FFT size changed → ${_fftSize} (bins: ${_analyser.frequencyBinCount})` );

              _fftOut.classList.add ( "updated" );

              setTimeout ( ( ) => _fftOut.classList.remove ( "updated" ), 120 );
          }
      } );

      ELEMENTS.buttons.export.addEventListener ( "click", _exportShapes );

      ELEMENTS.buttons.selfTest.addEventListener ( "click", ( ) =>
      {
          try
          {
              if ( ! ( context instanceof CanvasRenderingContext2D ) )

                  throw new Error ( "Canvas context missing" );

              if ( _shapes.length !== RINGS * SECTORS )

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
          if ( event.key === "ArrowRight" ) _nextSector ( );

          if ( event.key === "ArrowLeft"  ) _prevSector ( );
      } );
  }

////    INITIALIZATION    /////////////////////////////////

  function init ( )
  {
      _drawGrid ( );
      _setStatus ( false );
      _wireUI ( );

      console.log ( "Visualizer initialized" );
  }

  init ( );
