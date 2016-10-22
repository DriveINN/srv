var fs = require('fs'),
    controllers = {};

fs.readdirSync(__dirname).filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
}).forEach(function(file) {
    var filename = file.split('.js')[0];
    controllers[filename] = require(__dirname + '/' + file);
});

module.exports = controllers;
