// selects the next note
// default hotkey in SynthV: tab (cannot be changed)
// if no notes are selected, the first note following the playhead position will be selected
var SCRIPT_TITLE = "Select Next Note";

// by default, if multiple notes are selected, will select the next note from the start of the selection (ie the second note in the selection)
// setting this to true will instead proceed directly to the note following the last note in the selection
var FROM_END_OF_SELECTION = false;

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

function selectNext() {
  var editorView = SV.getMainEditor();
  var selection = editorView.getSelection();
  var selectedNotes = selection.getSelectedNotes();
  var currentGroup = editorView.getCurrentGroup().getTarget();

  if (selectedNotes.length == 0) {
    // no selection; select first note after playhead
    var timeAxis = SV.getProject().getTimeAxis();
    var playheadSeconds = SV.getPlayback().getPlayhead();
    var playhead = timeAxis.getBlickFromSeconds(playheadSeconds);

    for (var i = 0; i < currentGroup.getNumNotes(); i++) {
      var note = currentGroup.getNote(i);
      if (note.getOnset() > playhead) {
        selection.selectNote(note);
        break;
      }
    }
    return;
  }

  var startFromNote
  if (FROM_END_OF_SELECTION) {
    startFromNote = selectedNotes[selectedNotes.length - 1];
  } else {
    startFromNote = selectedNotes[0]
  }

  var targetIndex = startFromNote.getIndexInParent() + 1;
  if (targetIndex >= currentGroup.getNumNotes()) {
    return;
  }

  var nextNote = currentGroup.getNote(targetIndex);
  selection.clearAll();
  selection.selectNote(nextNote);
}

function main() {
  selectNext();
  SV.finish();
}
