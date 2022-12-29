// zooms in (normally only possible with mousewheel)
var SCRIPT_TITLE = "Zoom In";

// how much to zoom per button press (as a percent)
var ZOOM_FACTOR = 0.2;

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "category": "Claire's Scripts - Hotkey Scripts",
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 1,
    "minEditorVersion": 65537
  }
}

function zoomViewport() {
  var viewport = SV.getMainEditor().getNavigation();
  var currentScale = viewport.getTimePxPerUnit();
  viewport.setTimeScale(currentScale + (currentScale * ZOOM_FACTOR));
}

function main() {
  zoomViewport();
  SV.finish();
}