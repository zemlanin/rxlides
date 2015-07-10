import Rx from 'rx'
import range from 'lodash.range'

import {getNavigationStream} from '../navigation'
import {KEYCODES} from '../remote_io'

const {Q, W, E, A, S, D} = KEYCODES
const keyIds = {
  [Q.key]: 'wasd_q',
  [W.key]: 'wasd_w',
  [E.key]: 'wasd_e',
  [A.key]: 'wasd_a',
  [S.key]: 'wasd_s',
  [D.key]: 'wasd_d',
}

function setActive(keyCode) {
  for (var keySpan of document.querySelectorAll('.wasd.active')) {
    keySpan.classList.remove('active')
  }

  if (keyCode) { document.getElementById(keyIds[keyCode]).classList.add('active') }
}

function emulateKeyboardEventWith(event) {
  return Object.keys(keyIds).reduce((previous, keyCode) => {
    previous.push(
      Rx.Observable.fromEvent(document.getElementById(keyIds[keyCode]), event)
        .map(parseInt(keyCode, 10))
    )
    return previous
  }, [])
}

export default () => {
  var emulatedKeydowns = Rx.Observable.merge.call(
    Rx.Observable, emulateKeyboardEventWith('mousedown')
  )
  var emulatedKeyups = Rx.Observable.merge.call(
    Rx.Observable, emulateKeyboardEventWith('mouseup')
  )
  var keydowns = Rx.Observable.fromEvent(document.body, 'keydown')
    .pluck('keyCode')
    .merge(emulatedKeydowns)
  var keyups = Rx.Observable.fromEvent(document.body, 'keyup')
    .pluck('keyCode')
    .merge(emulatedKeyups)

  var startStream = keydowns.filter(keyCode => keyCode === Q.key)
  var stopStream = keydowns.filter(keyCode => keyCode === E.key)

  startStream
    .map(q => keydowns
      .startWith(q)
      .takeUntil(stopStream)
    )
    .switch()
    .filter(keyCode => keyIds[keyCode])
    .subscribe(setActive)

  keyups
    .map(null)
    .subscribe(setActive)

  getNavigationStream(true)
    .subscribe(({acc, parts}) => {
      for (var index of range(1, parts + 1)) {
        document.getElementById('part_' + index).style.color = (!acc || acc === index) ? 'black' : 'gray'
      }
    })
}
