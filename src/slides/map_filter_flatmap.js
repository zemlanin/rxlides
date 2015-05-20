import Rx from 'rx'

import {wrapToDisplay, renderStream, accumutate} from '../vision'

const [UP, DOWN] = [38, 40]

export default () => {
  var keyCodesStream = Rx.Observable
    .fromEvent(document.body, 'keyup')
    .pluck('keyCode')
    .filter(keyCode => keyCode === 32 || keyCode >= 65 && keyCode <= 90)

  var ctx = document.querySelector('#main canvas').getContext("2d")

  var frameStream = Rx.Observable.create(observer => (function loop() {
    window.requestAnimationFrame(() => {
      observer.onNext([null, 1])
      loop()
    })
  })())

  var canvasKeys = keyCodesStream
    .map(keyCode => `[${String.fromCharCode(keyCode)}]`)
    .map(wrapToDisplay(ctx))
    .merge(frameStream)
    .scan([], accumutate)
    .distinctUntilChanged()

  var canvasKeysMap = keyCodesStream
    .map(wrapToDisplay(ctx))
    .merge(frameStream)
    .scan([], accumutate)
    .distinctUntilChanged()

  var canvasKeysFilter = canvasKeysMap
    .map(keys => keys.filter(({text}) => text > 70))

  var canvasKeysFlatmap = canvasKeysFilter
    .map(keys => keys.map(({text, position, mirror}) => ({text: 'pong', position: position-100, mirror})))

  canvasKeys.subscribe(renderStream(document.querySelector('#main canvas')))
  canvasKeysMap.subscribe(renderStream(document.querySelector('#main_map canvas')))
  canvasKeysFilter.subscribe(renderStream(document.querySelector('#main_filter canvas')))
  canvasKeysFlatmap.subscribe(renderStream(document.querySelector('#main_request canvas')))

  Rx.Observable.fromEvent(document.body, 'keyup')
    .pluck('keyCode')
    .filter(keyCode => keyCode === UP || keyCode === DOWN)
    .map(keyCode => keyCode - 39) // UP = -1, DOWN = +1
    .scan(0, (acc, move) => {
      if (acc + move < 0 || acc + move > 3) { return acc }
      return acc + move
    })
    .subscribe(acc => {
      for (var [index, sel] of ['#main_map', '#main_filter', '#main_request'].entries()) {
        document.querySelector(sel).hidden = acc <= index
      }
    })
}
