'use strict';

var GameBoard = require('../index');
//var canvas = document.getElementById('gameCanvas');
var canvas = document.createElement('canvas');
canvas.id  = 'gameCanvas';
document.body.appendChild(canvas);
var resemble = require('node-resemble.js');
var test = require('tape');

var baseline = new Image();
var woman = new Image();
var man = new Image();
var grass = new Image();
var tree = new Image();
var screenShot = new Image();

/* jshint ignore:start */
baseline.src = 'data:image/png;base64,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';
woman.src = 'data:image/png;base64,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';
man.src = 'data:image/png;base64,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';
grass.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAAZQTFRFSrVD////WpzGYAAAAAFiS0dEAf8CLd4AAAAJcEhZcwAACxMAAAsTAQCanBgAAAAMSURBVAjXY2AgDQAAADAAAceqhY4AAAAldEVYdGRhdGU6Y3JlYXRlADIwMTQtMDktMDFUMTI6MDE6MTgrMDI6MDARLnnyAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE0LTA5LTAxVDEyOjUyOjA3KzAyOjAwwPGmeAAAAABJRU5ErkJggg==';
tree.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAABi5JREFUeNrUWj2LG1cUPTIrg9TsFAuCIMZgD0jCUwoVaqIg3G3nZiFkq4T8hxCwt/F/CEklE1CTbjuzRG6mECrHjARjgwdhWNhi1EhgFUoxc97e9zSjlXa1Dvsazed7536de+8bFVarFR7yeIQHPh68AAfy5I/2z3uZ9K39LNMvf4o+FvYx/6/eX9kC7Av44emFujYPayg7k+R+r7vapyB7daG39rNVsT1FsT3FPKyhVa+gVa+g7EzQqldAwYrtaa6F7uxCu4wRFisACGwXAFBsTxXY4fgSw/H1s8PxpbpediaYA3iLRIhG5AMAmigVvokAEnixPUURUwDA0qsCqatwUPOJQJfKpZZeVQkdtq3kPPJXtxHkYFfg4YmVLI6pAkIwBJs3WvUKhkgsUHYmmPW6miAAgH68kyAH24IncAlaus48rCkNd45jTetZYx7WlNByzvAESpBthHi0LXinH8PpxyoQX7zxNTBLr6qEoM9T69KVJGCyE4O/2J6qdcITS1n9zizk9GMEtosvv19qGi62EzciIKnJ4Th5lpaQFjIFLzsTdI5jMLYC24XTj+9OoybTSE43NUjLSEvkHfPdpVdVtDscX6JzHKscwjVvssLWeYC+vsmn886lEAQtBZExJAmBQtxKgBEWq8B2FeuQNaitLGBlZ6KsIAfPaaUsdqLbkZk4AtvdaIWNFmhEPpx+jEbkY9br4vD0QsuspkXoYlIIapzA+c6s10WxPcWs18VwfImlV0WrXtHezRJ2JxqV1MnJ5mENQyRCDM4tHJ5eaMmJwHidgOdhbU27S6+KRuQj6HXx4o2fWtZac11EO7oQTUYmYLqXQKk1ec2kR+lKWflDHpsUK+9votRcCwS2i8PTC3TqwDvPRaPvI7BdNCIfoQg4c0GTbWS2laPsTDDzqkmgesA8VdjMThQWwFVWSeaIt3MhBq9c8PD0AoEwP12qEflKUII2fZg5w0xmUkgCJkjOCVTUPAFcIPLXsnOuBZZeFXMAQ0w0YLSCXJC+zopTL+oquTXS2pyispXJ0HQ/OQqyqf+l/eMqPLEUL2ugjOzJBU12MWkxizIH55aiZRO4OQ+FICanH+NP7+9CbhBnlQU0NxsUmrkR+VopQZ+X5YOshQgojyY5d6te0VwsC1OuAI3I116mtqRGZaaUDMV787CmFXayLsrL3FIYNj6Dc0t7nmttFCCwXY27mWCkFll4ZZUTzMisdUwtEsjSq6oiEcDanK16RWO0sjPJLC0ONtU+ZBvJHNdBbWUEdWLBLxtqokSQGGY7SqYanFui2rXWaqetBGDZMM/hcgKRlEnzBraLYmipa+y0KKSiRN4/sQzGs/DuNxdIn2Vgm1k8U4AmSgVE/iqwXS3yZZKaCcAEYlaOZCk98OLcQKQiZhnBLSvVRuRjqzxAcHNjEjkxwVOjppnlfbqafEZdw1TtVJiMRDKQCrnRhZooFVh3qMATEzLAv+vHqkOTFKg6tvR5eSyfkd1cMtdES4pZCSyrR76xqacfq75X3Ym1WJH7PtwTkswiOX4Qpucp0ADXcSPXkElup2q0iVKhEfkZfqz3yNIlBueWRre8JhnMzOoyBsweWJJDlu/faAG+MMJiJQNW0qBkpMPTCwzHdKE0IeG6+RkisQz7BclkWRl32x27G11ITZDunGU1JGovR2RSM2+YgFlOS5aSgbrtxtbWTX0TpUI66Zk0bWC7ay4263UVb8tjCV6WBunvAMCZWOfeNne/TwXCCIvrQE/ZQ2rZPOaWidkLmHPf2/b6CIvXjE8JXnZizJxs7nls7mIIy+atcb/b66nJO9kxUVujxKw9IiCmFQff/PuA1OAIC42zzSpUtZ+iBjIU8b98oenQ/Pw1072ZRwSno4kSXh59gmnFXYfWUm7zkW+Exb8SfM4zudbieHL0QR3/c/VUWaKJ0g+7fOS7jQXeSxASyAgLjLDAy6NP1K50k4EU7PPVc+3XnPs+Y+CVAU5qfZBqtCP9+2v1a+fx9DGF6NAan6+ey/feN1F6/c2D2NBgZmCm4LV7FOQu4G8twOer53hy9EGBT7V4tmUyujXYfQlwNsLi1ejqKXDt02cSVF4y2ifwTBZ6iOPB/9njvwEApmm8ahiqKhMAAAAASUVORK5CYII=';
/* jshint ignore:end */

var assets = {
    woman: woman,
    man: man,
    grass: grass,
    tree: tree
};

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

test('comparing canvas image to baseline image for exact match', function (t) {

    t.plan(1);

    setTimeout(function () {
        save();
    }, 2000);

    function save(){
        // get the data
        screenShot.src = canvas.toDataURL('image/png');
        var imgData = screenShot.src.replace(/^data:image\/\w+;base64,/, '');
        var baseData = baseline.src.replace(/^data:image\/\w+;base64,/, '');
        var buf1 = new Buffer(imgData, 'base64');
        var buf2 = new Buffer(baseData, 'base64');
        resemble(buf1).compareTo(buf2).ignoreColors().onComplete(function(data){
            console.log(data);
            var mismatch = parseFloat(data.misMatchPercentage);
            t.ok(!mismatch, 'no mismatch');
            t.end();
        });
    }
});