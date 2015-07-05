(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getNavigationStream = getNavigationStream;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var UP = 38;
var DOWN = 40;

var partsSelector = '[id^=part_]';

function getNavigationStream(cycle) {
  if (document.querySelector(partsSelector)) {
    document.getElementById('nav_d').innerHTML = '&darr;';
  }

  return _rx2['default'].Observable.fromEvent(document.body, 'keyup').pluck('keyCode').filter(function (keyCode) {
    return keyCode === UP || keyCode === DOWN;
  }).map(function (keyCode) {
    return keyCode - 39;
  }) // UP = -1, DOWN = +1
  .scan(0, function (acc, move) {
    var newAcc = acc + move;

    if (newAcc < 0 || newAcc > document.querySelectorAll(partsSelector).length) {
      newAcc = cycle ? 0 : acc;
    }
    return newAcc;
  }).map(function (acc) {
    return { acc: acc, parts: document.querySelectorAll(partsSelector).length };
  })['do'](function (_ref) {
    var acc = _ref.acc;
    var parts = _ref.parts;

    document.getElementById('nav_u').innerHTML = acc ? '&uarr;' : '&nbsp;';
    if (!cycle) {
      document.getElementById('nav_d').innerHTML = acc < parts ? '&darr;' : '&nbsp;';
    }
  }).share();
}

},{"rx":"rx"}],2:[function(require,module,exports){
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
  obs.onError(err);
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

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _navigation = require('../navigation');

exports['default'] = function () {
  (0, _navigation.getNavigationStream)(true).subscribe(function (_ref) {
    var acc = _ref.acc;
    var parts = _ref.parts;

    document.getElementById('main').hidden = !!acc;
    document.getElementById('part_1').hidden = !acc;
  });
};

module.exports = exports['default'];

},{"../navigation":1}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _lodashRange = require('lodash.range');

var _lodashRange2 = _interopRequireDefault(_lodashRange);

var _navigation = require('../navigation');

var inactiveStar = '☆';
var activeStar = '★';

function getDomPath(e) {
  if (e.path) {
    return e.path;
  }

  var path = [];
  var node = e.target;
  while (node !== document.body) {
    path.push(node);
    node = node.parentNode;
  }
  return path;
}

exports['default'] = function () {
  var favsStream = new _rx2['default'].Subject();

  _rx2['default'].Observable.fromEvent(document.body, 'click').map(getDomPath).map(function (path) {
    return path.find(function (p) {
      return p.classList && p.classList.contains('gif_cell');
    });
  }).filter(function (cell) {
    return cell;
  }).map(function (cell) {
    return {
      id: parseInt(cell.dataset.id, 10),
      active: cell.querySelector('.star').textContent === inactiveStar
    };
  }).scan(new Set([1, 2, 4]), function (acc, v) {
    if (v.active) {
      acc.add(v.id);
    } else {
      acc['delete'](v.id);
    }
    return acc;
  }).subscribe(favsStream);

  favsStream.subscribe(function (favs) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = document.querySelectorAll('.gif_cell')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var gifCell = _step.value;

        gifCell.querySelector('.star').textContent = favs.has(parseInt(gifCell.dataset.id, 10)) ? activeStar : inactiveStar;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  });

  favsStream.pluck('size').subscribe(function (count) {
    return document.querySelector('.star_count').textContent = count;
  });

  (0, _navigation.getNavigationStream)(true)['do'](function (_ref) {
    var acc = _ref.acc;

    if (!acc || acc === 1) {
      var size = acc ? '200w_s.gif' : '200w.gif';
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = document.querySelectorAll('img')[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var img = _step2.value;

          img.src = img.src.replace(/200w(_s)?\.gif/, size);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2['return']) {
            _iterator2['return']();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }).subscribe(function (_ref2) {
    var acc = _ref2.acc;
    var parts = _ref2.parts;
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = (0, _lodashRange2['default'])(1, parts + 1)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var index = _step3.value;

        document.getElementById('part_' + index).style.color = !acc || acc === index ? 'black' : 'gray';
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3['return']) {
          _iterator3['return']();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }
  });
};

module.exports = exports['default'];

},{"../navigation":1,"lodash.range":"lodash.range","rx":"rx"}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _lodashRange = require('lodash.range');

