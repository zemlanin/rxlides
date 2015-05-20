import Rx from 'rx'
import _ from 'lodash-fp'

import {wrapToDisplay, renderStream, accumutate} from './vision'

var keyCodesStream = Rx.Observable
  .fromEvent(document.body, 'keyup')
  .pluck('keyCode')
  .filter(keyCode => keyCode === 32 || keyCode >= 65 && keyCode <= 90)

var cnvs = document.querySelector('canvas#main')
var ctx = cnvs.getContext("2d")

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
  .map(_.filter(({text}) => text > 70))

var canvasKeysFlatmap = canvasKeysFilter
  .flatMap(v => Rx.Observable.timer(1000).map(v))

canvasKeys.subscribe(renderStream(document.querySelector('canvas#main')))
canvasKeysMap.subscribe(renderStream(document.querySelector('canvas#main_map')))
canvasKeysFilter.subscribe(renderStream(document.querySelector('canvas#main_filter')))
canvasKeysFlatmap.subscribe(renderStream(document.querySelector('canvas#main_request')))
