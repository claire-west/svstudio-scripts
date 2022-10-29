// moves the piano roll viewport so the current selection is visible
// recommended hotkey: f (focus) or v (view)
var SCRIPT_TITLE = "Scroll To Selection Center";

// number of pitches to offset vertical scrolling
// negative values can be helpful for positioning the selection above the parameter panel instead of being blocked by it
var OFFSET_V = -6;

// whether to scroll horizontally and vertically
// if you want separate scripts/hotkeys for each, copy the script and modify these to your liking
var SCROLL_H = true;
var SCROLL_V = true;

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "category": "Claire's Scripts - Hotkey Scripts",
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

function scrollViewport() {
  var editorView = SV.getMainEditor();
  var selection = editorView.getSelection();
  var viewport = editorView.getNavigation();
  var selectedNotes = selection.getSelectedNotes();
  if (selectedNotes.length == 0) {
    return;
  }

  if (SCROLL_H) {
    var firstNote = selectedNotes[0];
    var lastNote = selectedNotes[selectedNotes.length - 1];

    var firstNoteOnset = firstNote.getOnset();
    var distanceToMiddle = (lastNote.getEnd() - firstNoteOnset) / 2;
    var viewportRange = viewport.getTimeViewRange();
    var viewportWidth = viewportRange[1] - viewportRange[0];
    var targetLeft = firstNoteOnset + distanceToMiddle - (viewportWidth / 2);
    if (targetLeft < 0) {
      targetLeft = 0;
    }
    viewport.setTimeLeft(targetLeft);
  }

  if (SCROLL_V) {
    var pitches = [];
    for (var i = 0; i < selectedNotes.length; i++) {
      pitches.push(selectedNotes[i].getPitch());
    }
    var highestPitch = Math.max.apply(Math, pitches);
    var lowestPitch = Math.min.apply(Math, pitches);
    var targetPitch = (highestPitch + lowestPitch) / 2;
    viewport.setValueCenter(targetPitch + OFFSET_V);
  }
}

function main() {
  scrollViewport();
  SV.finish();
}
