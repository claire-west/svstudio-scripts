// pastes the clipboard content to the selected notes as lyrics
var SCRIPT_TITLE = "Paste Lyrics";

// the separator to use between each lyric when pasting to multiple notes
var DELIMITER = ' ';

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "category": "Claire's Scripts - Hotkey Scripts",
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

function pasteLyricsToSelection() {
  var editorView = SV.getMainEditor();
  var selection = editorView.getSelection();
  var selectedNotes = selection.getSelectedNotes();
  if (selectedNotes.length == 0) {
    return;
  }

  var lyrics = SV.getHostClipboard().split(DELIMITER);
  for (var i = 0; i < selectedNotes.length && i < lyrics.length; i++) {
    selectedNotes[i].setLyrics(lyrics[i]);
  }
}

function main() {
  pasteLyricsToSelection();
  SV.finish();
}
