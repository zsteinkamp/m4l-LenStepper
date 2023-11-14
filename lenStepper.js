autowatch = 1
outlets = 1

var debugLog = false

function debug() {
  if (debugLog) {
    post(
      debug.caller ? debug.caller.name : 'ROOT',
      Array.prototype.slice.call(arguments).join(' '),
      '\n'
    )
  }
}

debug('RELOADED')

var numSteps = 8
var currStep = 1
var noteLen = 1
var divMs = 250
var noteNum = 63
var noteVel = 100
var globalEnable = false
var endNoteTask = null
var nextNoteTask = null

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
    //debug('IN_END', num, 0)
    arguments.callee.task.cancel()
    arguments.callee.task.freepeer()
    endNoteTask = null
    sendNote(num, 0)
  }
}

function scheduleNextNote() {
  return function () {
    //debug('IN_NEXT')
    arguments.callee.task.cancel()
    arguments.callee.task.freepeer()
    endNoteTask = null
    goNext()
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
    //debug('TOGGLE TO', enable)
    cancelTasks()
    //debug('CANCELED')
    globalEnable = enable
    sendSeq(globalEnable ? 1 : 0)
    //debug('SENT SEQ')
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

function cancelTasks() {
  if (endNoteTask) {
    endNoteTask.execute()
    endNoteTask = null
  }
  if (nextNoteTask) {
    nextNoteTask.cancel()
    nextNoteTask = null
  }
}

function fromSeq(step, divisions) {
  //debug(globalEnable, step, divisions)
  if (!globalEnable) {
    return
  }
  currStep = step
  var noteGap = divisions * divMs

  //debug('GAP DIVS DIVMS', noteGap, divisions, divMs)
  cancelTasks()

  sendNote(noteNum, noteVel)
  endNoteTask = new Task(scheduleEndNote(noteNum), this)
  endNoteTask.schedule(noteGap * noteLen - 8)
  nextNoteTask = new Task(scheduleNextNote(), this)
  nextNoteTask.schedule(noteGap - 4)
}

function sendSeq(msg) {
  //debug(msg)
  outlet(0, ['seq', msg])
}

function sendNote(num, vel) {
  //debug('sendNote', num, vel)
  outlet(0, ['note', num, vel])
}
