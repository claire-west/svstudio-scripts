// moves a selection down one semitone
// recommended hotkey: down arrow
var SCRIPT_TITLE = "Move Notes Down";

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

  for (var i = 0; i < selectedNotes.length; i++) {
    var pitch = selectedNotes[i].getPitch();
    selectedNotes[i].setPitch(pitch - 1);
  }
}

function main() {
  move();
  SV.finish();
}
