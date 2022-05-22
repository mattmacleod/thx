import styles from './styles.module.scss';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import InputRange, { Range } from 'react-input-range';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { shadesOfPurple as codestyle } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import Note from 'audio/note';

const DEFAULT_SETTINGS = {
  oscillatorCount: 30,
  minBaseFrequency: 200,
  maxBaseFrequency: 400,
};

const baseNote = new Note();

const App = React.memo(() => {

  // Prepare the note instance, which wraps all audio functionality. This is a
  // bit of a silly implementation, but it lets us not have to worry about the
  // possibility of the note changing during a callback etc.
  const note = useRef<Note>(baseNote);

  // Current playing state
  const [playing, setPlaying] = useState(false);

  // Configuration parameters
  const [params, setParams] = useState(DEFAULT_SETTINGS);

  // Start ands stop the note
  const onStartStop = useCallback(() => {
    if (playing) {
      note.current.stop();
      setPlaying(false);
    } else {
      note.current.start();
      setPlaying(true);
    }
  }, [playing]);

  // Handle resetting to default settings
  const onReset = useCallback(() => {
    setParams(DEFAULT_SETTINGS);
  }, []);

  // Configuration settings

  const onChangeOscillatorCount = useCallback((value: number | Range) => {
    const r = value as number;
    setParams((p) => ({...p, oscillatorCount: r}));
  }, []);

  const onChangeFrequencyRange = useCallback((value: number | Range) => {
    const r = value as Range;
    setParams((p) => ({...p, minBaseFrequency: r.min, maxBaseFrequency: r.max}));
  }, []);

  // Use an effect to apply the state changes to the actual note, to keep the
  // UI and the audio in sync. This is simpler than hooking in to each
  // individual change method.
  useEffect(() => {
    note.current.setParams(params);
  }, [params]);

  return (
    <div className={ styles.container }>
      <section className={ styles.section }>
        <div className={ styles.contentSection }>
          <h1>Recreating the THX Deep Note in the Web Audio API.</h1>
          <p>
            If you've ever seen Star Wars, you'll be familiar with the <a href='https://en.wikipedia.org/wiki/Deep_Note'>THX Deep Note</a>. This project is an attempt to recreate that note, using the <a href='https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API'>Web Audio API</a>.
          </p>
          <p>
            This project was inspired by <a href='https://earslap.com/article/recreating-the-thx-deep-note.html'>Batuhan Bozkurt's work on the recreation of this audio</a>, but experimenting with using the Web Audio API to provide an interactive canvas for playing with the note.
          </p>
          <p>
            Batuhan has already covered some of the historical details, so I won't repeat them here – but do check out the blog post linked above for more information.
          </p>
        </div>
        <div className={ styles.annotationSection }/>
      </section>

      <section className={ styles.section }>
        <div className={ styles.contentSection }>
          <h2>What is the Deep Note?</h2>
          <p>
            The prototype sound I'm basing this implementation on is <a href='https://www.youtube.com/watch?v=uYMpMcmpfkI'>this video on YouTube</a>. This is closer to the original Deep Note; newer ones like the <a href='https://www.thx.com/deepnote/'>example on the THX website</a> seem to be generally shorter in duration and at a slightly higher pitch. The YouTube video is the classic that I remember from Star Wars when I was younger.
          </p>
          <p>
            At its core, the Deep Note is a collection of overlaid sawtooth waveforms which gradually fade in, vary their frequency and pan slightly, then after a few seconds a crescendo kicks in and the fundamentals follow a distinctive envelope to a final landing note (consisting of stacked, detuned octaves around the fundamental).
          </p>
          <p>
            This sort of procedural audio generation is a great fit for the tools offered by the Web Audio API, and the web as a platform allows for a lot of flexibility in providing an interface to control and play with the audio generation pipeline.
          </p>
        </div>
        <div className={ styles.annotationSection }/>
      </section>

      <section className={ styles.section }>
        <div className={ styles.contentSection }>
          <h2>Getting started</h2>
          <p>
            First, we need some sources of audio.
          </p>
          <p>
            We'll create a set of 30 sawtooth oscillators, each with a different randomly-selected frequency. Batuhan starts with 30 of these randomly arranged between 200 and 400 Hz. Click the button to start playing audio and hear what this sounds like. Adjust the configuration to hear the effect of changing the parameters.
          </p>
        </div>
        <div className={ styles.annotationSection }>
          <div className={ styles.parameters }>
            <button className={ [styles.btn, styles.btnSuccess].join(' ') } onClick={ onStartStop }>
              { playing ? 'Stop' : 'Start' }
            </button>
            <button className={ [styles.btn, styles.btnError].join(' ') } onClick={ onReset }>Reset</button>
            <div className={ styles.field }>
              <label>Number of oscillators</label>
              <InputRange minValue={ 1 } maxValue={ 100 } step={ 1 } value={ params.oscillatorCount } onChange={ onChangeOscillatorCount }/>
            </div>
            <div className={ styles.field }>
              <label>Frequency range</label>
              <InputRange minValue={ 10 } maxValue={ 1000 } step={ 5 } value={ { min: params.minBaseFrequency, max: params.maxBaseFrequency} } onChange={ onChangeFrequencyRange }/>
            </div>
          </div>
          <SyntaxHighlighter className={ styles.code } language='typescript' style={ codestyle }>
            { `
const context = new AudioContext();
for (let i = 0; i < ${ params.oscillatorCount }; i++) {
  const oscillator = context.createOscillator();
  oscillator.type = 'sawtooth';
  oscillator.frequency.value = ${ params.minBaseFrequency } + (Math.random() * (${ params.maxBaseFrequency } - ${ params.minBaseFrequency }));
  oscillator.connect(context.destination);
  oscillator.start();
}
            ` }
          </SyntaxHighlighter>
        </div>
      </section>
    </div>
  );
});

export default App;
