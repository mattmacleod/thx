# THX Deep Note

This project is my attempt to recreate the [THX Deep Note](https://www.thx.com/deepnote/) in Javascript. It was inspired by [Batuhan Bozkurt's work on the same thing](https://earslap.com/article/recreating-the-thx-deep-note.html), but I was interested in how the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) could be used to implement the same thing.

## Description

The prototype sound I'm basing this implementation on is [this video on YouTube](https://www.youtube.com/watch?v=uYMpMcmpfkI). This is closer to the original Deep Note; newer ones seem to be generally shorter in duration and at a slightly higher pitch, and this one is the classic that I remember from Star Wars when I was a kid.

The Deep Note is a collection of overlaid sawtooth waveforms which gradually fade in, vary their frequency and pan slightly, then after a few seconds a crescendo kicks in and the fundamentals follow a distinctive envelope to a final landing note (consisting of stacked, detuned octaves around the fundamental).

### Timeline

The deep note is slightly over 30 seconds in length with some events at the following timestamps:

- *0 seconds* / *0* – fade-in starts
- *7.5 seconds* / *0.24* – initial fade-in completed
- *9.5 seconds* / *0.3* – fundamental frequencies start to move
- *14 seconds* / *0.45*– main crescendo envelope begins
- *18.5 seconds* / *0.6* – final landing note is reached
- *24 seconds* / *0.775* – fade-out begins
- *30.5 seconds* / *1* – fade-out ends

## Constructing the note

We start by generating the fundamentals that we want to include in the note. Batuhan uses 30 of these, and it seems like a pretty good number to work with. The initial frequency of each fundamental is chosen randomly from between 175-250Hz, and detuned randomly by ±10 cents to add some depth, then a low-pass filter is applied to knock off any nasty high-frequency patterns we end up with.

The frequency of the fundamentals slowly drifts up and down by a small amount that's proportional to their base frequency – that is, higher base frequencies will vary by a larger amount. Each fundamental simultaneously pans between channels to add width.


## Technical implementation

The UI is built in React, because I have the ultimate goal of allowing the various parameters to be tweaked.

The `Note` class is the base for playing a Deep Note. We create a `Note` then call `start()` on it to begin playback. The `Note` includes a final gain stage that we use for the main volume envelope (independent of the fundamentals).


## TODO

Clean up main note class
