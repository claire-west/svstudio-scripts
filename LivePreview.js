// watches the selection for changes and plays a preview when one is detected (this script may cause lag)
// it is VERY IMPORTANT that you only run this once (don't hotkey it), it will continue running until you stop it!
// this script will only stop running if you select the "Abort All Running Scripts" option from the top Scripts menu
var SCRIPT_TITLE = "Start Live Preview";

// how many times per second to check for changes (if you experience lag, lower this)
var CHECKS_PER_SECOND = 20;

// start this number of measures before the selection
var START_EARLY = 1/16;

// end this number of measures after the selection
var FINISH_LATE = 1/8;

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

function playPreview(note) {
  var timeAxis = SV.getProject().getTimeAxis();
  var playback = SV.getPlayback();
  playback.stop();

  var leadInMeasures = START_EARLY * SV.QUARTER * 4;
  var startSeconds = timeAxis.getSecondsFromBlick(note.getOnset() - leadInMeasures);
  if (startSeconds < 0) {
    startSeconds = 0;
  }

  playback.seek(startSeconds);
  if (playback.getStatus() == 'stopped') {
    playback.play();
  }

  var leadOutMeasures = FINISH_LATE * SV.QUARTER * 4;
  var endSeconds = timeAxis.getSecondsFromBlick(note.getEnd() + leadOutMeasures);

  var previousPos = playback.getPlayhead();
  var poll = function() {
    var currentPos = playback.getPlayhead();
    // if interrupted (ie playback stopped or playhead moved backward), stop polling
    if (playback.getStatus() == 'stopped' || currentPos < previousPos) {
      return;
    } else if (currentPos > endSeconds) {
      playback.stop();
    } else {
      // still playing and not at the end of the selection
      previousPos = currentPos
      // 10ms is kind of overkill, but it's not doing anything demanding so there's no risk of lag, and the lower the number is the less likely we'll have issues noticing a user interruption
      SV.setTimeout(10, poll);
    }
  }
  poll();
}

function hasChanged(currentState, previousState) {
  for (var prop in currentState) {
    if (currentState[prop] != previousState[prop]) {
      return true;
    }
  }
  return false;
}

function watchForChanges() {
  var previousNote = null;
  var previousState = null;
  var pollingMillis = 1000 / CHECKS_PER_SECOND;

  // is this really the best way to do async polling?
  var poll = function() {
    var selection = SV.getMainEditor().getSelection();
    var selectedNotes = selection.getSelectedNotes();
    // live preview only when modifying single notes (for simplicity)
    if (selectedNotes.length != 1) {
      SV.setTimeout(pollingMillis, poll);
      return;
    }

    var currentNote = selectedNotes[0];
    var currentState = {
      duration: currentNote.getDuration(),
      lyrics: currentNote.getLyrics(),
      phonemes: currentNote.getPhonemes(),
      pitch: currentNote.getPitch()
    };

    // if still selecting the same note, but something about the note has changed
    // notes do not have unique identifiers, but notegroups do, so check same index in same note group
    if (previousNote && previousState &&
      currentNote.getParent().getUUID() == previousNote.getParent().getUUID() &&
      currentNote.getIndexInParent() == previousNote.getIndexInParent() &&
      hasChanged(currentState, previousState)) {
      // put this at the end of the execution queue to allow rendering to finish before playing
      SV.setTimeout(0, function() {
        playPreview(currentNote);
      });
    }

    previousNote = currentNote;
    previousState = currentState;
    SV.setTimeout(pollingMillis, poll);
  }
  poll();
}

function main() {
  watchForChanges();
}
