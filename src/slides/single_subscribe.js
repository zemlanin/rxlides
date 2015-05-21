import Rx from 'rx'

import {wrapToDisplay, renderStream, accumutate} from '../vision'

export default () => {
  var keyCodesStream = Rx.Observable
    .fromEvent(document.body, 'keyup')
    .pluck('keyCode')
    .filter(keyCode => keyCode === 32 || keyCode >= 65 && keyCode <= 90)

  var frameStream = Rx.Observable.create(observer => (function loop() {
    window.requestAnimationFrame(() => {
      observer.onNext([null, 1])
      loop()
    })
  })())

  var canvasKeys = keyCodesStream
    .map(keyCode => `[${String.fromCharCode(keyCode)}]`)

  var visualStream = canvasKeys
    .map(wrapToDisplay(document.querySelector('canvas').getContext("2d")))
    .merge(frameStream)
    .scan([], accumutate)
    .distinctUntilChanged()

  visualStream.subscribe(renderStream(document.querySelector('canvas')))
  canvasKeys
    .flatMap(text => Rx.Observable.of({text: ' e ', color: ''}).delay(700).startWith({text, color: '#00A500'}))
    .subscribe(({text, color}) => {
      document.getElementById('subscribe_arg').textContent = text
      document.getElementById('subscribe_arg').style.color = color
    })
}
