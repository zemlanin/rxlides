import Rx from 'rx'
import range from 'lodash.range'

import {getNavigationStream} from '../navigation'
import {wrapToDisplay, renderStream, accumutate} from '../vision'
import {listenInputs, KEYCODES} from '../remote_io'

export default () => {
  var singleFavUpdates = Rx.Observable.merge(
    Rx.Observable.fromEvent(document.getElementById('add_1'), 'click')
      .merge(listenInputs().filter(v => v === KEYCODES._0.name))
      .map('1:t'),
    Rx.Observable.fromEvent(document.getElementById('remove_1'), 'click')
      .merge(listenInputs().filter(v => v === KEYCODES._1.name))
      .map('1:f'),
    Rx.Observable.fromEvent(document.getElementById('add_2'), 'click')
      .merge(listenInputs().filter(v => v === KEYCODES._2.name))
      .map('2:t'),
    Rx.Observable.fromEvent(document.getElementById('remove_2'), 'click')
      .merge(listenInputs().filter(v => v === KEYCODES._3.name))
      .map('2:f')
  )

  var frameStream = Rx.Observable.create(observer => (function loop() {
    window.requestAnimationFrame(() => {
      observer.onNext([null, 1.7])
      loop()
    })
  })())

  var canvasSingleFavUpdates = singleFavUpdates
    .map(wrapToDisplay(document.querySelector('canvas').getContext("2d")))
    .merge(frameStream)
    .scan([], accumutate)
    .distinctUntilChanged()

  var canvasScanned = singleFavUpdates
    .map(fav => fav.split(':'))
    .map(([id, a]) => ({id, active: a === 't'}))
    .scan(new Set(), (acc, v) => {
      if (v.active) {
        acc.add(v.id)
      } else {
        acc.delete(v.id)
      }
      return acc
    })
    .map(acc => `{${[...acc]}}`)
    .map(wrapToDisplay(document.querySelector('canvas').getContext("2d")))
    .merge(frameStream)
    .scan([], accumutate)
    .distinctUntilChanged()

  var canvasMapped = singleFavUpdates
    .map('[v]')
    .map(wrapToDisplay(document.querySelector('canvas').getContext("2d")))
    .merge(frameStream)
    .scan([], accumutate)
    .distinctUntilChanged()

  canvasSingleFavUpdates.subscribe(renderStream(document.querySelector('canvas#plucked')))
  canvasScanned.subscribe(renderStream(document.querySelector('canvas#scanned')))
  canvasMapped.subscribe(renderStream(document.querySelector('canvas#mapped')))

  getNavigationStream(true)
    .subscribe(({acc, parts}) => {
      for (var index of range(1, parts + 1)) {
        document.getElementById('part_' + index).style.color = (!acc || acc === index) ? 'black' : 'gray'
      }
    })
}
