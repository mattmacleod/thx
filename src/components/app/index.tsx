import styles from './styles.module.scss';

import React, { useCallback, useRef, useState } from 'react';

import Note from 'audio/note';

// Define the overall runtime of the note. Event timestamps will be defined
// relative to this value.
const RUNTIME = 31000;

// The main component of the app.
const App = React.memo(() => {

  // Current playing state
  const [playing, setPlaying] = useState(false);

  // The note and associated stop timer
  const note = useRef<Note | null>(null);
  const stopTimer = useRef<number | null>(null);

  // Start playing the note
  const start = useCallback(() => {
    note.current = new Note(RUNTIME);

    note.current.start();
    setPlaying(true);
  }, []);

  // Stop playing the note
  const stop = useCallback(() => {
    if (stopTimer.current) window.clearTimeout(stopTimer.current);
    if (!note.current) return;

    void note.current.stop();
    setPlaying(false);
  }, []);

  // Toggle the note
  const onClick = useCallback(() => {
    if (playing) { stop(); } else { start(); }
  }, [playing, start, stop]);

  return (
    <div className='App'>
      <button onClick={ onClick } className={ styles.button }>
        { playing ? 'Stop' : 'Start' }
      </button>
    </div>
  );
});

export default App;
