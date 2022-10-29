// plays only the selected section
// intended to quickly preview your changes without manually moving the playhead
var SCRIPT_TITLE = "Preview Selection";

// start this number of measures before the selection
var START_EARLY = 1/16;

// stop playback once the playhead has passed the end of the selection
// if false, will continue playing until interrupted by the user
var STOP_AFTER_SELECTION = true;
// end this number of measures after the selection (only if STOP_AFTER_SELECTION is true)
var FINISH_LATE = 1/8;

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "category": "Claire's Scripts - Hotkey Scripts",
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

function previewSelection() {
  var selection = SV.getMainEditor().getSelection();
  var selectedNotes = selection.getSelectedNotes();
  if (selectedNotes.length == 0) {
    return;
  }

  var timeAxis = SV.getProject().getTimeAxis();
  var playback = SV.getPlayback();

  var leadInMeasures = START_EARLY * SV.QUARTER * 4;
  var startSeconds = timeAxis.getSecondsFromBlick(selectedNotes[0].getOnset() - leadInMeasures);
  if (startSeconds < 0) {
    startSeconds = 0;
  }

  playback.seek(startSeconds);
  if (playback.getStatus() == 'stopped') {
    playback.play();
  }

  if (STOP_AFTER_SELECTION) {
    var lastNote = selectedNotes[selectedNotes.length - 1];
    var leadOutMeasures = FINISH_LATE * SV.QUARTER * 4;
    var endSeconds = timeAxis.getSecondsFromBlick(lastNote.getEnd() + leadOutMeasures);

    var previousPos = playback.getPlayhead();
    // is this really the best way to do async polling?
    // we could get the total duration of the selection and only do one setTimeout, however that makes it much more difficult to detect if the user has interrupted the process
    var poll = function() {
      var currentPos = playback.getPlayhead();
      // if interrupted by user (ie playback stopped or playhead moved backward), abort the script
      if (playback.getStatus() == 'stopped' || currentPos < previousPos) {
        SV.finish();
      } else if (currentPos > endSeconds) {
        playback.stop();
        SV.finish();
      } else {
        // still playing and not at the end of the selection
        previousPos = currentPos
        // 10ms is kind of overkill, but it's not doing anything demanding so there's no risk of lag, and the lower the number is the less likely we'll have issues noticing a user interruption
        SV.setTimeout(10, poll);
      }
    }
    poll();
  } else {
    SV.finish();
  }
}

function main() {
  previewSelection();
}
