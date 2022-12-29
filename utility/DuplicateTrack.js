// duplicates the current track (normally only possible with right click)
var SCRIPT_TITLE = "Duplicate Current Track";

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "category": "Claire's Scripts - Utility",
    "author": "claire",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

function duplicateCurrentTrack() {
  var project = SV.getProject();
  var track = SV.getMainEditor().getCurrentTrack();
  var copy = track.clone();
  project.addTrack(copy);
}

function main() {
  duplicateCurrentTrack();
  SV.finish();
}
