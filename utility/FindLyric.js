/** FindLyric.js
 * Find notes matching a specified lyric or phoneme sequence.
 */
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
    "category": "Claire's Scripts - Utility",
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 2,
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
  lib.scrollToNote(note, {
    SCROLL_V: SCROLL_V,
    OFFSET_V: OFFSET_V
  });
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

  var startFromNote = lib.getNearestNote(selection, currentGroup, answers.backward, answers.wrap);
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
  var selection = SV.getMainEditor().getSelection();
  var selectedNotes = selection.getSelectedNotes();
  if (selectedNotes.length > 0) {
    form.widgets[0].default = selectedNotes[0].getLyrics();
  }
  promptForLyric();
}

var lib=lib||{};
// Minified from https://github.com/claire-west/svstudio-scripts-dev/blob/main/reuse/getNearestNote.js
lib.getNearestNote=function(a,b,c,d){var e=a.getSelectedNotes(),f=b.getNumNotes();if(e.length>0)return e[0];if(c){for(var g=SV.getProject().getTimeAxis(),h=SV.getPlayback().getPlayhead(),i=g.getBlickFromSeconds(h),j=f-1;j>=0;j--){var k=b.getNote(j);if(k.getOnset()<i)return k}if(d)return b.getNote(f-1)}else{for(var g=SV.getProject().getTimeAxis(),h=SV.getPlayback().getPlayhead(),i=g.getBlickFromSeconds(h),j=0;j<f;j++){var k=b.getNote(j);if(k.getOnset()>i)return k}if(d)return b.getNote(0)}return null};
// Minified from https://github.com/claire-west/svstudio-scripts-dev/blob/main/reuse/scrollToNote.js
lib.scrollToNote=function(a,b){var c=b.OFFSET_H||0,d=b.OFFSET_V||-6,e=void 0===b.SCROLL_H||b.SCROLL_H,f=void 0===b.SCROLL_V||b.SCROLL_V,g=SV.getMainEditor().getNavigation();if(e){var h=a.getOnset(),i=(a.getEnd()-h)/2,j=g.getTimeViewRange(),k=j[1]-j[0],l=h+i-k/2;l<0&&(l=0),g.setTimeLeft(l+c)}f&&g.setValueCenter(a.getPitch()+d)};