var _lodashRange2 = _interopRequireDefault(_lodashRange);

var _navigation = require('../navigation');

var inactiveStar = '☆';
var activeStar = '★';

function getDomPath(e) {
  if (e.path) {
    return e.path;
  }

  var path = [];
  var node = e.target;
  while (node !== document.body) {
    path.push(node);
    node = node.parentNode;
  }
  return path;
}

exports['default'] = function () {
  var favsStream = new _rx2['default'].Subject();

  _rx2['default'].Observable.fromEvent(document.body, 'click').map(getDomPath).map(function (path) {
    return path.find(function (p) {
      return p.classList && p.classList.contains('gif_cell');
    });
  }).filter(function (cell) {
    return cell;
  }).map(function (cell) {
    return {
      id: parseInt(cell.dataset.id, 10),
      active: cell.querySelector('.star').textContent === inactiveStar
    };
  }).scan(new Set([1, 2, 4]), function (acc, v) {
    if (v.active) {
      acc.add(v.id);
    } else {
      acc['delete'](v.id);
    }
    return acc;
  }).subscribe(favsStream);

  favsStream.subscribe(function (favs) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = document.querySelectorAll('.gif_cell')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var gifCell = _step.value;

        gifCell.querySelector('.star').textContent = favs.has(parseInt(gifCell.dataset.id, 10)) ? activeStar : inactiveStar;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  });

  favsStream.pluck('size').subscribe(function (count) {
    return document.querySelector('.star_count').textContent = count;
  });

  (0, _navigation.getNavigationStream)(true)['do'](function (_ref) {
    var acc = _ref.acc;

    if (!acc || acc === 1) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = document.querySelectorAll('img')[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var img = _step2.value;

          if (acc) {
            img.classList.add('transparent');
          } else {
            img.classList.remove('transparent');
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2['return']) {
            _iterator2['return']();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = document.querySelectorAll('.star')[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var star = _step3.value;

          if (acc) {
            star.classList.add('visible');
          } else {
            star.classList.remove('visible');
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3['return']) {
            _iterator3['return']();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  }).subscribe(function (_ref2) {
    var acc = _ref2.acc;
    var parts = _ref2.parts;
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = (0, _lodashRange2['default'])(1, parts + 1)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var index = _step4.value;

        document.getElementById('part_' + index).hidden = acc !== index;
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4['return']) {
          _iterator4['return']();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }
  });
};

module.exports = exports['default'];

},{"../navigation":1,"lodash.range":"lodash.range","rx":"rx"}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.prevSlide = prevSlide;
exports.nextSlide = nextSlide;
exports.slideLogic = slideLogic;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _map_filter_flatmapJs = require('./map_filter_flatmap.js');

var _map_filter_flatmapJs2 = _interopRequireDefault(_map_filter_flatmapJs);

var _keyboard_demoJs = require('./keyboard_demo.js');

var _keyboard_demoJs2 = _interopRequireDefault(_keyboard_demoJs);

var _interval_demoJs = require('./interval_demo.js');

var _interval_demoJs2 = _interopRequireDefault(_interval_demoJs);

var _single_subscribeJs = require('./single_subscribe.js');

var _single_subscribeJs2 = _interopRequireDefault(_single_subscribeJs);

var _single_callbackJs = require('./single_callback.js');

var _single_callbackJs2 = _interopRequireDefault(_single_callbackJs);

var _callbacks_chainJs = require('./callbacks_chain.js');

var _callbacks_chainJs2 = _interopRequireDefault(_callbacks_chainJs);

var _promises_consJs = require('./promises_cons.js');

var _promises_consJs2 = _interopRequireDefault(_promises_consJs);

var _programmable_streamJs = require('./programmable_stream.js');

var _programmable_streamJs2 = _interopRequireDefault(_programmable_streamJs);

var _gifflix_demoJs = require('./gifflix_demo.js');

var _gifflix_demoJs2 = _interopRequireDefault(_gifflix_demoJs);

var _components_communicationJs = require('./components_communication.js');

var _components_communicationJs2 = _interopRequireDefault(_components_communicationJs);

var _summaryJs = require('./summary.js');

var _summaryJs2 = _interopRequireDefault(_summaryJs);

var _remote_ioJs = require('../remote_io.js');

var puns = ['Tyrannosaurus Rx', 'Rx-xar, the Hunter', 'Commissar Rx', 'Rxless', 'Rx and Morty'];

function indexLogic() {
  _rx2['default'].Observable.interval(1000).zip(_rx2['default'].Observable.from(puns), function (m, pun) {
    return pun;
  }).take(puns.length).repeat().subscribe(function (pun) {
    return document.getElementsByTagName('h1')[0].textContent = pun;
  });
}

var SLIDES = [{
  name: 'index',
  logic: indexLogic }, {
  name: 'ui',
  logic: null }, {
  name: 'single_callback',
  logic: _single_callbackJs2['default'],
  actions: [_remote_ioJs.MOUSE.CLICK] }, {
  name: 'microsoft_xhr',
  logic: null }, {
  name: 'callbacks_sync',
  logic: null }, {
  name: 'callbacks_chain',
  logic: _callbacks_chainJs2['default'] }, {
  name: 'promises',
  logic: null }, {
  name: 'promises_chain',
  logic: null }, {
  name: 'promises_cons',
  logic: _promises_consJs2['default'],
  actions: [_remote_ioJs.MOUSE.CLICK] }, {
  name: 'microsoft_go4',
  logic: null }, {
  name: 'single_subscribe',
  logic: _single_subscribeJs2['default'],
  actions: [_remote_ioJs.MOUSE.CLICK] }, {
  name: 'map_filter_flatmap',
  logic: _map_filter_flatmapJs2['default'],
  actions: [_remote_ioJs.KEYCODES.Q, _remote_ioJs.KEYCODES.W, _remote_ioJs.KEYCODES.E, _remote_ioJs.KEYCODES.A, _remote_ioJs.KEYCODES.S, _remote_ioJs.KEYCODES.D] }, {
  name: 'interval_demo',
  logic: _interval_demoJs2['default'],
  actions: [_remote_ioJs.KEYCODES.Q, _remote_ioJs.KEYCODES.W, _remote_ioJs.KEYCODES.E] }, {
  name: 'keyboard_demo',
  logic: _keyboard_demoJs2['default'],
  actions: [_remote_ioJs.KEYCODES.Q, _remote_ioJs.KEYCODES.W, _remote_ioJs.KEYCODES.E, _remote_ioJs.KEYCODES.A, _remote_ioJs.KEYCODES.S, _remote_ioJs.KEYCODES.D] }, {
  name: 'programmable_stream',
  logic: _programmable_streamJs2['default'] }, {
  name: 'gifflix_demo',
  logic: _gifflix_demoJs2['default'],
  actions: [_remote_ioJs.KEYCODES._0, _remote_ioJs.KEYCODES._1, _remote_ioJs.KEYCODES._2, _remote_ioJs.KEYCODES._3, _remote_ioJs.KEYCODES._4] }, {
  name: 'components_communication',
  logic: _components_communicationJs2['default'],
  actions: [_remote_ioJs.KEYCODES._0, _remote_ioJs.KEYCODES._1, _remote_ioJs.KEYCODES._2, _remote_ioJs.KEYCODES._3, _remote_ioJs.KEYCODES._4] }, {
  name: 'summary',
  logic: _summaryJs2['default'] }, {
  name: 'links',
  logic: null }];

exports.SLIDES = SLIDES;
var SLIDES_MAP = (function () {
  var slidesMap = {};
  for (var i = 0; i < SLIDES.length; i++) {
    slidesMap[SLIDES[i].name] = SLIDES[i];
  }

  return slidesMap;
})();

exports.SLIDES_MAP = SLIDES_MAP;

function prevSlide(slide) {
  var slidesName = SLIDES.map(function (s) {
    return s.name;
  });
  var slideIndex = slidesName.indexOf(slide);

  switch (slideIndex) {
    case -1:
    case 0:
      return null;
    case 1:
      return '../index.html';
    default:
      return './' + slidesName[slideIndex - 1] + '.html';
  }
}

function nextSlide(slide) {
  var slidesName = SLIDES.map(function (s) {
    return s.name;
  });
  var slideIndex = slidesName.indexOf(slide);

  switch (slideIndex) {
    case -1:
    case slidesName.length - 1:
      return null;
    case 0:
      return './slides/' + slidesName[1] + '.html';
    default:
      return './' + slidesName[slideIndex + 1] + '.html';
  }
}

function slideLogic(slideName) {
  var slide = SLIDES_MAP[slideName];
  if (slide && slide.logic) {
    slide.logic();
  }
}

},{"../remote_io.js":2,"./callbacks_chain.js":3,"./components_communication.js":4,"./gifflix_demo.js":5,"./interval_demo.js":7,"./keyboard_demo.js":8,"./map_filter_flatmap.js":9,"./programmable_stream.js":10,"./promises_cons.js":11,"./single_callback.js":12,"./single_subscribe.js":13,"./summary.js":14,"rx":"rx"}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _lodashRange = require('lodash.range');

