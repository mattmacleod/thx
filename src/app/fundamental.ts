import _ from 'lodash';

const MIN_DETUNE = -10.0; // cents
const MAX_DETUNE = 10.0; // cents
const MIN_GAIN = 0.5;

// Number of times per second that we will update the frequency of the
// oscillator when drifting
const UPDATE_FREQUENCY = 60; // hertz

// The Fundamental is one of the contituent waveforms that make up the deep note
// in full. These are strictly independent of each other.
export default class Fundamental {
  private runtime: number;

  private oscillator: OscillatorNode;
  private panner: StereoPannerNode;
  private filter: BiquadFilterNode;

  private context: AudioContext;

  private baseFrequency: number;
  private landingFrequency: number;
  private detune: number;
  private gain: number;

  private panDriftInversion: number;
  private frequencyDriftInversion: number;
  private frequencyDriftFrequency: number;
  private panDriftFrequency: number;
  private frequencyDriftOffset: number;
  private panDriftOffset: number;
  private envelopeOffset: number;

  private stopped: boolean = false;

  constructor(
    ctx: AudioContext,
    runtime: number,
    fundamentalCount: number,
    baseFrequency: number,
    landingFrequency: number,
    gain: number,
  ) {
    this.runtime = runtime;
    this.context = ctx;
    this.baseFrequency = baseFrequency;
    this.landingFrequency = landingFrequency;
    this.gain = gain;

    console.warn(this.baseFrequency, this.landingFrequency, this.gain)

    // Randomly select a small amount of detuning to apply to the base
    // frequency. This avoids unpleasant interference patterns that otherwise
    // emerge when the frequencies are combined.
    this.detune = _.random(MIN_DETUNE, MAX_DETUNE);

    // Create a panner node that we will use to distribute this fundamental
    // within the stereo field. The initial position will be in the center, and
    // the value will subsequently be moved around the field.
    this.panner = this.context.createStereoPanner();

    const gainNode = this.context.createGain();
    gainNode.gain.value = this.gain;

    // Create the main sawtooth oscillator that generates the waveform for this
    // fundamental, and apply the selected frequency and detuning parameters.
    this.oscillator = this.context.createOscillator();
    this.oscillator.type = 'sawtooth';
    this.oscillator.detune.value = this.detune;
    this.oscillator.frequency.value = this.baseFrequency;

    // Create a low-pass filter which clips off unplesant high-frequency
    // harmonics that otherwise emerge.
    this.filter = this.context.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.Q.value = 0.5;

    // Pick random values for frequency and pan drift
    this.panDriftInversion = _.sample([1, -1])!;
    this.frequencyDriftInversion = _.sample([1, -1])!;
    this.frequencyDriftFrequency = _.random(0.05, 0.5)!;
    this.panDriftFrequency = _.random(0.5, 2.0)!;
    this.frequencyDriftOffset = _.random(100, 500)!;
    this.panDriftOffset = _.random(100, 500)!;
    this.envelopeOffset = _.random(25.0, 30.0)!;

    // Finally, connect everything up so that we're ready to go
    this.oscillator.connect(this.filter);
    this.filter.connect(gainNode);
    gainNode.connect(this.panner);
  }

  public start() {
    this.oscillator.start();
    this.startFrequencyDrift();
    this.startPanDrift();
  }

  public stop = () => {
    this.stopped = true;
  }

  // Returns the final output of the fundamental, which will be mixed with the
  // others to form the fimal note.
  public get output() {
    return this.panner;
  }

  // This function gradually shifts the fundamental frequency of the oscillator
  // to provide a drifting effect.
  private startFrequencyDrift = () => {

    // This function wil be called repeatedly to adjust the frequency of the
    // oscillator over time to implement the drift we want.
    const update = () => {

      // first, calculate the size of the shift based on the current time of
      // the audio context
      const basis = this.frequencyDriftInversion * Math.sin(this.frequencyDriftFrequency * this.context.currentTime + this.frequencyDriftOffset);

      // Calculate the frequncy shift such that higher base frequencies shift by
      // greater amounts
      const sweep = this.sweep;

      const randomFrequencyShift = (1 - sweep) * basis * this.baseFrequency * 0.4;
      const landingFrequencyShift = sweep * (this.landingFrequency - this.baseFrequency);

      // Update the frequency value of the oscillator with the new value
      this.oscillator.frequency.setValueAtTime(
        this.baseFrequency + randomFrequencyShift + landingFrequencyShift,
        this.context.currentTime
      );

      this.filter.frequency.setValueAtTime(
        (this.baseFrequency + randomFrequencyShift + landingFrequencyShift) * 3,
        this.context.currentTime,
      )

      // Repeatedly call this function until the fundamental is told to stop
      if (!this.stopped) window.setTimeout(update, 1 / UPDATE_FREQUENCY)
    }

    update();
  }

  // This function gradually shifts the stereo position of the fundamental
  private startPanDrift = () => {

    const update = () => {

      // Ccalculate the size of the shift based on the current time of the audio
      // context, then apply that shift to the panner
      const pan = this.panDriftInversion * Math.sin(this.frequencyDriftFrequency * this.context.currentTime + this.panDriftOffset);
      this.panner.pan.setValueAtTime(pan, this.context.currentTime);

      // Repeatedly update the value until the fundamental is stopped
      if (!this.stopped) window.setTimeout(update, 1 / UPDATE_FREQUENCY)
    }

    update();
  }

  private get sweep() {
    const x = (this.context.currentTime * 1000) / this.runtime;
    const e = Math.E;

    const curve1 = 0.8 / (1 + e ** (-this.envelopeOffset * (x - 0.43)));
    const curve2 = 0.2 / (1 + e ** (-70 * (x - 0.5)));

    return curve1 + curve2;
  }
}
