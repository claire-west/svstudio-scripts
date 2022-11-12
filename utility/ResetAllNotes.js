// resets all the property and parameter changes for a project. potentially useful if you want to distribute an untuned/bare version of your SVP for people to make covers with, or if you received a tuned SVP and want to work from a blank slate.
// please make sure to back up your project before running this. "undo" will work, but if you save and exit the program there's no going back.
var SCRIPT_TITLE = "Reset All Notes";

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "category": "Claire's Scripts - Utility",
    "author": "claire",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

var form = {
  title: SV.T('Warning: ' + SCRIPT_TITLE),
  message: SV.T('This script will reset the properties and parameters of the entire project. The only thing remaining will be the notes, their lyric input, and certain settings that cannot be modified by scripts.\n\nThis script cannot reset Tone Shift, Vocal Mode, AI Retakes, or vibrato jitter.\n\nIt is recommended to create a backup of the project before running this script.\n\nThis may take a few seconds.'),
  buttons: 'OkCancel',
  widgets: [
    {
      name: 'resetPhonemes',
      text: SV.T('Clear manual phoneme entry (green text)'),
      type: 'CheckBox'
    }
  ]
};

var paramTypes = [
  'pitchDelta',
  'vibratoEnv',
  'loudness',
  'tension',
  'breathiness',
  'voicing',
  'gender'
];

var noteDefaults = {
  tF0Offset: 0,
  tF0Left: 0.070,
  tF0Right: 0.070,
  dF0Left: 0.15,
  dF0Right: 0.15,
  tF0VbrStart: 0.25,
  tF0VbrLeft: 0.2,
  tF0VbrRight: 0.2,
  dF0Vbr: 1,
  pF0Vbr: 0,
  fF0Vbr: 5.5,
  tNoteOffset: 0,
  exprGroup: null,
  dur: null,
  alt: null
};
var voiceDefaults = {
  tF0Left: 0.070,
  tF0Right: 0.070,
  dF0Left: 0.15,
  dF0Right: 0.15,
  tF0VbrStart: 0.25,
  tF0VbrLeft: 0.2,
  tF0VbrRight: 0.2,
  dF0Vbr: 1,
  fF0Vbr: 5.5,
  paramLoudness: null,
  paramTension: null,
  paramBreathiness: null,
  paramGender: null
};

function resetGroup(group, resetPhonemes) {
  var noteCount = group.getNumNotes();

  for (var i = 0; i < noteCount; i++) {
    var note = group.getNote(i);
    note.setAttributes(noteDefaults);
    if (resetPhonemes && note.getPhonemes()) {
      note.setPhonemes('');
    }
  }

  for (var i = 0; i < paramTypes.length; i++) {
    var param = group.getParameter(paramTypes[i]);
    param.removeAll();
  }
}

function reset(resetPhonemes) {
  var proj = SV.getProject();

  var trackCount = proj.getNumTracks();
  for (var i = 0; i < trackCount; i++) {
    var track = proj.getTrack(i);
    resetGroup(track.getGroupReference(0).getTarget(), resetPhonemes);

    var groupCount = track.getNumGroups();
    for (var n = 0; n < groupCount; n++) {
      track.getGroupReference(n).setVoice(voiceDefaults)
    }
  }

  var groupCount = proj.getNumNoteGroupsInLibrary();
  for (var i = 0; i < groupCount; i++) {
    var group = proj.getNoteGroup(i);
    resetGroup(group);
  }
}

function main() {
  var result = SV.showCustomDialog(form)
  if (result.status) {
    reset(result.answers.resetPhonemes);
  }

  SV.finish();
}