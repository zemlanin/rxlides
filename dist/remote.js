(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.sendSlide = sendSlide;
exports.sendInput = sendInput;
exports.listenInputs = listenInputs;
exports.listenSlide = listenSlide;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); }

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _lodashMerge = require('lodash.merge');

var _lodashMerge2 = _interopRequireDefault(_lodashMerge);

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

var firebaseRef = new _firebase2['default']('https://rxlides.firebaseio.com/');

function _observeOnSuccess(obs, snapshot, prevName) {
  obs.onNext({ snapshot: snapshot, prevName: prevName });
}
function _observeOnSuccessValue(obs, snapshot) {
  obs.onNext({ snapshot: snapshot });
  obs.onCompleted();
}
function _observeOnError(obs, err) {
  observer.onError(err);
}

function on(childPath, eventType) {
  var successCallback;

  switch (eventType) {
    case 'value':
    case 'child_removed':
      successCallback = _observeOnSuccessValue;
      break;
    case 'child_added':
    case 'child_changed':
    case 'child_moved':
      successCallback = _observeOnSuccess;
      break;
  }

  return _rx2['default'].Observable.create(function (obs) {
    var listener = childPath.on(eventType, successCallback.bind(null, obs), _observeOnError.bind(null, obs));

    return function () {
      return childPath.off(eventType, listener);
    };
  }).publish().refCount();
}

function set(childPath, value) {
  return _rx2['default'].Observable.fromNodeCallback(childPath.set.bind(childPath))(value).publish().refCount();
}
function push(childPath, value) {
  var newValue = childPath.push();

  return set(newValue, value).map(newValue);
}

function sendSlide(slide) {
  return set(firebaseRef.child('slide'), slide);
}

function sendInput(input) {
  return push(firebaseRef.child('inputs'), input);
}

function listenInputs() {
  return on(firebaseRef.child('inputs'), 'child_added').pluck('snapshot').flatMap(function (s) {
    return set(s.ref(), null).map(s.val());
  });
}

function listenSlide() {
  return on(firebaseRef.child('slide'), 'value').pluck('snapshot').map(function (s) {
    return s.val();
  }).concat(on(firebaseRef.child('slide'), 'child_changed').pluck('snapshot').map(function (s) {
    return _defineProperty({}, s.key(), s.val());
  })).scan(_lodashMerge2['default']);
}

},{"firebase":"firebase","lodash.merge":"lodash.merge","rx":"rx"}],2:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _remote_io = require('./remote_io');

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

function getDomPath(e) {
  if (e.path) {
    return e.path;
  }

  var path = [];
  var node = e.target;
  while (node != document.body) {
    path.push(node);
    node = node.parentNode;
  }
  return path;
}

_rx2['default'].Observable.fromEvent(document.body, 'click').map(getDomPath).map(function (path) {
  return path.find(function (p) {
    return p.classList && p.classList.contains('remote-button');
  });
}).filter(function (el) {
  return el;
}).map(function (el) {
  return el.getAttribute('data-input');
}).flatMap(_remote_io.sendInput).subscribe();

(0, _remote_io.listenSlide)().pluck('name').subscribe(function (name) {
  return document.getElementById('slide_name').textContent = name;
});

},{"./remote_io":1,"rx":"rx"}]},{},[2]);
