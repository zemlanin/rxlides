import Rx from 'rx'

import {wrapToDisplay, renderStream, accumutate} from '../vision'

export default () => {
  var clickStream = Rx.Observable
    .fromEvent(document.getElementById('star'), 'click')
    .map('{3:f}')

  var frameStream = Rx.Observable.create(observer => (function loop() {
    window.requestAnimationFrame(() => {
      observer.onNext([null, 2])
      loop()
    })
  })())

  var visualStream = clickStream
    .map(wrapToDisplay(document.querySelector('canvas').getContext("2d")))
    .merge(frameStream)
    .scan([], accumutate)
    .distinctUntilChanged()

  clickStream
    .flatMapLatest(
      Rx.Observable.timer(300)
        .map('remove')
        .startWith('add')
    )
    .subscribe(method => document.getElementById('star').classList[method]('clicked'))

  visualStream.subscribe(renderStream(document.querySelector('canvas')))
}
