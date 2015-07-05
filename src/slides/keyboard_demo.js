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

export default () => {
  var keys = Rx.Observable.fromEvent(document.body, 'keydown').pluck('keyCode')
  var startStream = keys.filter(keyCode => keyCode === Q.key)
  var stopStream = keys.filter(keyCode => keyCode === E.key)

  Rx.Observable.fromEvent(document.body, 'keyup').map(null).subscribe(setActive)
  startStream
    .map(q => keys
      .startWith(q)
      .takeUntil(stopStream)
    )
    .switch()
    .filter(keyCode => keyIds[keyCode])
    .subscribe(setActive)

  getNavigationStream(true)
    .subscribe(({acc, parts}) => {
      for (var index of range(1, parts + 1)) {
        document.getElementById('part_' + index).style.color = (!acc || acc === index) ? 'black' : 'gray'
      }
    })
}