var _lodashRange2 = _interopRequireDefault(_lodashRange);

var _vision = require('../vision');

var _navigation = require('../navigation');

var Q = 81;
var W = 87;
var E = 69;

exports['default'] = function () {
  var keyCodesStream;

  if (location.hash === '#touch') {
    keyCodesStream = (0, _vision.getMockKeys)().zip(_rx2['default'].Observable.from([E, Q, Q, E, Q, W, Q, Q]), function (m, keyCode) {
      return keyCode;
    }).take(8).repeat();
  } else {
    keyCodesStream = _rx2['default'].Observable.fromEvent(document.body, 'keyup').pluck('keyCode').filter(function (keyCode) {
      return keyCode === 32 || keyCode >= 65 && keyCode <= 90;
    });
  }

  var ctx = document.querySelector('#main canvas').getContext('2d');

  var frameStream = _rx2['default'].Observable.create(function (observer) {
    return (function loop() {
      window.requestAnimationFrame(function () {
        observer.onNext([null, 1.3]);
        loop();
      });
    })();
  });

  var canvasKeys = keyCodesStream.map(function (keyCode) {
    return '[' + String.fromCharCode(keyCode) + ']';
  }).map((0, _vision.wrapToDisplay)(ctx)).merge(frameStream).scan([], _vision.accumutate).distinctUntilChanged();

  var canvasSkipUntil = keyCodesStream.filter(function (keyCode) {
    return keyCode === Q;
  }).skipUntil(keyCodesStream.filter(function (keyCode) {
    return keyCode === W;
  })).map(function (keyCode) {
    return '[' + String.fromCharCode(keyCode) + ']';
  }).map((0, _vision.wrapToDisplay)(ctx)).merge(frameStream).scan([], _vision.accumutate).distinctUntilChanged();

  var canvasDelay = keyCodesStream.filter(function (keyCode) {
    return keyCode === Q;
  }).delay(1000).map(function (keyCode) {
    return '[' + String.fromCharCode(keyCode) + ']';
  }).map((0, _vision.wrapToDisplay)(ctx)).merge(frameStream).scan([], _vision.accumutate).distinctUntilChanged();

  var canvasInterval = keyCodesStream.filter(function (keyCode) {
    return keyCode === Q;
  }).timeInterval().map(function (v) {
    return Math.floor(v.interval / 1000);
  }).map((0, _vision.wrapToDisplay)(ctx)).merge(frameStream).scan([], _vision.accumutate).distinctUntilChanged();

  canvasKeys.subscribe((0, _vision.renderStream)(document.querySelector('#main canvas')));
  canvasSkipUntil.subscribe((0, _vision.renderStream)(document.querySelector('#part_0 canvas')));
  canvasDelay.subscribe((0, _vision.renderStream)(document.querySelector('#part_1 canvas')));
  canvasInterval.subscribe((0, _vision.renderStream)(document.querySelector('#part_2 canvas')));

  if (location.hash === '#touch') {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = document.querySelectorAll('[hidden]')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var el = _step.value;

        el.hidden = false;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  (0, _navigation.getNavigationStream)(false).subscribe(function (_ref) {
    var acc = _ref.acc;
    var parts = _ref.parts;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = (0, _lodashRange2['default'])(parts)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var index = _step2.value;

        document.getElementById('part_' + index).hidden = acc <= index;
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
          _iterator2['return']();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  });
};

module.exports = exports['default'];

},{"../navigation":1,"../vision":15,"lodash.range":"lodash.range","rx":"rx"}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _keyIds;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); }

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _lodashRange = require('lodash.range');

