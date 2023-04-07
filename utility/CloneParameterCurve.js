// copies a parameter curve of one type to a different type for the selection or entire track
var SCRIPT_TITLE = 'Clone Parameter Curve';

function getClientInfo() {
  return {
    "name": SV.T(SCRIPT_TITLE),
    "category": "Claire's Scripts - Utility",
    "author": "https://github.com/claire-west/svstudio-scripts",
    "versionNumber": 2,
    "minEditorVersion": 65537
  }
}

var PARAMS = {
  'Pitch Deviation': {
    unit: 'cents',
    defaultVal: 0,
    defaultRange: 600,
    max: 1200,
    min: -1200,
    typeName: 'pitchDelta'
  },
  'Vibrato Envelope': {
    unit: '%',
    defaultVal: 1,
    defaultRange: 2,
    max: 2,
    min: 0,
    typeName: 'vibratoEnv'
  },
  Loudness: {
    unit: 'dB',
    defaultVal: 0,
    defaultRange: 24,
    max: 24,
    min: Number.NEGATIVE_INFINITY,
    typeName: 'loudness'
  },
  Tension: {
    unit: '%',
    defaultVal: 0,
    defaultRange: 2,
    max: 2,
    min: -2,
    typeName: 'tension'
  },
  Breathiness: {
    unit: '%',
    defaultVal: 0,
    defaultRange: 2,
    max: 2,
    min: -2,
    typeName: 'breathiness'
  },
  Voicing: {
    unit: '%',
    defaultVal: 1,
    defaultRange: 1,
    max: 1,
    min: 0,
    typeName: 'voicing'
  },
  Gender: {
    unit: '%',
    defaultVal: 0,
    defaultRange: 2,
    max: 2,
    min: -2,
    typeName: 'gender'
  },
  'Tone Shift': {
    unit: 'cents',
    defaultVal: 0,
    defaultRange: 800,
    max: 1600,
    min: -1600,
    typeName: 'toneShift'
  },
  'Vocal Mode': {
    unit: '%*100',
    defaultVal: 0,
    defaultRange: 150,
    max: 150,
    min: 0
  }
};

var paramList = [];
for (var name in PARAMS) {
  paramList.push(name);
}

function getTrackList() {
  var project = SV.getProject();
  var trackCount = project.getNumTracks();

  var tracks = [];
  for (var i = 0; i < trackCount; i++) {
    var track = project.getTrack(i);
    tracks.push((track.getDisplayOrder() + 1) + ' - ' + track.getName());
  }

  tracks.sort().unshift('Current Track');

  return tracks;
}

var form = {
  title: SV.T(SCRIPT_TITLE),
  buttons: 'OkCancel',
  widgets: [
    {
      name: 'fromParam',
      type: 'ComboBox',
      label: SV.T('Source Parameter'),
      choices: paramList
    },
    {
      name: 'toParam',
      type: 'ComboBox',
      label: SV.T('Target Parameter'),
      choices: paramList
    },
    {
      name: 'fromTrack',
      type: 'ComboBox',
      label: SV.T('Source Track'),
      default: 'Current Track'
    },
    {
      name: 'toTrack',
      type: 'ComboBox',
      label: SV.T('Target Track'),
      default: 'Current Track'
    },
    {
      name: 'scale',
      type: 'Slider',
      label: SV.T('Scale'),
      format: '%1.0f%%',
      default: 100,
      minValue: -250,
      maxValue: 250,
      interval: 10
    }
  ]
};

var vocalModeForm = {
  title: SV.T(SCRIPT_TITLE),
  message: SV.T('Enter the name of the vocal mode to use.'),
  buttons: 'OkCancel'
};

function showForm() {
  var trackList = getTrackList();
  form.widgets[2].choices = trackList;
  form.widgets[3].choices = trackList;

  var result = SV.showCustomDialog(form);
  if (result.status) {
    return {
      fromParam: paramList[result.answers.fromParam],
      toParam: paramList[result.answers.toParam],
      fromTrack: trackList[result.answers.fromTrack],
      toTrack: trackList[result.answers.toTrack],
      scale: result.answers.scale / 100
    };
  }
  return null;
};

