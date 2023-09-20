--[[ ImportTempoMap.lua
    Reads a MIDI file (default TempoMap.mid in the SVP location) and applies any tempo changes to the current project.
--]]
SCRIPT_TITLE = "Apply Tempo from MIDI"

local MIDI_FILE_NAME = 'TempoMap.mid'

function getClientInfo()
    return {
        name = SV:T(SCRIPT_TITLE),
        category = 'Claire\'s Scripts - Automation',
        author = 'https://github.com/claire-west/svstudio-scripts',
        versionNumber = 1,
        minEditorVersion = 65537
    }
end

local ticksPerQuarter = 96
local blicksPerQuarter = 705600000

local ticks = 0
local tempoMarkers = {}
local timeSignatures = {}

local handlers = {}
function handlers.header(format, trackCount, tickCount)
    ticksPerQuarter = tickCount
end
function handlers.deltatime(delta)
    ticks = ticks + delta
end
function handlers.setTempo(tempo)
    table.insert(tempoMarkers, {
        position = ticksToBlicks(ticks),
        tempo = tempo
    })
end
local function callback(name, ...)
    local handler = handlers[name]
    if handler then
        handler(...)
    end
end

function main()
    readTempoFromMidi()
    SV:finish()
end

function readTempoFromMidi()
    local project = SV:getProject()
    local path = project:getFileName()
    local timeAxis = project:getTimeAxis()

    if path == nil or path == '' then
        path = nil
    else
        path = path:gsub('\\', '/')
        path = path:sub(0, path:find("/[^/]*$"))..MIDI_FILE_NAME
    end

    -- can't infer file path, ask the user
    if path == nil or not fileIsReadable(path) then
        path = SV:showInputBox(SV:T(SCRIPT_TITLE), 'TempoMap.mid was not found in the SVP directory.\n\nEnter the full path to your MIDI file.')
    end

    -- user clicked cancel or entered no file name
    if path == nil or path == '' then
        return;
    end

    -- file does not exist or is unreadable
    if not fileIsReadable(path) then
        SV:showMessageBox(SV:T(SCRIPT_TITLE), 'Unable to read file '..path)
        return;
    end

    local file = io.open(path, 'rb')

    -- process the file
    if not pcall(function() MidiReader.process(file, callback) end) then
        SV:showMessageBox(SV:T(SCRIPT_TITLE), 'Failed to process MIDI from '..path)
        io.close(file)
        return;
    end
    io.close(file)

    -- remove existing tempo markers
    local existingTempoMarkers = timeAxis:getAllTempoMarks()
    for i = 1, #existingTempoMarkers do
        timeAxis:removeTempoMark(existingTempoMarkers[i].position)
    end

    -- add tempo markers found in the MIDI file
    for i = 1, #tempoMarkers do
        local tempoMarker = tempoMarkers[i]
        timeAxis:addTempoMark(tempoMarker.position, tempoMarker.tempo)
    end
end

function ticksToBlicks(ticks)
    return ticks / ticksPerQuarter * blicksPerQuarter
end

function fileIsReadable(name)
    local file = io.open(name, "r")
    return file ~= nil and io.close(file)
end

-------------------------------------------------------------------------------------------------------
-- Everything below this point is from https://github.com/Possseidon/lua-midi/blob/main/lib/midi.lua --
-------------------------------------------------------------------------------------------------------

---Reads exactly count bytes from the given stream, raising an error if it can't.
---@param stream file* The stream to read from.
---@param count integer The count of bytes to read.
---@return string data The read bytes.
local function read(stream, count)
  local result = ""
  while #result ~= count do
    result = result .. assert(stream:read(count), "missing value")
  end
  return result
end

---Reads a variable length quantity from the given stream, raising an error if it can't.
---@param stream file* The stream to read from.
---@return integer value The read value.
---@return integer length How many bytes were read in total.
local function readVLQ(stream)
  local value = 0
  local length = 0
  repeat
    local byte = assert(stream:read(1), "incomplete or missing variable length quantity"):byte()
    value = value << 7
    value = value | byte & 0x7F
    length = length + 1
  until byte < 0x80
  return value, length
end

