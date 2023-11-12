autowatch = 1
outlets = 1

var debugLog = true

function debug() {
  if (debugLog) {
    post(
      debug.caller ? debug.caller.name : 'ROOT',
      Array.prototype.slice.call(arguments).join(' '),
      '\n'
    )
  }
}

var numSteps = 8
var currStep = 1
var noteLen = 1
var divMs = 250
var noteNum = 63
var noteVel = 100
var globalEnable = false

function setNoteLen(lenPct) {
  //debug(len)
  noteLen = lenPct / 100
}

function setNumSteps(steps) {
  //debug(steps)
  numSteps = steps
}

// utility to return a function that will be used to create a note-playing task
function scheduleEndNote(num) {
  return function () {
    //debug(num, 0)
    sendNote(num, 0)
    arguments.callee.task.freepeer()
  }
}

function scheduleNextNote() {
  return function () {
    goNext()
    arguments.callee.task.freepeer()
  }
}

function setDivMs(ms) {
  //debug(ms)
  divMs = ms
}

function noteIn(num, vel) {
  //debug(num, vel)
  noteNum = num
  noteVel = vel
  var enable = !!(vel > 0)
  if (enable !== globalEnable) {
    globalEnable = enable
    sendSeq(globalEnable ? 1 : 0)
  }
}

function goNext() {
  if (!globalEnable) {
    return
  }
  var nextStep = (currStep % numSteps) + 1
  //debug(currStep, numSteps, nextStep)
  sendSeq(nextStep)
}

function fromSeq(step, divisions) {
  if (!globalEnable) {
    return
  }
  //debug(step, divisions)
  currStep = step
  sendNote(noteNum, noteVel)
  //debug('DIVms', divisions * divMs)
  var a = new Task(scheduleEndNote(noteNum), this)
  a.schedule(divisions * divMs * noteLen)
  var b = new Task(scheduleNextNote(), this)
  b.schedule(divisions * divMs)
}

function sendSeq(msg) {
  //debug(msg)
  outlet(0, ['seq', msg])
}

function sendNote(num, vel) {
  //debug('sendNote', num, vel)
  outlet(0, ['note', num, vel])
}
