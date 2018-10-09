import React from 'react';
import { hot } from 'react-hot-loader';

import Note from './note';

interface State {
  playing: boolean;
  note?: Note;
}

// Define the overall runtime of the note. Event timestamps will be defined
// relative to this value.
const RUNTIME = 31000;

class App extends React.Component {
  private stopTimer?: number;

  public readonly state: State = {
    playing: false,
  };

  public render() {
    return (
      <div className='App'>
        <button onClick={ this.onClick }>
          { this.state.playing ? 'Stop' : 'Start' }
        </button>
      </div>
    );
  }

  private onClick = () => {
    this.state.playing ? this.stop() : this.play();
  }

  private play = () => {
    const note = new Note(RUNTIME);
    note.start();

    this.setState({ note, playing: true });
    this.stopTimer = window.setTimeout(this.stop, RUNTIME);
  }

  private stop = () => {
    if (this.stopTimer) window.clearTimeout(this.stopTimer);
    if (!this.state.note) return;

    this.state.note.stop();
    this.setState({ playing: false });
  }
}

export default hot(module)(App);

