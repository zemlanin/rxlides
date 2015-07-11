import Rx from 'rx'

import {wrapToDisplay, renderStream, accumutate} from '../vision'
import {listenInputs, KEYCODES} from '../remote_io'

export default () => {
  var favsStream = Rx.Observable.merge(
    Rx.Observable.fromEvent(document.getElementById('set_1'), 'click')
      .merge(listenInputs().filter(v => v === KEYCODES._0.name))
      .map('1'),
    Rx.Observable.fromEvent(document.getElementById('set_1_3'), 'click')
      .merge(listenInputs().filter(v => v === KEYCODES._1.name))
      .map('1,3'),
    Rx.Observable.fromEvent(document.getElementById('set_1_3_4'), 'click')
      .merge(listenInputs().filter(v => v === KEYCODES._2.name))
      .map('1,3,4'),
    Rx.Observable.fromEvent(document.getElementById('set_1_4'), 'click')
      .merge(listenInputs().filter(v => v === KEYCODES._3.name))
      .map('1,4')
  )

  var frameStream = Rx.Observable.create(observer => (function loop() {
    window.requestAnimationFrame(() => {
      observer.onNext([null, 1.3])
      loop()
    })
  })())

  var canvasFavsStream = favsStream
    .map(wrapToDisplay(document.querySelector('canvas').getContext("2d")))
    .merge(frameStream)
    .scan([], accumutate)
    .distinctUntilChanged()

  var canvasSingleStream = favsStream
    .map(favs => favs === '1,3' || favs === '1,3,4')
    .map(wrapToDisplay(document.querySelector('canvas').getContext("2d")))
    .merge(frameStream)
    .scan([], accumutate)
    .distinctUntilChanged()

  var canvasCountStream = favsStream
    .map(favs => favs.split(',').length)
    .map(wrapToDisplay(document.querySelector('canvas').getContext("2d")))
    .merge(frameStream)
    .scan([], accumutate)
    .distinctUntilChanged()

  canvasFavsStream.subscribe(renderStream(document.querySelector('canvas#favsStream')))
  canvasSingleStream.subscribe(renderStream(document.querySelector('canvas#singleStream')))
  canvasCountStream.subscribe(renderStream(document.querySelector('canvas#countStream')))
}
