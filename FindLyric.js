// selects the next/previous note matching the provided lyric
// will start searching from the currently selected note, or if nothing is selected, from the current playhead position
var SCRIPT_TITLE = "Find Lyric";

var SHOW_ERROR_POPUPS = true;

// whether to scroll vertically
var SCROLL_V = false;
// number of pitches to offset vertical scrolling
// negative values can be helpful for positioning the selection above the parameter panel instead of being blocked by it
var OFFSET_V = -6;

var FORM_DEFAULTS = {
  input: '',
  backward: false,
  wrap: true,
  scroll: true,
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
    },
    {
      name: 'backward',
      text: SV.T('Search Backwards'),
      type: 'CheckBox',
      default: FORM_DEFAULTS.backward
    },
    {
      name: 'wrap',
      text: SV.T('Wrap'),
      type: 'CheckBox',
      default: FORM_DEFAULTS.wrap
    },
    {
      name: 'scroll',
      text: SV.T('Scroll Into View'),
      type: 'CheckBox',
      default: FORM_DEFAULTS.scroll
    }
  ]
};

function scrollToNote(note) {
  var viewport = SV.getMainEditor().getNavigation();

  var onset = note.getOnset();
  var distanceToMiddle = (note.getEnd() - onset) / 2;
  var viewportRange = viewport.getTimeViewRange();
  var viewportWidth = viewportRange[1] - viewportRange[0];
  var targetLeft = onset + distanceToMiddle - (viewportWidth / 2);
  if (targetLeft < 0) {
    targetLeft = 0;
  }
  viewport.setTimeLeft(targetLeft);

  if (SCROLL_V) {
    viewport.setValueCenter(note.getPitch() + OFFSET_V);
  }
}

function getStartingPoint(selection, currentGroup, answers) {
  var selectedNotes = selection.getSelectedNotes();
  var noteCount = currentGroup.getNumNotes();

  if (selectedNotes.length > 0) {
    return selectedNotes[0];
  } else if (answers.backward) {
    // start from the first note prior to playhead position
    var timeAxis = SV.getProject().getTimeAxis();
    var playheadSeconds = SV.getPlayback().getPlayhead();
    var playhead = timeAxis.getBlickFromSeconds(playheadSeconds);

    for (var i = noteCount - 1; i >= 0; i--) {
      var note = currentGroup.getNote(i);
      if (note.getOnset() < playhead) {
        return note;
      }
    }
    // no notes before playhead, start from the last note if wrapping or abort if not
    if (answers.wrap) {
      return currentGroup.getNote(noteCount - 1);
    }
  } else {
    // start from the first note following playhead position
    var timeAxis = SV.getProject().getTimeAxis();
    var playheadSeconds = SV.getPlayback().getPlayhead();
    var playhead = timeAxis.getBlickFromSeconds(playheadSeconds);

    for (var i = 0; i < noteCount; i++) {
      var note = currentGroup.getNote(i);
      if (note.getOnset() > playhead) {
        return note;
      }
    }
    // no notes after playhead, start from the first note if wrapping or abort if not
    if (answers.wrap) {
      return currentGroup.getNote(0);
    }
  }
  return null;
}

function findLyric(answers) {
  var editorView = SV.getMainEditor();
  var selection = editorView.getSelection();
  var selectedNotes = selection.getSelectedNotes();
  var currentGroupRef = editorView.getCurrentGroup()
  var currentGroup = currentGroupRef.getTarget();
  var groupPhonemes = SV.getPhonemesForGroup(currentGroupRef);
  var noteCount = currentGroup.getNumNotes();
  if (noteCount == 0) {
    return;
  }

  var startFromNote = getStartingPoint(selection, currentGroup, answers);
  if (startFromNote == null) {
    // reached end of search and not wrapping
    if (SHOW_ERROR_POPUPS) {
      SV.showMessageBox(SV.T(SCRIPT_TITLE),
        SV.T('No notes in selected direction (consider enabling "Wrap").'));
    }
    return;
  }
  var startIndex = startFromNote.getIndexInParent();

  // if no current selection then the starting point is a valid result, so check that first
  if (selectedNotes.length == 0) {
    var checkString;
    if (answers.matchPhonemes) {
      checkString = groupPhonemes[startIndex];
    } else {
      checkString = startFromNote.getLyrics()
    }

    if (checkString == answers.input) {
      selection.clearAll();
      selection.selectNote(startFromNote);
      if (answers.scroll) {
        scrollToNote(startFromNote);
      }
      return;
    }
  }

  var incrementBy = 1;
  if (answers.backward) {
    incrementBy = -1;
  }

  for (var i = startIndex + incrementBy; i != startIndex; i += incrementBy) {
    // this if-else is messy but it works
    // handle reaching the start/end and wrapping/stopping accordingly
    if (!answers.backward && i == noteCount) {
      if (answers.wrap) {
        i = -1;
        continue;
      } else {
        return;
      }
    } else if (answers.backward && i == -1) {
      if (answers.wrap) {
        i = noteCount;
        continue;
      } else {
        return;
      }
    }

    // found a match, select it and stop searching
    var currentNote = currentGroup.getNote(i);
    var checkString;
    if (answers.matchPhonemes) {
      checkString = groupPhonemes[i];
    } else {
      checkString = currentNote.getLyrics()
    }
    if (checkString == answers.input) {
      selection.clearAll();
      selection.selectNote(currentNote);
      if (answers.scroll) {
        scrollToNote(currentNote);
      }
      return;
    }
  }

  if (SHOW_ERROR_POPUPS) {
    SV.showMessageBox(SV.T(SCRIPT_TITLE), SV.T('No matches found.'));
  }
}

function promptForLyric() {
  SV.showCustomDialogAsync(form, function(results) {
    if (results.status) {
      findLyric(results.answers);
      form.widgets[0].default = results.answers.input;
      form.widgets[1].default = results.answers.matchPhonemes;
      form.widgets[2].default = results.answers.backward;
      form.widgets[3].default = results.answers.wrap;
      form.widgets[4].default = results.answers.scroll;
      promptForLyric();
    } else {
      SV.finish();
    }
  });
}

function main() {
  promptForLyric();
}
