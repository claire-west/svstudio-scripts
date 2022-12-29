// deletes the current track (normally only possible with right click)
var SCRIPT_TITLE = "Delete Current Track";

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "category": "Claire's Scripts - Utility",
    "author": "claire",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

function deleteCurrentTrack() {
  var project = SV.getProject();
  var trackIndex = SV.getMainEditor().getCurrentTrack().getIndexInParent();
  project.removeTrack(trackIndex);
}

function main() {
  deleteCurrentTrack();
  SV.finish();
}
