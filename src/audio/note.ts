export default class Note {
  // Audio API objects
  private context = new AudioContext();
  private oscillators: OscillatorNode[] = [];

  // Configuration
  private oscillatorCount = 30;
  private minBaseFrequency = 200;
  private maxBaseFrequency = 400;

  // State
  private isPlaying = false;

  // ///////////////////////////////////////////////////////////////////////////
  // External API
  // ///////////////////////////////////////////////////////////////////////////

  public start = () => {
    this.isPlaying = true;
    this.setOscillatorCount(this.oscillatorCount);
  };

  public stop = () => {
    this.oscillators.forEach((o) => {
      o.stop();
      o.disconnect();
    });

    this.oscillators = [];
    this.isPlaying = false;
  };

  // Apply a set of configuration parameters to the oscillators.
  public setParams = (params: {
    oscillatorCount: number,
    minBaseFrequency: number,
    maxBaseFrequency: number,
  }) => {
    if (this.oscillatorCount !== params.oscillatorCount) {
      this.setOscillatorCount(params.oscillatorCount);
    }

    if (this.minBaseFrequency !== params.minBaseFrequency || this.maxBaseFrequency !== params.maxBaseFrequency) {
      this.setFrequencyRange(params.minBaseFrequency, params.maxBaseFrequency);
    }
  };

  // ///////////////////////////////////////////////////////////////////////////
  // Internal API
  // ///////////////////////////////////////////////////////////////////////////

  // Change the oscillator count. If the new count is less than the current
  // count, delete the extra oscillators. If the new count is greater than the
  // current count, create the extra oscillators.
  public setOscillatorCount = (count: number) => {
    this.oscillatorCount = count;

    const change = count - this.oscillators.length;

    if (change > 0) {
      // The configured number of oscillators has increased, so add more.
      for (let i = 0; i < change; i++) {

        const oscillator = this.context.createOscillator();
        oscillator.type = 'sawtooth';
        oscillator.connect(this.context.destination);
        oscillator.frequency.value = this.getRandomFrequency();

        if (this.isPlaying) oscillator.start();

        this.oscillators.push(oscillator);
      }
    } else if (change < 0) {
      // The configured number of oscillators has decreased, so delete some.
      const deleted = this.oscillators.splice(0, change * -1);
      deleted.forEach((o) => o.disconnect());
    }
  };

  // Change the base frequency range of the oscillators.
  public setFrequencyRange = (min: number, max: number) => {
    this.minBaseFrequency = min;
    this.maxBaseFrequency = max;

    // Since the base frequencies are random, we need to redistribute the
    // oscillators to new frequencies.
    this.randomizeOscillatorFrequencies();
  };

  // Assign a new random frequency to each oscillator.
  private randomizeOscillatorFrequencies = () => {
    this.oscillators.forEach((o) => {
      o.frequency.value = this.getRandomFrequency();
    });
  };

  // Get a random frequency between the minimum and maximum base frequencies.
  private getRandomFrequency = () => {
    return this.minBaseFrequency + (Math.random() * (this.maxBaseFrequency - this.minBaseFrequency));
  };
}
