import mapFilterFlatmap from './map_filter_flatmap.js'
import keyboardDemo from './keyboard_demo.js'
import singleSubscribe from './single_subscribe.js'
import singleCallback from './single_callback.js'

const slides = [
  'index',
  'ui',
  'single_callback',
  'microsoft_xhr',
  'callbacks_sync',
  'single_subscribe',
  'map_filter_flatmap',
  'keyboard_demo',
]

export var prevSlide = slide => {
  var slideIndex = slides.indexOf(slide)

  switch (slideIndex) {
    case -1:
    case 0:
      return
    case 1:
      return '../index.html'
    default:
      return `./${slides[slideIndex - 1]}.html`
  }
}

export var nextSlide = slide => {
  var slideIndex = slides.indexOf(slide)

  switch (slideIndex) {
    case -1:
    case slides.length - 1:
      return
    case 0:
      return `./slides/${slides[1]}.html`
    default:
      return `./${slides[slideIndex + 1]}.html`
  }
}

export var slideLogic = slide => {
  switch (slide) {
    case "map_filter_flatmap":
      mapFilterFlatmap()
      break;
    case "keyboard_demo":
      keyboardDemo()
      break;
    case "single_subscribe":
      singleSubscribe()
      break;
    case "single_callback":
      singleCallback()
      break;
  }
}
