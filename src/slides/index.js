import zipObject from 'lodash.zipobject'

import mapFilterFlatmap from './map_filter_flatmap.js'
import keyboardDemo from './keyboard_demo.js'
import singleSubscribe from './single_subscribe.js'
import singleCallback from './single_callback.js'
import promisesCons from './promises_cons.js'

const slides = [
  ['index', null],
  ['ui', null],
  ['single_callback', singleCallback],
  ['microsoft_xhr', null],
  ['callbacks_sync', null],
  ['callbacks_chain', null],
  ['promises', null],
  ['promises_chain', null],
  ['promises_cons', promisesCons],
  ['microsoft_go4', null],
  ['single_subscribe', singleSubscribe],
  ['map_filter_flatmap', mapFilterFlatmap],
  ['keyboard_demo', keyboardDemo],
]

export var prevSlide = slide => {
  var slidesName = slides.map(s => s[0])
  var slideIndex = slidesName.indexOf(slide)

  switch (slideIndex) {
    case -1:
    case 0:
      return
    case 1:
      return '../index.html'
    default:
      return `./${slidesName[slideIndex - 1]}.html`
  }
}

export var nextSlide = slide => {
  var slidesName = slides.map(s => s[0])
  var slideIndex = slidesName.indexOf(slide)

  switch (slideIndex) {
    case -1:
    case slidesName.length - 1:
      return
    case 0:
      return `./slides/${slidesName[1]}.html`
    default:
      return `./${slidesName[slideIndex + 1]}.html`
  }
}

export var slideLogic = slide => {
  var logic = zipObject(slides)[slide]
  if (logic) { logic() }
}
