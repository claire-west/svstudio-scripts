// set the lyrics for the selected note (if multiple are selected, only modifies the lyrics for the leftmost)
// there is no way to focus the text input immediately, so you have to hit tab twice after opening it before you can type the new phonemes
// use the enter key to confirm and escape key to cancel
// recommended hotkey: l (lyrics)
// ctrl+L already exists for setting batch lyrics, but this is a bit simpler if somewhat redundant
var SCRIPT_TITLE = "Set Lyrics";

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

function setLyrics() {
  var selection = SV.getMainEditor().getSelection();
  var selectedNotes = selection.getSelectedNotes();
  if (selectedNotes.length == 0) {
    return;
  }

  var note = selectedNotes[0];

  // need to use a custom form since SV.showInputBox doesn't distinguish between empty input and the cancel button being pressed
  var form = {
    title: SV.T(SCRIPT_TITLE),
    buttons: 'OkCancel',
    widgets: [
      {
        name: 'input',
        type: 'TextBox',
        default: note.getLyrics()
      }
    ]
  };

  var result = SV.showCustomDialog(form);
  if (result.status == 1) {
    note.setLyrics(result.answers.input);
  }
}

function main() {
  setLyrics();
  SV.finish();
}
