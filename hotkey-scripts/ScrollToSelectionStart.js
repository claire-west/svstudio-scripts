// moves the piano roll viewport so the current selection is visible
// recommended hotkey: f (focus) or v (view)
var SCRIPT_TITLE = "Scroll To Selection Start";

// desired number of pixels between the left side of the screen and the start of the selection
var OFFSET_H = 200;

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

  var targetNote = selectedNotes[0];

  if (SCROLL_H) {
    var padding = OFFSET_H / viewport.getTimePxPerUnit();
    var targetLeft = targetNote.getOnset() - padding;
    if (targetLeft < 0) {
      targetLeft = 0;
    }
    viewport.setTimeLeft(targetLeft);
  }

  if (SCROLL_V) {
    viewport.setValueCenter(targetNote.getPitch() + OFFSET_V);
  }
}

function main() {
  scrollViewport();
  SV.finish();
}
