import Rx from 'rx'

import mapFilterFlatmap from './map_filter_flatmap.js'
import keyboardDemo from './keyboard_demo.js'
import intervalDemo from './interval_demo.js'
import singleSubscribe from './single_subscribe.js'
import singleCallback from './single_callback.js'
import callbacksChain from './callbacks_chain.js'
import promisesCons from './promises_cons.js'
import programmableStream from './programmable_stream.js'
import gifflixDemo from './gifflix_demo.js'
import gifflixClicker from './gifflix_clicker.js'
import gifflixScanner from './gifflix_scanner.js'
import gifflixFavsStream from './gifflix_favsStream.js'
import componentsCommunication from './components_communication.js'
import summary from './summary.js'

import {KEYCODES, MOUSE} from '../remote_io.js'

const PUNS = [
  'Tyrannosaurus Rx',
  'Rx-xar, the Hunter',
  'Commissar Rx',
  'Rxless',
  'Rx and Morty',
]

const GIFS = [
  '0_200w.gif',
  '1_200w.gif',
  '2_200w.gif',
  '3_200w.gif',
  '4_200w.gif',
  '0_200w_s.gif',
  '1_200w_s.gif',
  '2_200w_s.gif',
  '3_200w_s.gif',
  '4_200w_s.gif',
  'everything_burrito.gif',
  'not_true.gif',
]

function indexLogic() {
  Rx.Observable.interval(1000)
    .zip(
      Rx.Observable.from(PUNS),
      (m, pun) => pun
    )
    .take(PUNS.length)
    .repeat()
    .subscribe(pun => document.getElementsByTagName('h1')[0].textContent = pun )

  Rx.Observable.from(GIFS)
    .flatMap(gif => Rx.Observable.create(obs => {
      var img = new Image()
      img.src = './gifs/' + gif
      img.onload = e => obs.onNext(gif)
    }))
    .scan(100, (acc, v) => acc - (100 / GIFS.length))
    .subscribe(progress => document.getElementById('progress').style.width = progress + 'vw')
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
    name: 'not_true',
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
    name: 'mvwtf',
    logic: null,
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
    name: 'gifflix_clicker',
    logic: gifflixClicker,
    actions: [
      MOUSE.CLICK,
    ],
  },
  {
    name: 'gifflix_scanner',
    logic: gifflixScanner,
    actions: [
      KEYCODES._0,
      KEYCODES._1,
    ],
  },
  {
    name: 'gifflix_favsStream',
    logic: gifflixFavsStream,
    actions: [
      KEYCODES._0,
      KEYCODES._1,
      KEYCODES._2,
      KEYCODES._3,
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

export const SLIDES_MAP = (() => {
  var slidesMap = {}
  for (var i = 0; i < SLIDES.length; i++) {
    slidesMap[SLIDES[i].name] = SLIDES[i]
  }

  return slidesMap
})()

export function prevSlide(slide) {
  var slidesName = SLIDES.map(s => s.name)
  var slideIndex = slidesName.indexOf(slide)

  switch (slideIndex) {
    case -1:
    case 0:
      return null
    default:
      return `./${slidesName[slideIndex - 1]}.html`
  }
}

export function nextSlide(slide) {
  var slidesName = SLIDES.map(s => s.name)
  var slideIndex = slidesName.indexOf(slide)

  switch (slideIndex) {
    case -1:
    case slidesName.length - 1:
      return null
    default:
      return `./${slidesName[slideIndex + 1]}.html`
  }
}

export function slideLogic(slideName) {
  var slide = SLIDES_MAP[slideName]
  if (slide && slide.logic) { slide.logic() }
}
