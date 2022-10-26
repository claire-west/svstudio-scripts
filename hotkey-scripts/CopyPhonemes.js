// copies the selected notes' phonemes to the clipboard
var SCRIPT_TITLE = "Copy Phonemes";

// the separator to use between each phoneme sequence when selecting multiple notes
// a single note's phoneme sequence may contain a space, so we need a different separator than is used for lyrics
var DELIMITER = ',';

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

function copyLyricsToClipboard() {
  var editorView = SV.getMainEditor();
  var selection = editorView.getSelection();
  var selectedNotes = selection.getSelectedNotes();
  if (selectedNotes.length == 0) {
    return;
  }

  var currentGroupRef = editorView.getCurrentGroup()
  var currentGroup = currentGroupRef.getTarget();
  var groupPhonemes = SV.getPhonemesForGroup(currentGroupRef);

  var editorView = SV.getMainEditor();
  var selection = editorView.getSelection();
  var selectedNotes = selection.getSelectedNotes();
  if (selectedNotes.length == 0) {
    return;
  }

  var phonemes = [];
  for (var i = 0; i < selectedNotes.length; i++) {
    var noteIndex = selectedNotes[i].getIndexInParent();
    phonemes.push(groupPhonemes[noteIndex]);
  }

  SV.setHostClipboard(phonemes.join(DELIMITER));
}

function main() {
  copyLyricsToClipboard();
  SV.finish();
}
