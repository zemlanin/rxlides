import Rx from 'rx'
import merge from 'lodash.merge'
import Firebase from 'firebase'

var firebaseRef = new Firebase('https://rxlides.firebaseio.com/');

function _observeOnSuccess(obs, snapshot, prevName) { obs.onNext({snapshot, prevName}) }
function _observeOnSuccessValue(obs, snapshot) {
  obs.onNext({snapshot})
  obs.onCompleted()
}
function _observeOnError(obs, err) { observer.onError(err) }

function on(childPath, eventType) {
  var successCallback

  switch (eventType) {
    case 'value':
    case 'child_removed':
      successCallback = _observeOnSuccessValue
      break;
    case 'child_added':
    case 'child_changed':
    case 'child_moved':
      successCallback = _observeOnSuccess
      break;
  }

  return Rx.Observable.create(obs => {
    var listener = childPath.on(
      eventType,
      successCallback.bind(null, obs),
      _observeOnError.bind(null, obs)
    );

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
  return set(firebaseRef.child('slide'), slide)
}

export function sendInput(input) {
  return push(firebaseRef.child('inputs'), input)
}

export function listenInputs() {
  return on(firebaseRef.child('inputs'), 'child_added')
    .pluck('snapshot')
    .flatMap(s => set(s.ref(), null).map(s.val()))
}

export function listenSlide() {
  return on(firebaseRef.child('slide'), 'value')
    .pluck('snapshot').map(s => s.val())
    .concat(
      on(firebaseRef.child('slide'), 'child_changed')
        .pluck('snapshot')
        .map(s => ({[s.key()]: s.val()}))
    )
    .scan(merge)
}
