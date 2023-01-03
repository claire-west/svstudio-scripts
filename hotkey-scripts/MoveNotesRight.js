// moves a selection right based on the current snap setting (or a specified distance)
// recommended hotkey: right arrow
var SCRIPT_TITLE = "Move Notes Right";

// move distance based on current snap setting
var MOVE_BY_SNAP_SETTING = true;

// if you want to move 1 measure at a time, change this to 4
// to move 1/8 at a time, set it to 0.5
// does nothing if MOVE_BY_SNAP_SETTING is true
var QUARTERS_TO_MOVE = 1;

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "category": "Claire's Scripts - Hotkey Scripts",
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 2,
    "minEditorVersion": 65537
  }
}

function move() {
  var selection = SV.getMainEditor().getSelection();
  var selectedNotes = selection.getSelectedNotes();
  if (selectedNotes.length == 0) {
    return;
  }

  var shiftBy;
  if (MOVE_BY_SNAP_SETTING) {
    shiftBy = lib.getSnapSetting();
  } else {
    shiftBy = QUARTERS_TO_MOVE * SV.QUARTER;
  }
  for (var i = 0; i < selectedNotes.length; i++) {
    var currOnset = selectedNotes[i].getOnset();
    var newOnset = currOnset + shiftBy;
    selectedNotes[i].setOnset(newOnset);
  }
}

function main() {
  move();
  SV.finish();
}

var lib=lib||{};
// Minified from https://github.com/claire-west/svstudio-scripts-dev/blob/main/reuse/getSnapSetting.js
lib.getSnapSetting=function(){for(var a=SV.getMainEditor().getNavigation(),b=0,c=1e7;0===b;c+=5e6)b=a.snap(b+c);return b};