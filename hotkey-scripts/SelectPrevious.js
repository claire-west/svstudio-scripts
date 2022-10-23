// selects the previous note
// default hotkey in SynthV: ctrl+tab (cannot be changed)
// sadly shift+tab does not work, since it doesn't override SynthV's default tab behavior and you end up selecting the next note anyway
// if no notes are selected, the nearest note prior to the playhead position will be selected
var SCRIPT_TITLE = "Select Previous Note";

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

function selectPrev() {
  var editorView = SV.getMainEditor();
  var selection = editorView.getSelection();
  var selectedNotes = selection.getSelectedNotes();
  var currentGroup = editorView.getCurrentGroup().getTarget();

  if (selectedNotes.length == 0) {
    // no selection; select nearest note prior to playhead
    var timeAxis = SV.getProject().getTimeAxis();
    var playheadSeconds = SV.getPlayback().getPlayhead();
    var playhead = timeAxis.getBlickFromSeconds(playheadSeconds);

    for (var i = currentGroup.getNumNotes() - 1; i >= 0; i--) {
      var note = currentGroup.getNote(i);
      if (note.getOnset() < playhead) {
        selection.selectNote(note);
        break;
      }
    }
    return;
  }

  var selectedIndex = selectedNotes[0].getIndexInParent();
  if (selectedIndex == 0) {
    return;
  }
  var previousNote = currentGroup.getNote(selectedIndex - 1);
  selection.clearAll();
  selection.selectNote(previousNote);
}

function main() {
  selectPrev();
  SV.finish();
}
