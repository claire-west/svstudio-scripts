var SCRIPT_TITLE = "Move Selected Notes";

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "category": "Claire's Scripts - Utility",
    "author": "claire",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

function move(options) {
  var selection = SV.getMainEditor().getSelection();
  var selectedNotes = selection.getSelectedNotes();
  if (selectedNotes.length == 0 || options.measures == 0) {
    SV.showMessageBox(SV.T(SCRIPT_TITLE), SV.T("No notes selected."));
    return;
  }
  options.measures = parseFloat(options.measures, 10);
  if (isNaN(options.measures)){
    SV.showMessageBox(SV.T(SCRIPT_TITLE), SV.T("Invalid number of measures."));
    return;
  }

  if (options.backward) {
    options.measures *= -1;
  }

  var shiftBy = options.measures * SV.QUARTER * 4;
  for (var i = 0; i < selectedNotes.length; i++) {
    var currOnset = selectedNotes[i].getOnset();
    var newOnset = currOnset + shiftBy;
    if (newOnset < 0) {
      newOnset = 0;
    }
    selectedNotes[i].setOnset(newOnset);
  }
}

function main() {
  var form = {
    "title": SV.T(SCRIPT_TITLE),
    "message": "",
    "buttons": "OkCancel",
    "widgets": [
      {
        "name": "measures",
        "type": "TextBox",
        "label": "Measures",
        "default": "1"
      },
      {
        "name": "backward",
        "type": "CheckBox",
        "text": SV.T("Move backward"),
        "default": false
      }
    ]
  };

  var results = SV.showCustomDialog(form);
  if (results.status) {
    move(results.answers);
  }

  SV.finish();
}
