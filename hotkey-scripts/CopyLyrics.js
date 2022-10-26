// copies the selected notes' lyrics to the clipboard
var SCRIPT_TITLE = "Copy Lyrics";

// the separator to use between each lyric when selecting multiple notes
var DELIMITER = ' ';

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

  var lyrics = [];
  for (var i = 0; i < selectedNotes.length; i++) {
    lyrics.push(selectedNotes[i].getLyrics());
  }

  SV.setHostClipboard(lyrics.join(DELIMITER));
}

function main() {
  copyLyricsToClipboard();
  SV.finish();
}
