'use strict';


var woman = new Image();
var man = new Image();
var grass = new Image();
var tree = new Image();

woman.src = './assets/woman.png';
man.src = './assets/man.png';
grass.src = './assets/grass.png';
tree.src = './assets/tree.png';

var assets = {
    woman: woman,
    man: man,
    grass: grass,
    tree: tree
};

var GameBoard = require('./index');
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
