(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _react = require('react');

var actionsClass = (function (_Component) {
  function actionsClass() {
    _classCallCheck(this, actionsClass);

    if (_Component != null) {
      _Component.apply(this, arguments);
    }
  }

  _inherits(actionsClass, _Component);

  _createClass(actionsClass, [{
    key: 'render',
    value: function render() {
      if (!this.props.actions) {
        return _react.DOM.div(null, 12);
      }
      return _react.DOM.div({}, this.props.actions.map(function (action) {
        return _react.DOM.span({ key: action.name }, action.name);
      }));
    }
  }]);

  return actionsClass;
})(_react.Component);

exports['default'] = actionsClass;
module.exports = exports['default'];

},{"react":"react"}],2:[function(require,module,exports){
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

var KEYCODES = {
  LEFT: { key: 37, name: 'LEFT' },
  UP: { key: 38, name: 'UP' },
  RIGHT: { key: 39, name: 'RIGHT' },
  DOWN: { key: 40, name: 'DOWN' },
  Q: { key: 81, name: 'Q' },
  W: { key: 87, name: 'W' },
  E: { key: 69, name: 'E' },
  A: { key: 65, name: 'A' },
  S: { key: 83, name: 'S' },
  D: { key: 68, name: 'D' },
  _0: { key: 48, name: '_0' },
  _1: { key: 49, name: '_1' },
  _2: { key: 50, name: '_2' },
  _3: { key: 51, name: '_3' },
  _4: { key: 52, name: '_4' } };

exports.KEYCODES = KEYCODES;
var MOUSE = {
  CLICK: { mouse: 'click', name: 'click' } };

exports.MOUSE = MOUSE;
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
  }).concat(_rx2['default'].Observable.merge(on(firebaseRef.child('slide'), 'child_changed').pluck('snapshot').map(function (s) {
    return _defineProperty({}, s.key(), s.val());
  }), on(firebaseRef.child('slide'), 'child_removed').pluck('snapshot').map(function (s) {
    return _defineProperty({}, s.key(), null);
  }), on(firebaseRef.child('slide'), 'child_added').pluck('snapshot').map(function (s) {
    return _defineProperty({}, s.key(), s.val());
  }))).scan(_lodashMerge2['default']);
}

},{"firebase":"firebase","lodash.merge":"lodash.merge","rx":"rx"}],3:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodashValues = require('lodash.values');

var _lodashValues2 = _interopRequireDefault(_lodashValues);

var _remote_io = require('./remote_io');

var _componentsActions = require('./components/actions');

var _componentsActions2 = _interopRequireDefault(_componentsActions);

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

var currentSlide = (0, _remote_io.listenSlide)().share();

currentSlide.pluck('name').subscribe(function (name) {
  return document.getElementById('slide_name').textContent = name;
});

currentSlide.pluck('actions')
// .map(_values)
.subscribe(function (actions) {
  _react2['default'].render(_react2['default'].createElement(_componentsActions2['default'], { actions: (0, _lodashValues2['default'])(actions) }), document.getElementById('actions'));
});

},{"./components/actions":1,"./remote_io":2,"lodash.values":"lodash.values","react":"react","rx":"rx"}]},{},[3]);
