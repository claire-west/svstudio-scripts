// selects the previous note with the same lyric as the selected note
// if multiple notes will selected, will start from the first note in the selection
var SCRIPT_TITLE = "Find Prev With Same Lyric";

// if search reaches the last note, continue from the first note until reaching the original selection
var WRAP = true;

// whether to scroll horizontally
var SCROLL_H = true;
// whether to scroll vertically
var SCROLL_V = false;
// number of pitches to offset vertical scrolling
// negative values can be helpful for positioning the selection above the parameter panel instead of being blocked by it
var OFFSET_V = -6;

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

function scrollToNote(note) {
  var viewport = SV.getMainEditor().getNavigation();

  if (SCROLL_H) {
    var onset = note.getOnset();
    var distanceToMiddle = (note.getEnd() - onset) / 2;
    var viewportRange = viewport.getTimeViewRange();
    var viewportWidth = viewportRange[1] - viewportRange[0];
    var targetLeft = onset + distanceToMiddle - (viewportWidth / 2);
    if (targetLeft < 0) {
      targetLeft = 0;
    }
    viewport.setTimeLeft(targetLeft);
  }

  if (SCROLL_V) {
    viewport.setValueCenter(note.getPitch() + OFFSET_V);
  }
}

function findPrevWithLyric() {
  var editorView = SV.getMainEditor();
  var selection = editorView.getSelection();
  var selectedNotes = selection.getSelectedNotes();
  var currentGroup = editorView.getCurrentGroup().getTarget();

  if (selectedNotes.length == 0) {
    return;
  }

  var startFromNote = selectedNotes[0];
  var startIndex = startFromNote.getIndexInParent();
  var noteCount = currentGroup.getNumNotes();

  for (var i = startIndex - 1; i != startIndex; i--) {
    // if at last note, wrap to start or stop searching
    if (i == -1) {
      if (WRAP) {
        i = noteCount;
        continue;
      } else {
        return;
      }
    }

    // found a match, select it and stop searching
    var currentNote = currentGroup.getNote(i);
    if (currentNote.getLyrics() == startFromNote.getLyrics()) {
      selection.clearAll();
      selection.selectNote(currentNote);
      scrollToNote(currentNote);
      return;
    }
  }
}

function main() {
  findPrevWithLyric();
  SV.finish();
}
