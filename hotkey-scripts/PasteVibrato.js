// paste the copied vibrato settings to the selected note
var SCRIPT_TITLE = "Paste Vibrato";

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "category": "Claire's Scripts - Hotkey Scripts",
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

function pasteVibratoToNote() {
  var editorView = SV.getMainEditor();
  var selection = editorView.getSelection();
  var selectedNotes = selection.getSelectedNotes();
  if (selectedNotes.length == 0) {
    return;
  }

  var vibrato = JSON.parse(SV.getHostClipboard());
  for (var i = 0; i < selectedNotes.length; i++) {
    selectedNotes[i].setAttributes(vibrato);
  }
}

function main() {
  pasteVibratoToNote();
  SV.finish();
}