function showVocalModeForm(args) {
  var widgets = [];

  if (args.fromParam === 'Vocal Mode') {
    widgets.push({
      name: 'fromParam',
      type: 'TextBox',
      label: SV.T('Source Vocal Mode')
    });
  }

  if (args.toParam === 'Vocal Mode') {
    widgets.push({
      name: 'toParam',
      type: 'TextBox',
      label: SV.T('Target Vocal Mode')
    });
  }

  if (widgets.length > 0) {
    vocalModeForm.widgets = widgets;
    var result = SV.showCustomDialog(vocalModeForm);

    if (result.status) {
      return result.answers;
    }
  }
  return null;
};

function getTrackByFormLabel(name) {
  if (name === 'Current Track') {
    return SV.getMainEditor().getCurrentTrack();
  }

  var displayOrder = Number(name.split(' - ')[0]) - 1;

  var project = SV.getProject();
  var trackCount = project.getNumTracks();

  for (var i = 0; i < trackCount; i++) {
    var track = project.getTrack(i);
    if (track.getDisplayOrder() === displayOrder) {
      return track;
    }
  }

  return null;
}

function cloneParam(args) {
  var selection = SV.getMainEditor().getSelection();
  var selectedNotes = selection.getSelectedNotes();

  var fromTrack = getTrackByFormLabel(args.fromTrack);
  var toTrack = getTrackByFormLabel(args.toTrack);

  var fromParam = fromTrack.getGroupReference(0).getTarget().getParameter(args.fromParamType);
  var toParam = toTrack.getGroupReference(0).getTarget().getParameter(args.toParamType);

  var points;
  if (selectedNotes.length > 0) {
    points = fromParam.getPoints(selectedNotes[0].getOnset(), selectedNotes[selectedNotes.length - 1].getEnd());
  } else {
    points = fromParam.getAllPoints();
  }

  DEBUG && SV.showMessageBox(SV.T(SCRIPT_TITLE), 'Copying ' + points.length + ' points from ' + fromParam.getType() + ' to ' + toParam.getType());

  var ratio = 1;
  var max = PARAMS[args.toParam].max;
  var min = PARAMS[args.toParam].min;
  if (PARAMS[args.fromParam].unit !== PARAMS[args.toParam].unit) {

    ratio = PARAMS[args.fromParam].defaultRange / PARAMS[args.toParam].defaultRange;

    DEBUG && SV.showMessageBox(SV.T(SCRIPT_TITLE), 'Selected parameters have different units; performing unit conversion with ratio ' + ratio);
  }

  var offset = PARAMS[args.toParam].defaultVal - (PARAMS[args.fromParam].defaultVal / ratio);

  if (selectedNotes.length > 0) {
    toParam.remove(selectedNotes[0].getOnset(), selectedNotes[selectedNotes.length - 1].getEnd());
  } else {
    toParam.removeAll();
  }

  for (var i = 0; i < points.length; i++) {
    var pos = points[i][0];
    var val = points[i][1];

    var newVal = val * args.scale / ratio + offset;
    newVal = Math.max(min, Math.min(newVal, max));

    toParam.add(pos, newVal);

    DEBUG_VERBOSE && SV.showMessageBox(SV.T(SCRIPT_TITLE), 'Created point at ' + pos + ' with value ' + val + ' → ' + newVal);
  }

  DEBUG && SV.showMessageBox(SV.T(SCRIPT_TITLE), 'Points created without error');
}

function capitalizeVocalMode(vocalMode) {
  return vocalMode.charAt(0).toLocaleUpperCase() + vocalMode.slice(1).toLocaleLowerCase();
}

function main() {
  var result = showForm();
  if (result) {

    var vocalModeResult = showVocalModeForm(result);
    if (vocalModeResult && vocalModeResult.fromParam) {
      result.fromParamType = 'vocalMode_' + capitalizeVocalMode(vocalModeResult.fromParam);
    } else {
      result.fromParamType = PARAMS[result.fromParam].typeName;
    }
    if (vocalModeResult && vocalModeResult.toParam) {
      result.toParamType = 'vocalMode_' + capitalizeVocalMode(vocalModeResult.toParam);
    } else {
      result.toParamType = PARAMS[result.toParam].typeName;
    }

    DEBUG && SV.showMessageBox(SV.T(SCRIPT_TITLE), JSON.stringify(result));

    cloneParam(result);
  }
  SV.finish();
}

DEBUG = false;
DEBUG_VERBOSE = false;