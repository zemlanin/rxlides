import Rx from 'rx'
import _ from 'lodash-fp'

var keyboardStream = Rx.Observable.fromEvent(document.body, 'keypress')
var cnvs = document.querySelector('canvas')

keyboardStream
  .pluck('keyCode')
  .map(keyCode => `[${String.fromCharCode(keyCode)}]`)
  .map(text => [{text, position: 0}, 0])
  .merge(Rx.Observable.interval(15).map([null, 1]))
  .scan([], (acc, [value, shift]) => {
    if (value) {
      acc = [value, ...acc]
    }

    return _.flow(
      _.map(({text, position}) => ({text, position: position+shift})),
      _.filter(({position}) => position <= cnvs.width + 30)
    )(acc)
  })
  .distinctUntilChanged()
  .subscribe(keys => {
    var ctx = cnvs.getContext("2d")
    ctx.font = '20px monospace'
    ctx.clearRect(0, 0, cnvs.width, cnvs.height)

    for (var {text, position} of keys) {
      ctx.fillStyle = "#000000"
      ctx.fillText(text, cnvs.width - position, cnvs.height - 10)
    }
  })
