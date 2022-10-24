// selects all notes matching the provided lyric
var SCRIPT_TITLE = "Select All With Lyric";

var FORM_DEFAULTS = {
  input: '',
  matchPhonemes: false
};

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

var form = {
  title: SV.T(SCRIPT_TITLE),
  buttons: 'OkCancel',
  widgets: [
    {
      name: 'input',
      label: SV.T('Lyric'),
      type: 'TextBox',
      default: FORM_DEFAULTS.input
    },
    {
      name: 'matchPhonemes',
      text: SV.T('Match Phonemes Instead of Lyrics'),
      type: 'CheckBox',
      default: FORM_DEFAULTS.matchPhonemes
    }
  ]
};

function findAllWithLyric(input, matchPhonemes) {
  var editorView = SV.getMainEditor();
  var selection = editorView.getSelection();
  var currentGroupRef = editorView.getCurrentGroup()
  var currentGroup = currentGroupRef.getTarget();
  var groupPhonemes = SV.getPhonemesForGroup(currentGroupRef);
  var noteCount = currentGroup.getNumNotes();
  if (noteCount == 0) {
    return;
  }

  // instead of clearing the user's selection immediately, find all the matches first
  // if there are no matches we don't need to change the selection
  var matchingNotes = [];
  for (var i = 0; i < noteCount; i++) {
    // found a match, select it and stop searching
    var currentNote = currentGroup.getNote(i);
    var checkString;
    if (matchPhonemes) {
      checkString = groupPhonemes[i];
    } else {
      checkString = currentNote.getLyrics()
    }

    if (checkString == input) {
      matchingNotes.push(currentNote);
    }
  }

  // if we found any matches, select them
  if (matchingNotes.length > 0) {
    selection.clearAll();
    for (var i = 0; i < matchingNotes.length; i++) {
      selection.selectNote(matchingNotes[i]);
    }
  }
}

function promptForLyric() {
  var results = SV.showCustomDialog(form)
  if (results.status) {
    findAllWithLyric(results.answers.input, results.answers.matchPhonemes);
  }
}

function main() {
  promptForLyric();
  SV.finish();
}