var _lodashRange2 = _interopRequireDefault(_lodashRange);

var _navigation = require('../navigation');

var _remote_io = require('../remote_io');

var Q = _remote_io.KEYCODES.Q;
var W = _remote_io.KEYCODES.W;
var E = _remote_io.KEYCODES.E;
var A = _remote_io.KEYCODES.A;
var S = _remote_io.KEYCODES.S;
var D = _remote_io.KEYCODES.D;

var keyIds = (_keyIds = {}, _defineProperty(_keyIds, Q.key, 'wasd_q'), _defineProperty(_keyIds, W.key, 'wasd_w'), _defineProperty(_keyIds, E.key, 'wasd_e'), _defineProperty(_keyIds, A.key, 'wasd_a'), _defineProperty(_keyIds, S.key, 'wasd_s'), _defineProperty(_keyIds, D.key, 'wasd_d'), _keyIds);

function setActive(keyCode) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = document.querySelectorAll('.wasd.active')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var keySpan = _step.value;

      keySpan.classList.remove('active');
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  if (keyCode) {
    document.getElementById(keyIds[keyCode]).classList.add('active');
  }
}

exports['default'] = function () {
  var keys = _rx2['default'].Observable.fromEvent(document.body, 'keydown').pluck('keyCode');
  var startStream = keys.filter(function (keyCode) {
    return keyCode === Q.key;
  });
  var stopStream = keys.filter(function (keyCode) {
    return keyCode === E.key;
  });

  _rx2['default'].Observable.fromEvent(document.body, 'keyup').map(null).subscribe(setActive);
  startStream.map(function (q) {
    return keys.startWith(q).takeUntil(stopStream);
  })['switch']().filter(function (keyCode) {
    return keyIds[keyCode];
  }).subscribe(setActive);

  (0, _navigation.getNavigationStream)(true).subscribe(function (_ref) {
    var acc = _ref.acc;
    var parts = _ref.parts;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = (0, _lodashRange2['default'])(1, parts + 1)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var index = _step2.value;

        document.getElementById('part_' + index).style.color = !acc || acc === index ? 'black' : 'gray';
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
          _iterator2['return']();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  });
};

