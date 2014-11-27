(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';


var woman = new Image();
var man = new Image();
var grass = new Image();
var tree = new Image();

woman.src = '../assets/woman.png';
man.src = '../assets/man.png';
grass.src = '../assets/grass.png';
tree.src = '../assets/tree.png';

var assets = {
    woman: woman,
    man: man,
    grass: grass,
    tree: tree
};

var GameBoard = require('../index');
var canvas = document.getElementById('gameCanvas');

var gameBoard = new GameBoard({
    canvas: canvas,
    tiles: {},
    tileSize: 16,
    width: 10,
    height: 10,
    FPS: 20,
    grid: true, // really slows down performance
    assets: assets
});

var tiles = require('./tiles')(10,10); // create 10x10 blank map
var eve = require('./units').Woman;
var adam = require('./units').Man;
var treeOfLife = require('./units').Tree;

gameBoard.start();
gameBoard.tileUpdate(tiles);
gameBoard.addUnit(treeOfLife);
gameBoard.addUnit(eve);
gameBoard.addUnit(adam);

setInterval(function () {
    randomLocation(adam);
    randomLocation(eve);
}, 1000);


function randomLocation (unit) {
    var rand = Math.floor(Math.random() * 3);
    if (rand === 0) unit.location.x ++;
    if (rand === 1) unit.location.y ++;
    if (rand === 2) unit.location.x --;
    if (rand === 3) unit.location.y --;
}

},{"../index":4,"./tiles":2,"./units":3}],2:[function(require,module,exports){
module.exports = createMap;

function createMap (x, y) {
    var map = [];
    for (var i = 0; i < x; i ++) {
        for (var j = 0; j < y; j++) {
            var tile = {
                location: {x: i, y: j},
                style: 'grass',
                visible: true,
                units: []
            }
            map.push(tile);
        }
    }
    return map;
}

},{}],3:[function(require,module,exports){
var units = [
{
    style: 'woman',
    size: [1,2],
    location: {
        x: 2,
        y: 2
    }
}
];

var Woman = {
    style: 'woman',
    size: [1,2],
    location: {
        x: 3,
        y: 2
    }
};

var Man = {
    style: 'man',
    size: [1,2],
    location: {
        x: 5,
        y: 4
    }
};

var Tree = {
    style: 'tree',
    size: [3,3],
    location: {
        x: 4,
        y: 8
    }
};

exports.units = units;
exports.Woman = Woman;
exports.Man = Man;
exports.Tree = Tree;

},{}],4:[function(require,module,exports){
'use strict';

var EventEmitter = require('events').EventEmitter;

function GameBoard (opts) {
    if (!(this instanceof GameBoard)) return new GameBoard(opts);

    this.controller    = opts.controller || new EventEmitter();
    this.tiles         = opts.tiles || {};
    this.sortedUnits   = [];
    this.TILESIZE      = opts.TILESIZE || 16;
    this.FPS           = opts.FPS || 30;
    this.canvas        = opts.canvas;
    this.canvas.height = opts.height * this.TILESIZE + 1 || 418;
    this.canvas.width  = opts.width * this.TILESIZE + 1 || 514;
    this.context       = opts.canvas.getContext('2d');
    this.grid          = opts.grid || false;
    this.assets        = opts.assets || {};
    this.viewOrigin    = { x: 0, y: 0 };
}

var proto = GameBoard.prototype;

proto.tileUpdate = function (tiles) {
    var self = this;
    tiles.forEach(function (tile) {
        var tileKey = tile.location.x + ':' + tile.location.y;
        self.tiles[tileKey] = tile;
    });

    self.sortedUnits = self.getSortedUnits(self.tiles);
};

proto.draw = function () {
    var self = this;
    var canvasWidth = self.canvas.width;
    var canvasHeight = self.canvas.height;
    var tiles = Object.keys(self.tiles);

    tiles.forEach(drawTile);
    if (self.grid) drawGrid();
    self.sortedUnits.forEach(drawUnit);

    return;

    function drawTile (locationKey) {
        if (!(self.tiles[locationKey].visible)) return;

        var tile = self.tiles[locationKey];
        var tilePosition = self.getPosition(tile.location);
        self.context.drawImage(self.assets[tile.style], tilePosition.x + 0.5, tilePosition.y + 0.5);
    }

    function drawUnit (unit) {
        var unitPrepLocation = {
            x : (unit.location.x - Math.floor(unit.size[0] / 2)),
            y : (unit.location.y - unit.size[1] + 1)
        };

        var unitPosition = self.getPosition(unitPrepLocation);
        self.context.drawImage(self.assets[unit.style], unitPosition.x + 0.5, unitPosition.y + 0.5);
    }

    function drawGrid () {
        self.context.strokeStyle = '#ddd';
        self.context.setLineDash([2,2]);
        self.context.lineWidth = 1;

        for (var x = 0.5; x < canvasWidth; x += self.TILESIZE) {
            self.context.moveTo(x, 0);
            self.context.lineTo(x, canvasHeight);
        }

        for (var y = 0.5; y < canvasHeight; y += self.TILESIZE) {
            self.context.moveTo(0, y);
            self.context.lineTo(canvasWidth, y);
        }

        self.context.stroke();
    }

};

proto.clear = function () {
    var self = this;
    var canvasWidth = self.canvas.width;
    var canvasHeight = self.canvas.height;
    self.context.clearRect(0, 0, canvasWidth, canvasHeight);
};

proto.start = function () {
    var self = this;
    var FPS = this.FPS;
    function render () {
        setInterval(function () {
            self.clear();
            //if (requestAnimationFrame) requestAnimationFrame(render);
            self.draw();
        }, 1000 / FPS);
    }
    render();
};

proto.addUnit = function (unit) {
    this.sortedUnits.push(unit);
    this.sortedUnits = this.sortedUnits.sort(compare);
};

proto.addTile = function (tile) {
    return this.tileUpdate([tile]);
};

proto.getSortedUnits = function (tiles) {
    var tileArray = Object.keys(tiles);
    var units = [];
    if (!tileArray.length) return units;

    tileArray.forEach(function getTile(tileLoc) {
        var tile = tiles[tileLoc];
        if (!tile.visible) return;
        if (!tile.units) return;
        tile.units.forEach(function getUnit(unit) {
            units.push(unit);
        });
    });
    units.sort(compare);
    return units;
};

proto.getPosition = function (location) {
    var self = this;

    var position = {
        x : (location.x * 16) + self.viewOrigin.x,
        y : (location.y * 16) + self.viewOrigin.y
    };
    return position;
};

function compare (a, b) {
    if (a.location.y < b.location.y) return -1;
    else if (a.location.y > b.location.y) return 1;
    else if (a.location.x < b.location.x) return -1;
    else if (a.location.x > b.location.x) return 1;
    else return 0;
}

module.exports = GameBoard;

},{"events":5}],5:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[1]);
