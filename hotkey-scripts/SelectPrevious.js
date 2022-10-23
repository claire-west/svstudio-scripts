// selects the previous note
// default hotkey in SynthV: ctrl+tab (cannot be changed)
// sadly shift+tab does not work, since it doesn't override SynthV's default tab behavior and you end up selecting the next note anyway
var SCRIPT_TITLE = "Select Previous Note";

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

function selectPrev() {
  var editorView = SV.getMainEditor();
  var selection = editorView.getSelection();
  var selectedNotes = selection.getSelectedNotes();
  if (selectedNotes.length == 0) {
    return;
  }

  var selectedIndex = selectedNotes[0].getIndexInParent();
  if (selectedIndex == 0) {
    return;
  }
  var currentGroup = editorView.getCurrentGroup().getTarget();
  var previousNote = currentGroup.getNote(selectedIndex - 1);
  selection.clearAll();
  selection.selectNote(previousNote);
}

function main() {
  selectPrev();
  SV.finish();
}
