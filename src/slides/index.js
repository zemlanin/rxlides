import Rx from 'rx'
import zipObject from 'lodash.zipobject'

import mapFilterFlatmap from './map_filter_flatmap.js'
import keyboardDemo from './keyboard_demo.js'
import intervalDemo from './interval_demo.js'
import singleSubscribe from './single_subscribe.js'
import singleCallback from './single_callback.js'
import callbacksChain from './callbacks_chain.js'
import promisesCons from './promises_cons.js'
import programmableStream from './programmable_stream.js'
import gifflixDemo from './gifflix_demo.js'
import componentsCommunication from './components_communication.js'
import summary from './summary.js'

const puns = [
  'Tyrannosaurus Rx',
  'Rx-xar, the Hunter',
  'Rxless',
  'Rx and Morty',
]

var indexLogic = () => {
  Rx.Observable.interval(1000)
    .zip(
      Rx.Observable.from(puns),
      (m, pun) => pun
    )
    .take(puns.length)
    .repeat()
    .subscribe(pun => document.getElementsByTagName('h1')[0].textContent = pun )
}

const slides = [
  {
    name: 'index',
    logic: indexLogic,
  },
  {
    name: 'ui',
    logic: null,
  },
  {
    name: 'single_callback',
    logic: singleCallback,
  },
  {
    name: 'microsoft_xhr',
    logic: null,
  },
  {
    name: 'callbacks_sync',
    logic: null,
  },
  {
    name: 'callbacks_chain',
    logic: callbacksChain,
  },
  {
    name: 'promises',
    logic: null,
  },
  {
    name: 'promises_chain',
    logic: null,
  },
  {
    name: 'promises_cons',
    logic: promisesCons,
  },
  {
    name: 'microsoft_go4',
    logic: null,
  },
  {
    name: 'single_subscribe',
    logic: singleSubscribe,
  },
  {
    name: 'map_filter_flatmap',
    logic: mapFilterFlatmap,
  },
  {
    name: 'interval_demo',
    logic: intervalDemo,
  },
  {
    name: 'keyboard_demo',
    logic: keyboardDemo,
  },
  {
    name: 'programmable_stream',
    logic: programmableStream,
  },
  {
    name: 'gifflix_demo',
    logic: gifflixDemo,
  },
  {
    name: 'components_communication',
    logic: componentsCommunication,
  },
  {
    name: 'summary',
    logic: summary,
  },
  {
    name: 'links',
    logic: null,
  },
]

export var prevSlide = slide => {
  var slidesName = slides.map(s => s.name)
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
  var slidesName = slides.map(s => s.name)
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

export var slideLogic = slideName => {
  var slide = slides.find(s => s.name == slideName)
  if (slide && slide.logic) { slide.logic() }
}
