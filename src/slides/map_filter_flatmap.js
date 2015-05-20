import Rx from 'rx'
import range from 'lodash.range'

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

  ctx.font = document.body.style.font
  var pongWidth = ctx.measureText('pong').width
  var canvasKeysFlatmap = canvasKeysFilter
    // delay pongs without jitter
    .map(keys => keys.map(({text, position, mirror}) => ({text: 'pong', position: position-0, mirror})))
    // appear instead of moving in
    .map(keys => keys.filter(({position}) => position > pongWidth))

  canvasKeys.subscribe(renderStream(document.querySelector('#main canvas')))
  canvasKeysMap.subscribe(renderStream(document.querySelector('#part_0 canvas')))
  canvasKeysFilter.subscribe(renderStream(document.querySelector('#part_1 canvas')))
  canvasKeysFlatmap.subscribe(renderStream(document.querySelector('#part_2 canvas')))

  var parts = document.querySelectorAll('[id^=part_]').length

  Rx.Observable.fromEvent(document.body, 'keyup')
    .pluck('keyCode')
    .filter(keyCode => keyCode === UP || keyCode === DOWN)
    .map(keyCode => keyCode - 39) // UP = -1, DOWN = +1
    .scan(0, (acc, move) => {
      if (acc + move < 0 || acc + move > parts) { return acc }
      return acc + move
    })
    .subscribe(acc => {
      for (var index of range(parts)) {
        document.getElementById('part_'+index).hidden = acc <= index
      }
    })
}
