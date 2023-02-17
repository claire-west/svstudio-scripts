// moves the playhead to the start of the next measure
var SCRIPT_TITLE = "Move Playhead Right";

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
  var moveRightBlicks = MEASURE_BLICKS - (currentPosBlicks % MEASURE_BLICKS);

  var newPos = timeAxis.getSecondsFromBlick(currentPosBlicks + moveRightBlicks);
  playback.seek(newPos);
}

function main() {
  movePlayhead();
  SV.finish();
}