module.exports = exports['default'];

},{"../navigation":1,"../remote_io":2,"lodash.range":"lodash.range","rx":"rx"}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _lodashRange = require('lodash.range');

var _lodashRange2 = _interopRequireDefault(_lodashRange);

var _vision = require('../vision');

var _navigation = require('../navigation');

exports['default'] = function () {
  var keyCodesStream;

  if (location.hash === '#touch') {
    keyCodesStream = (0, _vision.getMockKeys)();
  } else {
    keyCodesStream = _rx2['default'].Observable.fromEvent(document.body, 'keyup').pluck('keyCode').filter(function (keyCode) {
      return keyCode === 32 || keyCode >= 65 && keyCode <= 90;
    });
  }

  var ctx = document.querySelector('#main canvas').getContext('2d');

  var frameStream = _rx2['default'].Observable.create(function (observer) {
    return (function loop() {
      window.requestAnimationFrame(function () {
        observer.onNext([null, 1]);
        loop();
      });
    })();
  });

  var canvasKeys = keyCodesStream.map(function (keyCode) {
    return '[' + String.fromCharCode(keyCode) + ']';
  }).map((0, _vision.wrapToDisplay)(ctx)).merge(frameStream).scan([], _vision.accumutate).distinctUntilChanged();

  var canvasKeysMap = keyCodesStream.map((0, _vision.wrapToDisplay)(ctx)).merge(frameStream).scan([], _vision.accumutate).distinctUntilChanged();

  var canvasKeysFilter = canvasKeysMap.map(function (keys) {
    return keys.filter(function (_ref) {
      var text = _ref.text;
      return text > 73;
    });
  });

  ctx.font = document.body.style.font;
  var pongWidth = ctx.measureText('pong').width;
  var canvasKeysFlatmap = canvasKeysFilter
  // delay pongs without jitter
  .map(function (keys) {
    return keys.map(function (_ref2) {
      var text = _ref2.text;
      var position = _ref2.position;
      var mirror = _ref2.mirror;
      return { text: 'pong', position: position - 30, mirror: mirror };
    });
  })
  // appear instead of moving in
  .map(function (keys) {
    return keys.filter(function (_ref3) {
      var position = _ref3.position;
      return position > pongWidth;
    });
  });

  canvasKeys.subscribe((0, _vision.renderStream)(document.querySelector('#main canvas')));
  canvasKeysMap.subscribe((0, _vision.renderStream)(document.querySelector('#part_0 canvas')));
  canvasKeysFilter.subscribe((0, _vision.renderStream)(document.querySelector('#part_1 canvas')));
  canvasKeysFlatmap.subscribe((0, _vision.renderStream)(document.querySelector('#part_2 canvas')));

  if (location.hash === '#touch') {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = document.querySelectorAll('[hidden]')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var el = _step.value;

        el.hidden = false;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  (0, _navigation.getNavigationStream)(false).subscribe(function (_ref4) {
    var acc = _ref4.acc;
    var parts = _ref4.parts;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = (0, _lodashRange2['default'])(parts)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var index = _step2.value;

        document.getElementById('part_' + index).hidden = acc <= index;
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
          _iterator2['return']();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  });
};

module.exports = exports['default'];

},{"../navigation":1,"../vision":15,"lodash.range":"lodash.range","rx":"rx"}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashRange = require('lodash.range');

