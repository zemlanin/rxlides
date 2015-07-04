import Rx from 'rx'
import omit from 'lodash.omit'
import {slideLogic, nextSlide, prevSlide, SLIDES_MAP} from './slides'
import {sendSlide, listenInputs} from './remote_io'

var metaPage = document.querySelector('meta[property=page]').content
slideLogic(metaPage)
if (metaPage !== 'index') {
  document.querySelector('nav .slide_name').textContent = 'slides/' + metaPage
}

sendSlide({name: metaPage}).subscribe()

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
  .merge(
    listenInputs().map(v => {
      var keyCode

      if (v === 'LEFT') { keyCode = LEFT }
      if (v === 'RIGHT') { keyCode = RIGHT }

      return {keyCode}
    })
  )
  .map(({keyCode, touch}) => {
    switch (keyCode) {
      case LEFT:
        return {page: prevSlide(metaPage), touch}
      case RIGHT:
        return {page: nextSlide(metaPage), touch}
      default:
        return
    }
  })
  .filter(v => v && v.page)
  .subscribe(({page, touch}) => location.href = page + (touch ? '#touch' : ''))
