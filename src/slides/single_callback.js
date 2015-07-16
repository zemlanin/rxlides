import Rx from 'rx'

import {wrapToDisplay, renderStream, accumutate} from '../vision'
import {listenInputs, MOUSE} from '../remote_io'

export default () => {
  var frameStream = Rx.Observable.create(observer => (function loop() {
    window.requestAnimationFrame(() => {
      observer.onNext([null, 1.5])
      loop()
    })
  })())

  var clickStream = Rx.Observable.fromEvent(document, 'click')
    .merge(listenInputs().filter(v => v === MOUSE.CLICK.name))
    .map('↖')

  var visualStream = clickStream
    .map(wrapToDisplay(document.querySelector('canvas').getContext("2d")))
    .merge(frameStream)
    .scan([], accumutate)
    .distinctUntilChanged()

  visualStream.subscribe(renderStream(document.querySelector('canvas')))
  clickStream
    .flatMap(text => Rx.Observable.of({text: 'e', color: ''}).delay(700).startWith({text, color: '#00A500'}))
    .subscribe(({text, color}) => {
      document.getElementById('subscribe_arg').textContent = text
      document.getElementById('subscribe_arg').style.color = color
    })
}
