// moves a selection right based on the current snap setting (or a specified distance)
// recommended hotkey: right arrow
var SCRIPT_TITLE = "Move Notes Right";

// move distance based on current snap setting
var MOVE_BY_SNAP_SETTING = true;

// snap the final note position to the grid
var SNAP_FINAL_POSITION = true;

// if SNAP_FINAL_POSITION is true, only snap the final position if it is close to the grid
// this is helpful if a note is intentionally offset by 25-50% of the current snap setting, so as not to override the user's timing changes
// for example, a note with 1/32 offset on a 1/8 or 1/16 grid is assumed to be intentional and will not snap to the larger grid, but a 1/32 offset on a 1/4 grid will snap
// to always snap to grid, set it to 0.51
// to never snap to grid, set it to 0 (or set SNAP_FINAL_POSITION to false)
// to manually snap to the grid, use the built-in "Snap to Grid" function under the "Modify" menu
var SNAP_THRESHOLD = 0.25;

// if MOVE_BY_SNAP_SETTING is false, always move notes the specified distance
// to move 1 measure at a time, change this to 4
// to move 1/8 at a time, set it to 0.5
var QUARTERS_TO_MOVE = 1;

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "category": "Claire's Scripts - Hotkey Scripts",
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 4,
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
  var snapSetting = lib.getSnapSetting();
  if (MOVE_BY_SNAP_SETTING) {
    shiftBy = snapSetting;
  } else {
    shiftBy = QUARTERS_TO_MOVE * SV.QUARTER;
  }

  var snapDiff = 0;
  for (var i = 0; i < selectedNotes.length; i++) {
    var currOnset = selectedNotes[i].getOnset();

    // only perform snapping on the first note in selection, adjust all others by same amount
    if (i === 0 && SNAP_FINAL_POSITION) {
      var snappedOnset = lib.smartSnap(currOnset, snapSetting * SNAP_THRESHOLD);
      snapDiff = snappedOnset - currOnset;

    // if snapping already moved the note to the right, don't move an extra grid distance
    if (snapDiff > 0) {
      shiftBy = 0;
    }
    }

    var newOnset = currOnset + shiftBy;
    selectedNotes[i].setOnset(newOnset + snapDiff);
  }
}

function main() {
  move();
  SV.finish();
}

var lib=lib||{};
// Minified from https://github.com/claire-west/svstudio-scripts-dev/blob/main/reuse/getSnapSetting.js
lib.getSnapSetting=function(){for(var a=SV.getMainEditor().getNavigation(),b=0,c=1e7;0===b;c+=5e6)b=a.snap(b+c);return b};
// Minified from https://github.com/claire-west/svstudio-scripts-dev/blob/main/reuse/smartSnap.js
lib.smartSnap=function(a,b){var c=SV.getMainEditor().getNavigation(),d=c.snap(a);return Math.abs(a-d)<b?d:a};