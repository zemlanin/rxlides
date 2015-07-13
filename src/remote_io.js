import Rx from 'rx'
import merge from 'lodash.merge'
import Firebase from 'firebase'

var firebaseRef = new Firebase('https://rxlides.firebaseio.com/')

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

function _observeOnSuccess(obs, snapshot, prevName) { obs.onNext({snapshot, prevName}) }
function _observeOnSuccessValue(obs, snapshot) {
  obs.onNext({snapshot})
  obs.onCompleted()
}
function _observeOnError(obs, err) { obs.onError(err) }

function on(childPath, eventType) {
  var successCallback

  switch (eventType) {
    case 'value':
    case 'child_removed':
      successCallback = _observeOnSuccessValue
      break
    case 'child_added':
    case 'child_changed':
    case 'child_moved':
      successCallback = _observeOnSuccess
      break
  }

  return Rx.Observable.create(obs => {
    var listener = childPath.on(
      eventType,
      successCallback.bind(null, obs),
      _observeOnError.bind(null, obs)
    )

    return () => childPath.off(eventType, listener)
  }).publish().refCount()
}

function set(childPath, value) {
  return Rx.Observable.fromNodeCallback(childPath.set.bind(childPath))(value).publish().refCount()
}
function push(childPath, value) {
  var newValue = childPath.push()

  return set(newValue, value).map(newValue)
}

export function sendSlide(slide) {
  var id = localStorage.getItem('presentationId')
  if (!id) {
    id = parseInt(Math.random() * 36 * 36 * 36 * 36, 10).toString(36)
    localStorage.setItem('presentationId', id)
  }
  return set(firebaseRef.child('slide/' + id), slide)
}

export function sendInput(input) {
  var id = location.hash.replace('#', '')
  if (!id) { return Rx.Observable.return(null) }

  return push(firebaseRef.child('inputs/' + id), input)
}

export function listenInputs() {
  var id = localStorage.getItem('presentationId')
  if (!id) {
    id = parseInt(Math.random() * 36 * 36 * 36 * 36, 10).toString(36)
    localStorage.setItem('presentationId', id)
  }

  return on(firebaseRef.child('inputs/' + id), 'child_added')
    .pluck('snapshot')
    .flatMap(s => set(s.ref(), null).map(s.val()))
}

export function listenSlide() {
  var id = location.hash.replace('#', '')
  if (!id) { return Rx.Observable.return(null) }

  return on(firebaseRef.child('slide/' + id), 'value')
    .pluck('snapshot').map(s => s.val())
    .concat(
      Rx.Observable.merge(
        on(firebaseRef.child('slide/' + id), 'child_changed')
          .pluck('snapshot')
          .map(s => ({[s.key()]: s.val()})),
        on(firebaseRef.child('slide/' + id), 'child_removed')
          .pluck('snapshot')
          .map(s => ({[s.key()]: null})),
        on(firebaseRef.child('slide/' + id), 'child_added')
          .pluck('snapshot')
          .map(s => ({[s.key()]: s.val()}))
      )
    )
    .scan(merge)
}