var _lodashRange2 = _interopRequireDefault(_lodashRange);

var _navigation = require('../navigation');

exports['default'] = function () {
  (0, _navigation.getNavigationStream)(true).subscribe(function (_ref) {
    var acc = _ref.acc;
    var parts = _ref.parts;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = (0, _lodashRange2['default'])(1, parts + 1)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var index = _step.value;

        document.getElementById('part_' + index).style.color = !acc || acc === index ? 'black' : 'gray';
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  });
};

module.exports = exports['default'];

},{"../navigation":1,"lodash.range":"lodash.range"}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _vision = require('../vision');

exports['default'] = function () {
  var frameStream = _rx2['default'].Observable.create(function (observer) {
    return (function loop() {
      window.requestAnimationFrame(function () {
        observer.onNext([null, 1]);
        loop();
      });
    })();
  });

  var clickStream = _rx2['default'].Observable.fromEvent(document, 'click').map('click');

  var visualStream = clickStream.map((0, _vision.wrapToDisplay)(document.querySelector('canvas').getContext('2d'))).merge(frameStream).scan([], _vision.accumutate).distinctUntilChanged();

  visualStream.subscribe((0, _vision.renderStream)(document.querySelector('canvas')));
  clickStream.take(1).flatMap(function (text) {
    return _rx2['default'].Observable.of({ text: 'event', color: '' }).delay(1000).startWith({ text: text, color: '#00A500' });
  }).subscribe(function (_ref) {
    var text = _ref.text;
    var color = _ref.color;

    document.getElementById('subscribe_arg').textContent = text;
    document.getElementById('subscribe_arg').style.color = color;
  });
};

module.exports = exports['default'];

},{"../vision":15,"rx":"rx"}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _vision = require('../vision');

