// pastes the clipboard content to the selected notes as phonemes
var SCRIPT_TITLE = "Paste Phonemes";

// the separator to use between each phoneme sequence when pasting to multiple notes
// a single note's phoneme sequence may contain a space, so we need a different separator than is used for lyrics
var DELIMITER = ',';

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "category": "Claire's Scripts - Hotkey Scripts",
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

function pastePhonemesToSelection() {
  var editorView = SV.getMainEditor();
  var selection = editorView.getSelection();
  var selectedNotes = selection.getSelectedNotes();
  if (selectedNotes.length == 0) {
    return;
  }

  var phonemes = SV.getHostClipboard().split(DELIMITER);
  for (var i = 0; i < selectedNotes.length && i < phonemes.length; i++) {
    selectedNotes[i].setPhonemes(phonemes[i]);
  }
}

function main() {
  pastePhonemesToSelection();
  SV.finish();
}
