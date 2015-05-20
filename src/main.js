import Rx from 'rx'
import _ from 'lodash-fp'

var keyboardStream = Rx.Observable.fromEvent(document.body, 'keypress')
var cnvs = document.querySelector('canvas')
var ctx = cnvs.getContext("2d")
ctx.font = '20px monospace'

var frameStream = Rx.Observable.create(observer => (function loop() {
  window.requestAnimationFrame(() => {
    observer.onNext()
    loop()
  })
})())

keyboardStream
  .pluck('keyCode')
  .map(keyCode => `[${String.fromCharCode(keyCode)}]`)
  .map(text => [{text, position: ctx.measureText(text).width}, 0])
  .merge(frameStream.map([null, 1]))
  .scan([], (acc, [value, shift]) => {
    if (value) {
      acc = [value, ...acc]
    }

    return _.flow(
      _.map(({text, position}) => ({text, position: position+shift})),
      _.filter(({position}) => position <= cnvs.width + 30)
    )(acc)
  })
  .map(_.map(({text, position}) => ({text, position: -position})))
  .distinctUntilChanged()
  .subscribe(keys => {
    ctx.clearRect(0, 0, cnvs.width, cnvs.height)

    for (var {text, position} of keys) {
      ctx.fillStyle = "#000000"
      ctx.fillText(text, position > 0 ? position : cnvs.width + position, cnvs.height - 10)
    }
  })
