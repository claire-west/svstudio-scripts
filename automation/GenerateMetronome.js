// deprecated as of 1.8.0
// generates a track that functions as a metronome using SynthV's default sine tone
var SCRIPT_TITLE = "Generate Metronome";

// minimum number of measures to generate blips (in case your project is empty)
var DURATION_MINIMUM = 10;

// how many measures to generate blips past the end of the existing notes
// if 0, will only generate blips for the duration of the existing tracks
var DURATION_TAIL = 5;

// C6 = 84 / C5 = 72 / C4 = 60
var NOTE_PITCH = 72;
var NOTE_DURATION = 1/16 * SV.QUARTER;

var TRACK_NAME = "METRONOME";

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "category": "Claire's Scripts - Automation",
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

function getMetronomeTrack() {
  var project = SV.getProject();
  var trackCount = project.getNumTracks();

  // if metronome already exists, clean it up and reuse it
  for (var i = 0; i < trackCount; i++) {
    var track = project.getTrack(i);
    if (track.getName() === TRACK_NAME) {
      project.removeTrack(i);
      break;
    }
  }

  // no existing track, make a new one
  var newTrack = SV.create('Track');
  newTrack.setName(TRACK_NAME);
  newTrack.setDisplayColor('#ffffff');
  newTrack.setBounced(false);
  project.addTrack(newTrack);
  return newTrack.getGroupReference(0).getTarget();
}

function generateMetronome() {
  var metronome = getMetronomeTrack();
  var tailBlicks = DURATION_TAIL * SV.QUARTER * 4;
  var endBlicks = SV.getProject().getDuration() + tailBlicks;

  var minBlicks = DURATION_MINIMUM * SV.QUARTER * 4;
  if (endBlicks < minBlicks ) {
    endBlicks = minBlicks;
  }

  for (var b = 0; b < endBlicks; b += SV.QUARTER) {
    var note = SV.create('Note');
    note.setPitch(NOTE_PITCH);
    note.setOnset(b);
    note.setDuration(NOTE_DURATION);
    metronome.addNote(note);
  }
}

function main() {
  generateMetronome();
  SV.finish();
}
