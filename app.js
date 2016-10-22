var koa = require('koa'),
    co = require('co'),
    serveStatic = require('koa-static'),
    jwt = require('koa-jwt'),

    models = require('./models'),
    db = require('./helpers/db'),
    router = require('./helpers/router'),
    cfg = require("./config/config"),

    app = module.exports = koa();

app.use(serveStatic(__dirname + '/../web/'));

router.createRoutes(app, 'free');

app.use(jwt({ secret: cfg.token.secret }));

router.createRoutes(app, 'locked');



if (!module.parent) {

    co(function * (){

        try {
            yield models.sequelize.authenticate();
            models.sequelize.sync();
            db.syncData();
        } catch (e) {
            console.log(e);
            return;
        }
        app.listen(3000);
        console.log('server is running');
    });
}