exports['default'] = function () {
  var frameStream = _rx2['default'].Observable.create(function (observer) {
    return (function loop() {
      window.requestAnimationFrame(function () {
        observer.onNext([null, 1.5]);
        loop();
      });
    })();
  });

  var clickStream = _rx2['default'].Observable.fromEvent(document, 'click').map('click');

  var visualStream = clickStream.map((0, _vision.wrapToDisplay)(document.querySelector('canvas').getContext('2d'))).merge(frameStream).scan([], _vision.accumutate).distinctUntilChanged();

  visualStream.subscribe((0, _vision.renderStream)(document.querySelector('canvas')));
  clickStream.flatMap(function (text) {
    return _rx2['default'].Observable.of({ text: 'event', color: '' }).delay(700).startWith({ text: text, color: '#00A500' });
  }).subscribe(function (_ref) {
    var text = _ref.text;
    var color = _ref.color;

    document.getElementById('subscribe_arg').textContent = text;
    document.getElementById('subscribe_arg').style.color = color;
  });
};

module.exports = exports['default'];

},{"../vision":15,"rx":"rx"}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _vision = require('../vision');

exports['default'] = function () {
  var clickStream = _rx2['default'].Observable.fromEvent(document, 'click').map('click');

  var frameStream = _rx2['default'].Observable.create(function (observer) {
    return (function loop() {
      window.requestAnimationFrame(function () {
        observer.onNext([null, 1]);
        loop();
      });
    })();
  });

  var visualStream = clickStream.map((0, _vision.wrapToDisplay)(document.querySelector('canvas').getContext('2d'))).merge(frameStream).scan([], _vision.accumutate).distinctUntilChanged();

  visualStream.subscribe((0, _vision.renderStream)(document.querySelector('canvas')));
  clickStream.flatMap(function (text) {
    return _rx2['default'].Observable.of({ text: 'event', color: '' }).delay(700).startWith({ text: text, color: '#00A500' });
  }).subscribe(function (_ref) {
    var text = _ref.text;
    var color = _ref.color;

    document.getElementById('subscribe_arg').textContent = text;
    document.getElementById('subscribe_arg').style.color = color;
  });
};

module.exports = exports['default'];

},{"../vision":15,"rx":"rx"}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _lodashRange = require('lodash.range');

var _lodashRange2 = _interopRequireDefault(_lodashRange);

var _vision = require('../vision');

var _navigation = require('../navigation');

exports['default'] = function () {
  var keyCodesStream = (0, _vision.getMockKeys)();

  var ctx = document.querySelector('#main canvas').getContext('2d');

  var frameStream = _rx2['default'].Observable.create(function (observer) {
    return (function loop() {
      window.requestAnimationFrame(function () {
        observer.onNext([null, 1.3]);
        loop();
      });
    })();
  });

  var canvasKeysMap = keyCodesStream.map((0, _vision.wrapToDisplay)(document.querySelector('#main canvas').getContext('2d'))).merge(frameStream).scan([], _vision.accumutate).distinctUntilChanged();

  var canvasKeysFilter = keyCodesStream.map(function (key) {
    return key + 10;
  }).map((0, _vision.wrapToDisplay)(document.querySelector('#part_0 canvas').getContext('2d'))).merge(frameStream).scan([], _vision.accumutate).distinctUntilChanged();

  canvasKeysMap.subscribe((0, _vision.renderStream)(document.querySelector('#main canvas')));
  canvasKeysFilter.subscribe((0, _vision.renderStream)(document.querySelector('#part_0 canvas')));

  if (location.hash === '#touch') {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = document.querySelectorAll('[hidden]')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var el = _step.value;

        el.hidden = false;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  (0, _navigation.getNavigationStream)(false).subscribe(function (_ref) {
    var acc = _ref.acc;
    var parts = _ref.parts;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = (0, _lodashRange2['default'])(parts)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var index = _step2.value;

        document.getElementById('part_' + index).hidden = acc <= index;
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
          _iterator2['return']();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  });
};

module.exports = exports['default'];

},{"../navigation":1,"../vision":15,"lodash.range":"lodash.range","rx":"rx"}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.renderStream = renderStream;
exports.accumutate = accumutate;
exports.wrapToDisplay = wrapToDisplay;
exports.getMockKeys = getMockKeys;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _lodashRange = require('lodash.range');

