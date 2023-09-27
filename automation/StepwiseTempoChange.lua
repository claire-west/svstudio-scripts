--[[ StepwiseTempoChange.lua
  Creates a linear stepwise tempo change between two measures.
--]]
SCRIPT_TITLE = "Stepwise Tempo Change"

function getClientInfo()
  return {
    name = SV:T(SCRIPT_TITLE),
    category = 'Claire\'s Scripts - Automation',
    author = 'https://github.com/claire-west/svstudio-scripts',
    versionNumber = 1,
    minEditorVersion = 65537
  }
end

function main()
  local userInput = getUserInput()

  if userInput.status then
    userInput = validateUserInput(userInput.answers)
    if userInput ~= nil then
      createStepwisePattern(userInput)
    end
  end

  SV:finish()
end

function getPlayheadMeasure()
  local playheadLocationSeconds = SV:getPlayback():getPlayhead()
  local timeAxis = SV:getProject():getTimeAxis()
  local currentPosition = timeAxis:getBlickFromSeconds(playheadLocationSeconds)
  return timeAxis:getMeasureAt(currentPosition) + 1
end

function getTempoAtPlayhead()
  local playheadLocationSeconds = SV:getPlayback():getPlayhead()
  local timeAxis = SV:getProject():getTimeAxis()
  local currentPosition = timeAxis:getBlickFromSeconds(playheadLocationSeconds)
  return timeAxis:getTempoMarkAt(currentPosition).bpm
end

function getUserInput()
  local form = {
    title = SV:T(SCRIPT_TITLE),
    buttons = 'OkCancel',
    widgets = {
      {
        name = 'startMeasure',
        label = SV:T('Start Measure'),
        type = 'TextBox',
        default = getPlayheadMeasure()
      },
      {
        name = 'startTempo',
        label = SV:T('Initial Tempo'),
        type = 'TextBox',
        default = getTempoAtPlayhead()
      },
      {
        name = 'endMeasure',
        label = SV:T('End Measure'),
        type = 'TextBox'
      },
      {
        name = 'endTempo',
        label = SV:T('Target Tempo'),
        type = 'TextBox'
      },
      {
        name = 'offset',
        text = SV:T('Offset pattern by half step to prevent desync'),
        type = 'CheckBox',
        default = true
      }
    }
  }

  return SV:showCustomDialog(form)
end

function validateUserInput(args)
  local values = {
    startMeasure = tonumber(args.startMeasure),
    startTempo = tonumber(args.startTempo),
    endMeasure = tonumber(args.endMeasure),
    endTempo = tonumber(args.endTempo),
    offset = args.offset
  }

  local errorMessage = '';
  if values.startMeasure == nil then
    errorMessage = errorMessage..values.startMeasure..' is not a number.\n'
  end
  if values.startTempo == nil then
    errorMessage = errorMessage..values.startTempo..' is not a number.\n'
  end
  if values.endMeasure == nil then
    errorMessage = errorMessage..values.endMeasure..' is not a number.\n'
  end
  if values.endTempo == nil then
    errorMessage = errorMessage..values.endTempo..' is not a number.'
  end

  if errorMessage ~= '' then
    SV:showMessageBox(SV:T(SCRIPT_TITLE), errorMessage)
    return nil
  end

  return values
end

--[[
  There is no built-in function for getting the blicks for a specific measure number.
  Time signature markers can be fetched by measure number, and have a property for their position in blicks,
  so we can create a dummy time signature marker to figure out the conversion.
--]]
function measureToBlicks(measure)
  local timeAxis = SV:getProject():getTimeAxis()

  -- we're using the number the user sees, but measures are zero-indexed internally
  measure = measure - 1
  local marker = timeAxis:getMeasureMarkAt(measure)

  -- marker already exists
  if marker.position == measure then
    return marker.positionBlick
  end

  -- no existing marker, create one to use for conversion, then delete it
  timeAxis:addMeasureMark(measure, marker.numerator, marker.denominator)
  local blicks = timeAxis:getMeasureMarkAt(measure).positionBlick
  timeAxis:removeMeasureMark(measure)

  return blicks
end

function createStepwisePattern(args)
  local timeAxis = SV:getProject():getTimeAxis()

  local startBlicks = measureToBlicks(args.startMeasure)
  local endBlicks = measureToBlicks(args.endMeasure)
  local numberOfSteps = math.ceil(args.endMeasure - args.startMeasure) * 2
  local blicksPerStep = (endBlicks - startBlicks) / numberOfSteps
  local tempoChangePerStep = (args.endTempo - args.startTempo) / numberOfSteps

  local offsetBlicks = 0
  if args.offset then
    offsetBlicks = blicksPerStep / -2
  end

  local tempoMarkers = {
    {
      position = startBlicks + offsetBlicks,
      tempo = args.startTempo
    },
    {
      position = endBlicks + offsetBlicks,
      tempo = args.endTempo
    }
  }

  for i = 1, numberOfSteps - 1 do
    table.insert(tempoMarkers, {
      position = startBlicks + i * blicksPerStep + offsetBlicks,
      tempo = args.startTempo + i * tempoChangePerStep
    })
  end

  -- remove existing tempo markers in the range
  local existingTempoMarkers = timeAxis:getAllTempoMarks()
  for i = 1, #existingTempoMarkers do
    if (existingTempoMarkers[i].position > endBlicks) then
      break
    end

    if (existingTempoMarkers[i].position > startBlicks + offsetBlicks) then
      timeAxis:removeTempoMark(existingTempoMarkers[i].position)
    end
  end

  -- add tempo markers
  for i = 1, #tempoMarkers do
    local tempoMarker = tempoMarkers[i]
    timeAxis:addTempoMark(tempoMarker.position, tempoMarker.tempo)
  end
end