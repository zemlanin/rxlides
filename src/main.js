import Rx from 'rx'
import slides from './slides'

import 'babel/polyfill'

var metaPage = document.querySelector('meta[property=page]')
if (metaPage) { slides(metaPage.content) }

const [LEFT, UP, RIGHT, DOWN] = [37, 38, 39, 40]
Rx.Observable.fromEvent(document.body, 'keyup')
  .map(e => ({keyCode: e.keyCode, touch: false}))
  .merge(
    Rx.Observable.fromEvent(document, 'touchstart')
      .map(e => e.touches[0])
      .flatMap(touch => Rx.Observable.fromEvent(document, 'touchend')
        .takeUntil(Rx.Observable.fromEvent(document, 'touchmove'))
        .take(1)
        .map(touch)
      )
      .map(touch => {
        var keyCode
        if (touch.clientX < document.body.clientWidth / 4) { keyCode = LEFT }
        if (touch.clientX > 3 * document.body.clientWidth / 4) { keyCode = RIGHT }

        return {keyCode, touch: true}
      })
  )
  .map(({keyCode, touch}) => {
    switch (keyCode) {
      case LEFT:
        return {meta: document.querySelector('meta[property=prev]'), touch}
      case RIGHT:
        return {meta: document.querySelector('meta[property=next]'), touch}
      default:
        return
    }
  })
  .filter(v => v && v.meta)
  .subscribe(({meta, touch}) => location.href = meta.content + (touch ? '#touch' : ''))
