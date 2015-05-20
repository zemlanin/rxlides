import Rx from 'rx'
import _ from 'lodash-fp'

var keyboardStream = Rx.Observable.fromEvent(document.body, 'keyup')
var cnvs = document.querySelector('canvas#main')
var ctx = cnvs.getContext("2d")
ctx.font = '20px monospace'

var frameStream = Rx.Observable.create(observer => (function loop() {
  window.requestAnimationFrame(() => {
    observer.onNext()
    loop()
  })
})())

var canvasKeys = keyboardStream
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

canvasKeys
  .subscribe(keys => {
    ctx.clearRect(0, 0, cnvs.width, cnvs.height)

    for (var {text, position} of keys) {
      ctx.fillStyle = "#000000"
      ctx.fillText(text, position > 0 ? position : cnvs.width + position, cnvs.height - 5)
    }
  })


var cnvsMap = document.querySelector('canvas#main_map')
var ctxMap = cnvsMap.getContext("2d")
ctxMap.font = '20px monospace'

var canvasKeysMap = keyboardStream
  .pluck('keyCode')
  .map(text => [{text, position: ctxMap.measureText(text).width}, 0])
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

canvasKeysMap
  .subscribe(keys => {
    ctxMap.clearRect(0, 0, cnvsMap.width, cnvsMap.height)

    for (var {text, position} of keys) {
      ctxMap.fillStyle = "#000000"
      ctxMap.fillText(text, position > 0 ? position : cnvsMap.width + position, cnvsMap.height - 5)
    }
  })


var cnvsFilter = document.querySelector('canvas#main_filter')
var ctxFilter = cnvsFilter.getContext("2d")
ctxFilter.font = '20px monospace'
var canvasKeysFilter = canvasKeysMap
  .map(_.filter(({text}) => text > 70))

canvasKeysFilter
  .subscribe(keys => {
    ctxFilter.clearRect(0, 0, cnvsFilter.width, cnvsFilter.height)

    for (var {text, position} of keys) {
      ctxFilter.fillStyle = "#000000"
      ctxFilter.fillText(text, position > 0 ? position : cnvsFilter.width + position, cnvsFilter.height - 5)
    }
  })

var cnvsRequest = document.querySelector('canvas#main_request')
var ctxRequest = cnvsRequest.getContext("2d")
ctxRequest.font = '20px monospace'
canvasKeysFilter
  .flatMap(v => Rx.Observable.timer(1000).map(v))
  .subscribe(keys => {
    ctxRequest.clearRect(0, 0, cnvsRequest.width, cnvsRequest.height)

    for (var {text, position} of keys) {
      ctxRequest.fillStyle = "#000000"
      ctxRequest.fillText(text, position > 0 ? position : cnvsRequest.width + position, cnvsRequest.height - 5)
    }
  })
