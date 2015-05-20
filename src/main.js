import Rx from 'rx'

import slides from './slides'
var metaPage = document.querySelector('meta[property=page]')
if (metaPage) { slides(metaPage.content) }

const [LEFT, UP, RIGHT, DOWN] = [37, 38, 39, 40]
Rx.Observable.fromEvent(document.body, 'keyup')
  .pluck('keyCode')
  .map(keyCode => {
    switch (keyCode) {
      case LEFT:
        return document.querySelector('meta[property=prev]')
      case RIGHT:
        return document.querySelector('meta[property=next]')
      default:
        return
    }
  })
  .filter(meta => meta)
  .subscribe(meta => location.href = meta.content)
