var koa = require('koa'),
    serveStatic = require('koa-static'),
    app = module.exports = koa();

app.use(serveStatic(__dirname + './../web/'));

app.listen(3000);
console.log('server is running');