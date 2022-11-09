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
    "category": "Claire's Scripts - Hotkey Scripts",
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

function scrollToNote(note) {
  lib.scrollToNote(note, {
    SCROLL_H: SCROLL_H,
    SCROLL_V: SCROLL_V,
    OFFSET_V: OFFSET_V
  });
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

var lib=lib||{};
// Minified from https://github.com/claire-west/svstudio-scripts-dev/blob/main/reuse/scrollToNote.js
lib.scrollToNote=function(a,b){var c=b.OFFSET_H||0,d=b.OFFSET_V||-6,e=void 0===b.SCROLL_H||b.SCROLL_H,f=void 0===b.SCROLL_V||b.SCROLL_V,g=SV.getMainEditor().getNavigation();if(e){var h=a.getOnset(),i=(a.getEnd()-h)/2,j=g.getTimeViewRange(),k=j[1]-j[0],l=h+i-k/2;l<0&&(l=0),g.setTimeLeft(l+c)}f&&g.setValueCenter(a.getPitch()+d)};