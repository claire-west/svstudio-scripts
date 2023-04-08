/** CopyVibrato.js
 * Copies the selected note's vibrato settings (from the Note Properties panel) to the clipboard
 */
var SCRIPT_TITLE = "Copy Vibrato";

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "category": "Claire's Scripts - Hotkey Scripts",
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

function copyVibratoToClipboard() {
  var editorView = SV.getMainEditor();
  var selection = editorView.getSelection();
  var selectedNotes = selection.getSelectedNotes();
  if (selectedNotes.length == 0) {
    return;
  }
  var note = selectedNotes[0];
  var attributes = note.getAttributes();

  var vibrato = {
    tF0VbrStart: attributes.tF0VbrStart,
    tF0VbrLeft: attributes.tF0VbrLeft,
    tF0VbrRight: attributes.tF0VbrRight,
    dF0Vbr: attributes.dF0Vbr,
    pF0Vbr: attributes.pF0Vbr,
    fF0Vbr: attributes.fF0Vbr,
  };

  SV.setHostClipboard(JSON.stringify(vibrato));
}

function main() {
  copyVibratoToClipboard();
  SV.finish();
}
