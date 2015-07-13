import Rx from 'rx'
import {slideLogic, nextSlide, prevSlide} from './slides'
import {sendSlide, listenInputs, KEYCODES} from './remote_io'

var metaPage = document.querySelector('meta[property=page]').content
slideLogic(metaPage)
if (metaPage !== 'index') {
  document.querySelector('nav .slide_name').textContent = metaPage
} else {
  document.querySelector('nav #presentation_id').textContent = '#' + localStorage.getItem('presentationId')
}

sendSlide({name: metaPage}).subscribe()

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
        if (touch.clientX < document.body.clientWidth / 4) { keyCode = KEYCODES.LEFT.key }
        if (touch.clientX > 3 * document.body.clientWidth / 4) { keyCode = KEYCODES.RIGHT.key }

        return {keyCode, touch: true}
      })
  )
  .merge(
    listenInputs()
    .filter(v => v === KEYCODES.LEFT.name || v === KEYCODES.RIGHT.name)
    .map(v => {
      var keyCode

      if (v === 'LEFT') { keyCode = KEYCODES.LEFT.key }
      if (v === 'RIGHT') { keyCode = KEYCODES.RIGHT.key }

      return {keyCode}
    })
  )
  .map(({keyCode, touch}) => {
    switch (keyCode) {
      case KEYCODES.LEFT.key:
        return {page: prevSlide(metaPage), touch}
      case KEYCODES.RIGHT.key:
        return {page: nextSlide(metaPage), touch}
      default:
        return {}
    }
  })
  .filter(v => v && v.page)
  .subscribe(({page, touch}) => location.href = page + (touch ? '#touch' : ''))
