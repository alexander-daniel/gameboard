'use strict';

var EventEmitter = require('events').EventEmitter;
var hat = require('hat');

function GameBoard (opts) {
    if (!(this instanceof GameBoard)) return new GameBoard(opts);

    this.controller    = opts.controller || new EventEmitter();
    this.tiles         = opts.tiles || {};
    this.units         = opts.units || {};
    this.sortedUnits   = [];
    this.TILESIZE      = opts.TILESIZE || 16;
    this.FPS           = opts.FPS || 30;
    this.canvas        = opts.canvas;
    this.canvas.height = opts.height * this.TILESIZE || window.innerHeight;
    this.canvas.width  = opts.width * this.TILESIZE || window.innerWidth;
    this.context       = opts.canvas.getContext('2d');
    this.context.imageSmoothingEnabled = false;
    this.grid          = opts.grid || false;
    this.assets        = opts.assets || {};
    this.viewOrigin    = { x: 0, y: 0 };
}

var proto = GameBoard.prototype;

proto.tileUpdate = function (tiles) {
    var self = this;
    
    tiles.forEach(manageTile);
    var tileUnits = self.scrapeUnits(tiles);
    tileUnits.forEach(manageUnit);

    function manageUnit (unit) {
        if (!unit.id) unit.id = hat();
        self.units[unit.id] = unit;
        self.sortUnits();
    }

    function manageTile (tile) {
        var tileKey = tile.location.x + ':' + tile.location.y;
        self.tiles[tileKey] = tile;
    }
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
        self.context.drawImage(self.assets[tile.style.toLowerCase()], tilePosition.x + 0.5, tilePosition.y + 0.5);
    }

    function drawUnit (unit) {
        var unitPrepLocation = {
            x : (unit.location.x - Math.floor(unit.size[0] / 2)),
            y : (unit.location.y - unit.size[1] + 1)
        };

        var unitPosition = self.getPosition(unitPrepLocation);
        self.context.drawImage(self.assets[unit.style.toLowerCase()], unitPosition.x + 0.5, unitPosition.y + 0.5);
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
            self.draw();
        }, 1000 / FPS);
    }

    render();

    self.mouseDown = false;
    self.translatePos = {
        x: self.canvas.width / 2,
        y: self.canvas.height / 2
    };
    
    window.onkeydown = function(e) {
        if (e.which === 37) self.viewOrigin.x += 16; //'left'
        if (e.which === 38) self.viewOrigin.y += 16; //'up'
        if (e.which === 39) self.viewOrigin.x -= 16; //'right'
        if (e.which === 40) self.viewOrigin.y -= 16; //'down'
        else return;
    };

    // when the window is resized, reset the draw zone
    window.onresize = function() {
        self.canvas.height = window.innerHeight;
        self.canvas.width = window.innerWidth;
        self.context.imageSmoothingEnabled = false;
    };

    self.startDragOffset = {};
    self.canvas.addEventListener('mousedown', function(evt) {
        self.mouseDown = true;
        self.startDragOffset.x = evt.clientX - self.viewOrigin.x;
        self.startDragOffset.y = evt.clientY - self.viewOrigin.y;
    });

    self.canvas.addEventListener('mouseup', function() {
        self.mouseDown = false;
    });

    self.canvas.addEventListener('mouseout', function() {
        self.mouseDown = false;
    });

    self.canvas.addEventListener('mousemove', function(evt) {
        if (self.mouseDown) {
            self.viewOrigin.x = (evt.clientX - self.startDragOffset.x);
            self.viewOrigin.y = (evt.clientY - self.startDragOffset.y);
        }
    });
};

proto.addUnit = function (unit) {
    if (!unit.id) unit.id = hat();
    this.units[unit.id] = unit;
    this.sortUnits();
};

proto.addTile = function (tile) {
    return this.tileUpdate([tile]);
};

proto.scrapeUnits = function (tiles) {
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

    return units;
};

proto.sortUnits = function () {
    var self = this;
    var units = self.units;
    var unitArray = [];
    Object.keys(units).forEach(function (unitId) {
        var unit = units[unitId];
        unitArray.push(unit);
    });

    if (unitArray.length > 1) unitArray.sort(compare);
    self.sortedUnits = unitArray;
};

proto.getPosition = function (location) {
    var self = this;

    var position = {
        x : (location.x * self.TILESIZE) + self.viewOrigin.x,
        y : (location.y * self.TILESIZE) + self.viewOrigin.y
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
