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