local midiEvent = {
  [0x80] = function(stream, callback, channel, fb)
    local key, velocity = ("I1I1"):unpack(fb .. stream:read(1))
    callback("noteOff", channel, key, velocity / 0x7F)
    return 2
  end,
  [0x90] = function(stream, callback, channel, fb)
    local key, velocity = ("I1I1"):unpack(fb .. stream:read(1))
    callback("noteOn", channel, key, velocity / 0x7F)
    return 2
  end,
  [0xA0] = function(stream, callback, channel, fb)
    local key, pressure = ("I1I1"):unpack(fb .. stream:read(1))
    callback("keyPressure", channel, key, pressure / 0x7F)
    return 2
  end,
  [0xB0] = function(stream, callback, channel, fb)
    local number, value = ("I1I1"):unpack(fb .. stream:read(1))
    if number < 120 then
      callback("controller", channel, number, value)
    else
      callback("modeMessage", channel, number, value)
    end
    return 2
  end,
  [0xC0] = function(stream, callback, channel, fb)
    local program = fb:byte()
    callback("program", channel, program)
    return 1
  end,
  [0xD0] = function(stream, callback, channel, fb)
    local pressure = fb:byte()
    callback("channelPressure", channel, pressure / 0x7F)
    return 1
  end,
  [0xE0] = function(stream, callback, channel, fb)
    local lsb, msb = ("I1I1"):unpack(fb .. stream:read(1))
    callback("pitch", channel, (lsb | msb << 7) / 0x2000 - 1)
    return 2
  end
}

---Processes a manufacturer specific SysEx event.
---@param stream file* The stream, pointing to one byte after the start of the SysEx event.
---@param callback function The feedback providing callback function.
---@param fb string The first already read byte, representing the manufacturer id.
---@return integer length The total length of the read SysEx event in bytes (including fb).
local function sysexEvent(stream, callback, fb)
  local manufacturer = fb:byte()
  local data = {}
  repeat
    local char = stream:read(1)
    table.insert(data, char)
  until char:byte() == 0xF7
  callback("sysexEvent", data, manufacturer, table.concat(data))
  return 1 + #data
end

---Creates a simple function, forwarding the provided name and read data to a callback function.
---@param name string The name of the event, which is passed to the callback function.
---@return function function The function, calling the provided callback function with name and read data.
local function makeForwarder(name)
  return function(data, callback)
    callback(name, data)
  end
end

local metaEvents = {
  [0x00] = makeForwarder("sequenceNumber"),
  [0x01] = makeForwarder("text"),
  [0x02] = makeForwarder("copyright"),
  [0x03] = makeForwarder("sequencerOrTrackName"),
  [0x04] = makeForwarder("instrumentName"),
  [0x05] = makeForwarder("lyric"),
  [0x06] = makeForwarder("marker"),
  [0x07] = makeForwarder("cuePoint"),
  [0x20] = makeForwarder("channelPrefix"),
  [0x2F] = makeForwarder("endOfTrack"),
  [0x51] = function(data, callback)
    local rawTempo = (">I3"):unpack(data)
    callback("setTempo", 6e7 / rawTempo)
  end,
  [0x54] = makeForwarder("smpteOffset"),
  [0x58] = function(data, callback)
    local numerator, denominator, metronome, dotted = (">I1I1I1I1"):unpack(data)
    callback("timeSignature", numerator, 1 << denominator, metronome, dotted)
  end,
  [0x59] = function(data, callback)
    local count, minor = (">I1I1"):unpack(data)
    callback("keySignature", math.abs(count), count < 0 and "flat" or count > 0 and "sharp" or "C", minor == 0 and "major" or "minor")
  end,
  [0x7F] = makeForwarder("sequenceEvent")
}

---Processes a midi meta event.
---@param stream file* A stream pointing one byte after the meta event.
---@param callback function The feedback providing callback function.
---@param fb string The first already read byte, representing the meta event type.
---@return integer length The total length of the read meta event in bytes (including fb).
local function metaEvent(stream, callback, fb)
  local event = fb:byte()
  local length, vlqLength = readVLQ(stream)
  local data = read(stream, length)
  local handler = metaEvents[event]
  if handler then
    handler(data, callback)
  end
  return 1 + vlqLength + length
end

