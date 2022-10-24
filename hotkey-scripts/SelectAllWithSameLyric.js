// selects all notes with the same lyric as the selected note
// if multiple notes will selected, will search based on the first note in the current selection
var SCRIPT_TITLE = "Select All With Same Lyric";

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

function findAllWithLyric() {
  var editorView = SV.getMainEditor();
  var selection = editorView.getSelection();
  var selectedNotes = selection.getSelectedNotes();
  var currentGroup = editorView.getCurrentGroup().getTarget();

  if (selectedNotes.length == 0) {
    return;
  }

  var selectedNote = selectedNotes[0];
  var noteCount = currentGroup.getNumNotes();

  // instead of clearing the user's selection immediately, find all the matches first
  // if there are no matches we don't need to change the selection
  var matchingNotes = [];
  for (var i = 0; i < noteCount; i++) {
    // found a match, select it and stop searching
    var currentNote = currentGroup.getNote(i);
    if (currentNote.getLyrics() == selectedNote.getLyrics()) {
      matchingNotes.push(currentNote);
    }
  }

  // if length = 1 then only the original selection is a match, so don't change the selection
  if (matchingNotes.length > 1) {
    selection.clearAll();
    for (var i = 0; i < matchingNotes.length; i++) {
      selection.selectNote(matchingNotes[i]);
    }
  }
}

function main() {
  findAllWithLyric();
  SV.finish();
}
