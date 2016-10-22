var forever = require('forever-monitor'),
    fs = require('fs'),
    watchIgnorePatterns = [
        'node_modules/**',
        '.git/**',
        'logs/**',
        '.idea/**',
        'images/**'
    ],
    date = (new Date ()).getTime(),
    logFiles = {
        log: date + '.log',
        out: date + '.out',
        err: date + '.err'
    };

Object.keys(logFiles).forEach(function (fileName) {
    fs.writeFileSync('logs/' + logFiles[fileName], '', {
        flag: 'wx'
    });
});

var child = new(forever.Monitor)('./app.js', {
    'watch': true,
    'watchDirectory': './',
    'watchIgnoreDotFiles': true,
    'watchIgnorePatterns': watchIgnorePatterns,
    'logFile': fs.existsSync('./logs/' + logFiles.log) ? './logs/' + logFiles.log : console.log('./logs/' + logFiles.log),
    'outFile': fs.existsSync('./logs/' + logFiles.out) ? './logs/' + logFiles.out : console.log('./logs/' + logFiles.log),
    'errFile': fs.existsSync('./logs/' + logFiles.err) ? './logs/' + logFiles.err : console.log('./logs/' + logFiles.log)
});

child.on('watch:restart', function(info) {
    console.error('Restarting script because ' + info.stat + ' changed');
});

child.start();