var _lodashRange2 = _interopRequireDefault(_lodashRange);

function renderStream(canvas) {
  var ctx = canvas.getContext('2d');

  return function (keys) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = document.body.style.font;
    ctx.fillStyle = '#00A500';

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _step$value = _step.value;
        var text = _step$value.text;
        var position = _step$value.position;
        var mirror = _step$value.mirror;

        ctx.fillText(text, mirror ? canvas.width - position : position, canvas.height - 7);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  };
}

function accumutate(acc, _ref) {
  var _ref2 = _slicedToArray(_ref, 2);

  var value = _ref2[0];
  var shift = _ref2[1];

  if (value) {
    acc = [value].concat(_toConsumableArray(acc));
  }

  return acc.filter(function (_ref3) {
    var position = _ref3.position;
    return position <= document.body.clientWidth;
  }).map(function (_ref4) {
    var text = _ref4.text;
    var position = _ref4.position;
    var mirror = _ref4.mirror;
    return { text: text, position: position + shift, mirror: mirror };
  });
}

function wrapToDisplay(ctx) {
  return function (text) {
    return [{ text: text, position: parseInt(ctx.measureText(text).width, 10), mirror: true }, 0];
  };
}

function getMockKeys() {
  var touchMockKeys = (0, _lodashRange2['default'])(65, 91).concat(32);

  return _rx2['default'].Observable.interval(2000).startWith(null).flatMap(function () {
    return _rx2['default'].Observable.timer(Math.random() * 2000 - 500);
  }).map(function () {
    return touchMockKeys[parseInt(Math.random() * touchMockKeys.length, 10)];
  }).share();
}

},{"lodash.range":"lodash.range","rx":"rx"}],16:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _slides = require('./slides');

var _remote_io = require('./remote_io');

var metaPage = document.querySelector('meta[property=page]').content;
(0, _slides.slideLogic)(metaPage);
if (metaPage !== 'index') {
  document.querySelector('nav .slide_name').textContent = 'slides/' + metaPage;
}

(0, _remote_io.sendSlide)({ name: metaPage }).subscribe();

/*eslint-disable no-unused-vars */
var LEFT = 37;
var UP = 38;
var RIGHT = 39;
var DOWN = 40;

/*eslint-enable no-unused-vars */
_rx2['default'].Observable.fromEvent(document.body, 'keyup').map(function (e) {
  return { keyCode: e.keyCode, touch: false };
}).merge(_rx2['default'].Observable.fromEvent(document, 'touchstart').map(function (e) {
  return e.touches[0];
}).flatMap(function (touch) {
  return _rx2['default'].Observable.fromEvent(document, 'touchend').takeUntil(_rx2['default'].Observable.fromEvent(document, 'touchmove')).take(1).map(touch);
}).map(function (touch) {
  var keyCode;
  if (touch.clientX < document.body.clientWidth / 4) {
    keyCode = LEFT;
  }
  if (touch.clientX > 3 * document.body.clientWidth / 4) {
    keyCode = RIGHT;
  }

  return { keyCode: keyCode, touch: true };
})).merge((0, _remote_io.listenInputs)().map(function (v) {
  var keyCode;

  if (v === 'LEFT') {
    keyCode = LEFT;
  }
  if (v === 'RIGHT') {
    keyCode = RIGHT;
  }

  return { keyCode: keyCode };
})).map(function (_ref) {
  var keyCode = _ref.keyCode;
  var touch = _ref.touch;

  switch (keyCode) {
    case LEFT:
      return { page: (0, _slides.prevSlide)(metaPage), touch: touch };
    case RIGHT:
      return { page: (0, _slides.nextSlide)(metaPage), touch: touch };
    default:
      return {};
  }
}).filter(function (v) {
  return v && v.page;
}).subscribe(function (_ref2) {
  var page = _ref2.page;
  var touch = _ref2.touch;
  return location.href = page + (touch ? '#touch' : '');
});

},{"./remote_io":2,"./slides":6,"rx":"rx"}]},{},[16]);
