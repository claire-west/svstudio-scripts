// generates a track that functions as a key reference
var SCRIPT_TITLE = 'Generate Key Reference';

// minimum number of measures to generate reference notes
var DURATION_MINIMUM = 10;

var TRACK_NAME = 'KEY_REFERENCE';
var TRACK_COLOR_DEFAULT = '#c7c7c7';

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "category": "Claire's Scripts - Automation",
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

var keyNames = [ 'C','C#/Db','D','D#/Eb','E','F','F#/Gb','G','G#/Ab','A','A#/Bb','B' ];
var majorScale = [ 0,2,4,5,7,9,11,12 ];
var minorScale = [ 0,2,3,5,7,8,10,12 ];

function getKeyrefTrack() {
  var project = SV.getProject();
  var trackCount = project.getNumTracks();

  // if keyref track already exists, clean it up and reuse it
  for (var i = 0; i < trackCount; i++) {
    var track = project.getTrack(i);
    if (track.getName() === TRACK_NAME) {
      return track;
    }
  }

  // no existing track, make a new one
  var newTrack = SV.create('Track');
  newTrack.setName(TRACK_NAME);
  newTrack.setBounced(false);
  return newTrack;
}

var form = {
  title: SV.T(SCRIPT_TITLE),
  message: SV.T('Rerunning the script will extend the notes to the current project length. To select a new key, delete the key reference track manually before rerunning.'),
  buttons: 'OkCancel',
  widgets: [
    {
      name: 'key',
      type: 'ComboBox',
      label: SV.T('Key'),
      choices: keyNames,
      default: 'C'
    },
    {
      name: 'minor',
      type: 'CheckBox',
      text: 'Minor',
      default: false
    },
    {
      name: 'color',
      label: SV.T('Color'),
      type: 'TextBox',
      default: TRACK_COLOR_DEFAULT
    }
  ]
};

function generateKeyReference() {
  var keyref = getKeyrefTrack();
  var mainGroup = keyref.getGroupReference(0).getTarget();
  if (mainGroup.getNumNotes() === 0) {
    // new track, prompt user for key
    var results = SV.showCustomDialog(form)
    if (!results.status) {
      return;
    }

    keyref.setDisplayColor(results.answers.color);
    var root = results.answers.key + 36;

    var intervals = majorScale;
    if (results.answers.minor) {
      intervals = minorScale;
    }

    // octaves
    for (var o = 0; o < 5; o++) {
      // pitch within octave
      for (var p = 0; p < 7; p++) {
        var note = SV.create('Note');
        var pitch = root + (o * 12) + intervals[p];
        // SV.showMessageBox('test','root=' + root + ',o=' + o + ",p=" + p + ',interval=' + intervals[p] + ',pitch=' + pitch)
        note.setPitch(pitch);
        // many notes with the exact same onset tend to cause buggy behavior
        note.setOnset((o * 12) + p);
        note.setDuration(SV.QUARTER);
        mainGroup.addNote(note);
      }
    }

    SV.getProject().addTrack(keyref);
  }

  var endBlicks = SV.getProject().getDuration();
  var minBlicks = DURATION_MINIMUM * SV.QUARTER * 4;
  if (endBlicks < minBlicks ) {
    endBlicks = minBlicks;
  }

  var noteCount = mainGroup.getNumNotes();
  for (var i = 0; i < noteCount; i++) {
    var note = mainGroup.getNote(i);
    note.setDuration(endBlicks);
  }
}

function main() {
  generateKeyReference();
  SV.finish();
}
