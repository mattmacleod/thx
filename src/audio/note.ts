import _ from 'lodash';

import Fundamental from './fundamental';

// The number of fundamentals that will be used to make up the note.
const FUNDAMENTAL_COUNT = 30;

// The timeslice accuracy used for defining the volume envelope in milliseconds.
const VOLUME_ENVELOPE_ACCURACY = 10;

// Used for terminating the note early.
const STOP_RAMP_DURATION = 300; // milliseconds

// The peak volume to use for the main envelope
const PEAK_GAIN = 1.0;

// The minimum and maximum initial frequency for fundamentals
const MIN_FREQUENCY = 200.0; // hertz
const MAX_FREQUENCY = 240.0; // hertz

// Given a base landing frequency, generate a list of final landing frequencies
// that will be distributed amongst the fundamentals.
const BASE_LANDING_FREQUENCY = 19;
const LANDING_FREQUENCY_COUNT = 7;
const LANDING_FREQUENCIES = _.times(
  LANDING_FREQUENCY_COUNT,
  (n) => BASE_LANDING_FREQUENCY * (Math.pow(2, n))
);


// This function returns the gain which should be applied to the output signal
// at a given position in the note (expressed as a fraction between 0 and 1).
//
// This function is a combination of three exponential curves – one which
// defines the initial ramp up as the note starts, one for the main crescendo,
// and one for the ramp down at the end.
const gainAt = (x: number) => {
  const e = Math.E;

  const rampUp = 0.2 / (1 + e ** (-25 * (x - 0.2)));
  const crescendo = 0.8 / (1 + e ** (-70 * (x - 0.5)));
  const rampDown = -1.02 / (1 + e ** (-45 * (x - 0.9)));

  return Math.max(0, (rampUp + crescendo + rampDown - 0.005) * PEAK_GAIN);
};

export default class Note {
  // The total runtime of the note, which is used to calculate concrete times
  // for defining the volume and sweep envelopes.
  private runtime: number;

  // The audio context that is being used.
  private context: AudioContext;

  // The output gain and panner nodes used for controlling the overall volume
  // and gain of the note.
  private outputGain: GainNode;
  private outputPanner: StereoPannerNode;
  private outputFilter: BiquadFilterNode;

  // An array of the fundamentals which make up the whole note. Each of these
  // notes is nominally independent of the others, but the relative base
  // frequency will affect the relative landing frequency and envelope we choose
  private fundamentals: Fundamental[];

  // A flag which indicates that the note is currently stopping.
  private stopping = false;

  constructor(runtime: number) {
    this.context = new AudioContext();
    this.runtime = runtime;

    // Create the fundamentals that make up the deep note.
    this.fundamentals = this.createFundamentals();

    // Create an output gain node that we can use to control the overall volume
    this.outputGain = this.context.createGain();

    // Create a global panner which will make the combined output of the
    // fundamentals drift around the stereo field
    this.outputPanner = this.context.createStereoPanner();

    // Create a global filter to boost the bass frequencies
    this.outputFilter = this.context.createBiquadFilter();
    this.outputFilter.type = 'lowshelf';
    this.outputFilter.frequency.value = 1000;
    this.outputFilter.gain.value = 10;

    // Connect the fundamentals through the output gain and panner into the
    // destination audio sink
    this.fundamentals.forEach((f) => f.output.connect(this.outputGain));
    this.outputGain.connect(this.outputFilter);
    this.outputFilter.connect(this.outputPanner);
    this.outputPanner.connect(this.context.destination);
  }

  // Create the fundamentals, selecting their start and landing frequencies in
  // the process.
  private createFundamentals() {

    // Base frequencies of the fundamentals are randomly distributed between the
    // maximum and minimum frequencies.
    const baseFrequencies = _.times(FUNDAMENTAL_COUNT, () => _.random(MIN_FREQUENCY, MAX_FREQUENCY)).sort();

    // Landing frequencies are evenly distributed between fundamentals, with
    // higher base frequencies moving to lower landing frequencies and vice
    // versa.
    const landingFrequencies = _.times(FUNDAMENTAL_COUNT, (n) => {
      const proportion = FUNDAMENTAL_COUNT / (LANDING_FREQUENCY_COUNT - 1);
      const index = LANDING_FREQUENCY_COUNT - 1 - Math.round(n / proportion);

      return LANDING_FREQUENCIES[index];
    });

    return baseFrequencies.map((f, index) => {
      return new Fundamental(
        this.context,
        this.runtime,
        FUNDAMENTAL_COUNT,
        f,
        landingFrequencies[index]
      );
    });
  }

  // Start playing the note by starting all of the fundamentals and setting the
  // values for the outer gain envelope
  public start() {
    this.applyPanDrift();
    this.applyVolumeEnvelope();

    this.fundamentals.forEach((f) => f.start());
  }

  private applyVolumeEnvelope = () => {
    const values = [];

    let timestamp = 0;
    while (timestamp < this.runtime) {
      values.push(gainAt(timestamp / this.runtime));
      timestamp += VOLUME_ENVELOPE_ACCURACY;
    }

    this.outputGain.gain.setValueCurveAtTime(values, 0, this.runtime / 1000);
  };

  private applyPanDrift = () => {
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();

    oscillator.frequency.value = 0.1;
    gain.gain.value = 0.5;

    oscillator.connect(gain);
    gain.connect(this.outputPanner.pan);
    oscillator.start();
  };

  // Stop playing the note by quickly fading out so that we avoid an unpleasant
  // click.
  public async stop() {

    // Set a stopping flag so that we know if we're already in the process of
    // stopping the note.
    if (this.stopping) return;
    this.stopping = true;

    // We're probably in the middle of a gain change, so immediately stop that
    this.outputGain.gain.cancelAndHoldAtTime(this.context.currentTime);

    // Ramp the gain down rapidly to avoid the nasty click we'd get if we just
    // immediately stopped
    this.outputGain.gain.linearRampToValueAtTime(
      0, this.context.currentTime + STOP_RAMP_DURATION / 1000
    );

    // Wait for the ramp-down to complete
    await (new Promise((r) => window.setTimeout(r, STOP_RAMP_DURATION)));

    // Stop each fundamental from doing whatever it's currently doing then close
    // the audio context entirely.
    this.fundamentals.forEach((f) => f.stop());
    void this.context.close();
  }

  // private positionToContextTime = (progress: number) => {
  //   return (this.runtime * progress) / 1000;
  // }
}
