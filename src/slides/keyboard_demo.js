import Rx from 'rx'
import range from 'lodash.range'

import {getNavigationStream} from '../navigation'
import {listenInputs, KEYCODES} from '../remote_io'

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

function setRemotePress(keyCode) {
  for (var keySpan of document.querySelectorAll('.wasd.remote-press')) {
    keySpan.classList.remove('remote-press')
  }

  if (keyCode) { document.getElementById(keyIds[keyCode]).classList.add('remote-press') }
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

  var remoteKeydowns = listenInputs()
    .filter(v => KEYCODES[v])
    .map(v => KEYCODES[v].key)
  var remoteKeyups = remoteKeydowns.delay(500)

  var keydowns = Rx.Observable.fromEvent(document.body, 'keydown')
    .pluck('keyCode')
    .merge(emulatedKeydowns)
    .merge(remoteKeydowns)
  var keyups = Rx.Observable.fromEvent(document.body, 'keyup')
    .pluck('keyCode')
    .merge(emulatedKeyups)
    .merge(remoteKeyups)

  remoteKeydowns
    .merge(remoteKeyups.map(null))
    .subscribe(setRemotePress)

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
