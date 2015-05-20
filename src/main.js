import Rx from 'rx'
import _ from 'lodash-fp'

import {renderStream} from './vision'

var keyboardStream = Rx.Observable.fromEvent(document.body, 'keyup')
var cnvs = document.querySelector('canvas#main')
var ctx = cnvs.getContext("2d")

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

var canvasKeysMap = keyboardStream
  .pluck('keyCode')
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

var canvasKeysFilter = canvasKeysMap
  .map(_.filter(({text}) => text > 70))

var canvasKeysFlatmap = canvasKeysFilter
  .flatMap(v => Rx.Observable.timer(1000).map(v))

canvasKeys.subscribe(renderStream(document.querySelector('canvas#main')))
canvasKeysMap.subscribe(renderStream(document.querySelector('canvas#main_map')))
canvasKeysFilter.subscribe(renderStream(document.querySelector('canvas#main_filter')))
canvasKeysFlatmap.subscribe(renderStream(document.querySelector('canvas#main_request')))
