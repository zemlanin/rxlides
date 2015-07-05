import Rx from 'rx'
import React from 'react'

import {SLIDES_MAP} from './slides'
import {sendInput, listenSlide} from './remote_io'
import actionsClass from './components/actions'

function getDomPath(e) {
  if (e.path) { return e.path }

  var path = []
  var node = e.target
  while (node !== document.body) {
    path.push(node)
    node = node.parentNode
  }
  return path
}

Rx.Observable.fromEvent(document.body, 'click')
  .map(getDomPath)
  .map(path => path.find(p =>
    p.classList && p.classList.contains('remote-button')
  ))
  .filter(el => el)
  .map(el => el.getAttribute('data-input'))
  .flatMap(sendInput)
  .subscribe()

var currentSlide = listenSlide().share()

currentSlide
  .pluck('name')
  .subscribe(name => document.getElementById('slide_name').textContent = name)

currentSlide
  .pluck('name')
  .map(name => SLIDES_MAP[name].actions)
  .subscribe(actions => {
    React.render(
      React.createElement(actionsClass, {actions}),
      document.getElementById('actions')
    )
  })
