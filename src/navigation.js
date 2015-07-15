import Rx from 'rx'
import {listenInputs, KEYCODES} from './remote_io'

const partsSelector = '[id^=part_]'

export function getNavigationStream(cycle) {
  if (document.querySelector(partsSelector)) { document.getElementById('nav_d').innerHTML = '&darr;' }

  return Rx.Observable.fromEvent(document.body, 'keyup')
    .pluck('keyCode')
    .merge(listenInputs()
      .filter(v => KEYCODES[v])
      .map(v => KEYCODES[v].key)
    )
    .filter(keyCode => keyCode === KEYCODES.UP.key || keyCode === KEYCODES.DOWN.key)
    .map(keyCode => keyCode - 39) // UP = -1, DOWN = +1
    .scan(0, (acc, move) => {
      var newAcc = acc + move

      if (newAcc < 0 || newAcc > document.querySelectorAll(partsSelector).length) {
        newAcc = cycle ? 0 : acc
      }
      return newAcc
    })
    .map(acc => ({acc, parts: document.querySelectorAll(partsSelector).length}))
    .do(({acc, parts}) => {
      document.getElementById('nav_u').innerHTML = acc ? '&uarr;' : '&nbsp;'
      if (!cycle) { document.getElementById('nav_d').innerHTML = acc < parts ? '&darr;' : '&nbsp;' }
    })
    .share()
}