---Reads the four magic bytes and length of a midi chunk.
---@param stream file* A stream, pointing to the start of a midi chunk.
---@return string type The four magic bytes the chunk type (usually `MThd` or `MTrk`).
---@return integer length The length of the chunk in bytes.
local function readChunkInfo(stream)
  local chunkInfo = stream:read(8)
  if not chunkInfo then
    return false
  end
  assert(#chunkInfo == 8, "incomplete chunk info")
  return (">c4I4"):unpack(chunkInfo)
end

---Reads the content in a header chunk of a midi file.
---@param stream file* A stream, pointing to the data part of a header chunk.
---@param callback function The feedback providing callback function.
---@param chunkLength integer The length of the chunk in bytes.
---@return integer format The format of the midi file (0, 1 or 2).
---@return integer tracks The total number of tracks in the midi file.
local function readHeader(stream, callback, chunkLength)
  local header = read(stream, chunkLength)
  assert(header and #header == 6, "incomplete or missing header")
  local format, tracks, division = (">I2I2I2"):unpack(header)
  callback("header", format, tracks, division)
  return format, tracks
end

---Reads only a single event from the midi stream.
---@param stream file* A stream, pointing to a midi event.
---@param callback function The callback function, reporting the midi event.
---@param runningStatus? integer A running status of a previous midi event.
---@return integer length, integer runningStatus Returns both read length and the updated running status.
local function processEvent(stream, callback, runningStatus)
  local firstByte = assert(stream:read(1), "missing event")
  local status = firstByte:byte()

  local length = 0

  if status < 0x80 then
    status = assert(runningStatus, "no running status")
  else
    firstByte = stream:read(1)
    length = 1
    runningStatus = status
  end


  if status >= 0x80 and status < 0xF0 then
    length = length + midiEvent[status & 0xF0](stream, callback, (status & 0x0F) + 1, firstByte)
  elseif status == 0xF0 then
    length = length + sysexEvent(stream, callback, firstByte)
  elseif status == 0xF2 then
    length = length + 2
  elseif status == 0xF3 then
    length = length + 1
  elseif status == 0xFF then
    length = length + metaEvent(stream, callback, firstByte)
  else
    callback("ignore", status)
  end

  return length, runningStatus
end

---Reads the content of a track chunk of a midi file.
---@param stream file* A stream, pointing to the data part of a track chunk.
---@param callback function The feedback providing callback function.
---@param chunkLength number The length of the chunk in bytes.
---@param track integer The one-based index of the track, used in the "track" callback.
local function readTrack(stream, callback, chunkLength, track)
  callback("track", track)

  local runningStatus

  while chunkLength > 0 do
    local ticks, vlqLength = readVLQ(stream)
    if ticks > 0 then
      callback("deltatime", ticks)
    end

    local readChunkLength
    readChunkLength, runningStatus = processEvent(stream, callback, runningStatus)
    chunkLength = chunkLength - readChunkLength - vlqLength
  end
end

---Processes a midi file by calling the provided callback for midi events.
---@param stream file* A stream, pointing to the start of a midi file.
---@param callback? function The callback function, reporting the midi events.
---@param onlyHeader? boolean Wether processing should stop after the header chunk.
---@param onlyTrack? integer If specified, only this single track (one-based) will be processed.
---@return integer tracks Returns the total number of tracks in the midi file.
local function process(stream, callback, onlyHeader, onlyTrack)
  callback = callback or function() end

  local format, tracks
  local track = 0
  while true do
    local chunkType, chunkLength = readChunkInfo(stream)

    if not chunkType then
      break
    end

    if chunkType == "MThd" then
      assert(not format, "only a single header chunk is allowed")
      format, tracks = readHeader(stream, callback, chunkLength)
      assert(tracks == 1 or format ~= 0, "midi format 0 can only contain a single track")
      assert(not onlyTrack or onlyTrack >= 1 and onlyTrack <= tracks, "track out of range")
      if onlyHeader then
        break
      end
    elseif chunkType == "MTrk" then
      track = track + 1

      assert(format, "no header chunk before the first track chunk")
      assert(track <= tracks, "found more tracks than specified in the header")
      assert(track == 1 or format ~= 0, "midi format 0 can only contain a single track")

      if not onlyTrack or track == onlyTrack then
        readTrack(stream, callback, chunkLength, track)
        if onlyTrack then
          break
        end
      else
        stream:seek("cur", chunkLength)
      end
    else
      local data = read(chunkLength)
      callback("unknownChunk", chunkType, data)
    end
  end

  if not onlyHeader and not onlyTrack then
    assert(track == tracks, "found less tracks than specified in the header")
  end

  return tracks
end

---Processes only the header chunk.
---@param stream file* A stream, pointing to the start of a midi file.
---@param callback function The callback function, reporting the midi events.
---@return integer tracks Returns the total number of tracks in the midi file.
local function processHeader(stream, callback)
  return process(stream, callback, true)
end

---Processes only the header chunk and a single, specified track.
---@param stream file* A stream, pointing to the start of a midi file.
---@param callback function The callback function, reporting the midi events.
---@param track integer The one-based track index to read.
---@return integer tracks Returns the total number of tracks in the midi file.
local function processTrack(stream, callback, track)
  return process(stream, callback, false, track)
end

MidiReader = {
  process = process,
  processHeader = processHeader,
  processTrack = processTrack,
  processEvent = processEvent
}