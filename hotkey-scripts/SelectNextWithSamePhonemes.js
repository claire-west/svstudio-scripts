// selects the next note with the same phonemes as the selected note
// if multiple notes will selected, will start from the first note in the selection
var SCRIPT_TITLE = "Find Next With Same Phonemes";

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
    "category": "Claire's Scripts - Hotkey Scripts",
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

function findNextWithPhonemes() {
  var editorView = SV.getMainEditor();
  var selection = editorView.getSelection();
  var selectedNotes = selection.getSelectedNotes();
  var currentGroupRef = editorView.getCurrentGroup()
  var currentGroup = currentGroupRef.getTarget();
  var groupPhonemes = SV.getPhonemesForGroup(currentGroupRef);

  if (selectedNotes.length == 0) {
    return;
  }

  var startFromNote = selectedNotes[0];
  var startIndex = startFromNote.getIndexInParent();
  var noteCount = currentGroup.getNumNotes();

  for (var i = startIndex + 1; i != startIndex; i++) {
    // if at last note, wrap to start or stop searching
    if (i == noteCount) {
      if (WRAP) {
        i = -1;
        continue;
      } else {
        return;
      }
    }

    // found a match, select it and stop searching
    var currentNote = currentGroup.getNote(i);
    if (groupPhonemes[i] == groupPhonemes[startIndex]) {
      selection.clearAll();
      selection.selectNote(currentNote);
      scrollToNote(currentNote);
      return;
    }
  }
}

function main() {
  findNextWithPhonemes();
  SV.finish();
}
