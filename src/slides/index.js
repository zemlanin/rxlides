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
  'Commissar Rx',
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

export const KEYCODES = {
  LEFT: {key: 37, name: 'LEFT'},
  UP: {key: 38, name: 'UP'},
  RIGHT: {key: 39, name: 'RIGHT'},
  DOWN: {key: 40, name: 'DOWN'},
  Q: {key: 81, name: 'Q'},
  W: {key: 87, name: 'W'},
  E: {key: 69, name: 'E'},
  A: {key: 65, name: 'A'},
  S: {key: 83, name: 'S'},
  D: {key: 68, name: 'D'},
  _0: {key: 48, name: '_0'},
  _1: {key: 49, name: '_1'},
  _2: {key: 50, name: '_2'},
  _3: {key: 51, name: '_3'},
  _4: {key: 52, name: '_4'},
}

export const MOUSE = {
  CLICK: {mouse: 'click', name: 'click'},
}

export const SLIDES = [
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
    actions: [
      MOUSE.CLICK,
    ],
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
    actions: [
      MOUSE.CLICK,
    ],
  },
  {
    name: 'microsoft_go4',
    logic: null,
  },
  {
    name: 'single_subscribe',
    logic: singleSubscribe,
    actions: [
      MOUSE.CLICK,
    ],
  },
  {
    name: 'map_filter_flatmap',
    logic: mapFilterFlatmap,
    actions: [
      KEYCODES.Q,
      KEYCODES.W,
      KEYCODES.E,
      KEYCODES.A,
      KEYCODES.S,
      KEYCODES.D,
    ],
  },
  {
    name: 'interval_demo',
    logic: intervalDemo,
    actions: [
      KEYCODES.Q,
      KEYCODES.W,
      KEYCODES.E,
    ],
  },
  {
    name: 'keyboard_demo',
    logic: keyboardDemo,
    actions: [
      KEYCODES.Q,
      KEYCODES.W,
      KEYCODES.E,
      KEYCODES.A,
      KEYCODES.S,
      KEYCODES.D,
    ],
  },
  {
    name: 'programmable_stream',
    logic: programmableStream,
  },
  {
    name: 'gifflix_demo',
    logic: gifflixDemo,
    actions: [
      KEYCODES._0,
      KEYCODES._1,
      KEYCODES._2,
      KEYCODES._3,
      KEYCODES._4,
    ],
  },
  {
    name: 'components_communication',
    logic: componentsCommunication,
    actions: [
      KEYCODES._0,
      KEYCODES._1,
      KEYCODES._2,
      KEYCODES._3,
      KEYCODES._4,
    ],
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
  var slidesName = SLIDES.map(s => s.name)
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
  var slidesName = SLIDES.map(s => s.name)
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
  var slide = SLIDES.find(s => s.name == slideName)
  if (slide && slide.logic) { slide.logic() }
}
