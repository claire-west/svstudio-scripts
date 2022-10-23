// moves a selection up one semitone
// recommended hotkey: up arrow
var SCRIPT_TITLE = "Move Notes Up";

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
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
    selectedNotes[i].setPitch(pitch + 1);
  }
}

function main() {
  move();
  SV.finish();
}
