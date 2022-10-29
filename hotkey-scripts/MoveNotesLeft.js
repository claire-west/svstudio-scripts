// moves a selection left 1/4
// recommended hotkey: left arrow
var SCRIPT_TITLE = "Move Notes Left";

// if you want to move 1 measure at a time, change this to 4
// to move 1/8 at a time, set it to 0.5
var QUARTERS_TO_MOVE = 1;

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "category": "Claire's Scripts - Hotkey Scripts",
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

function move() {
  var selection = SV.getMainEditor().getSelection();
  var selectedNotes = selection.getSelectedNotes();
  if (selectedNotes.length == 0) {
    return;
  }

  var shiftBy = QUARTERS_TO_MOVE * SV.QUARTER * -1;
  for (var i = 0; i < selectedNotes.length; i++) {
    var currOnset = selectedNotes[i].getOnset();
    var newOnset = currOnset + shiftBy;
    if (newOnset < 0) {
      newOnset = 0;
    }
    selectedNotes[i].setOnset(newOnset);
  }
}

function main() {
  move();
  SV.finish();
}
