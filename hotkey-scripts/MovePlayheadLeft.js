// moves the playhead to the start of the current measure
// or the previous measure if already at the start of the current measure
var SCRIPT_TITLE = "Move Playhead Left";

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "category": "Claire's Scripts - Hotkey Scripts",
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

var MEASURE_BLICKS = SV.QUARTER * 4;

function movePlayhead() {
  var timeAxis = SV.getProject().getTimeAxis();
  var playback = SV.getPlayback();

  var currentPos = playback.getPlayhead();
  var currentPosBlicks = timeAxis.getBlickFromSeconds(currentPos);
  var moveLeftBlicks = currentPosBlicks % MEASURE_BLICKS;

  var newPos = timeAxis.getSecondsFromBlick(currentPosBlicks - (moveLeftBlicks || MEASURE_BLICKS));
  playback.seek(newPos);
}

function main() {
  movePlayhead();
  SV.finish();
}
