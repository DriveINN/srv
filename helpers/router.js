var Router = require('koa-router'),
    models = require('../models/'),
    controllers = require('../controllers'),
    jwt = require('koa-jwt');

module.exports.createRoutes = function (app, mode) {
    var routes = require('../config/routes');
    function bindRoute (route, r) {
        route[r.type](r.postfix, function * () {
            return yield checkGroupAcess.bind(this)(r);
        });
    }
    function * checkGroupAcess (r) {
        var user = yield controllers.users.getUserFromHeader(this);
        if (!r.accessGroups || (r.accessGroups.length && user && r.accessGroups.indexOf && user.groups.some(function (group) {return ~r.accessGroups.indexOf(group)}))) {
            return yield (r.method.bind(this))(this.params[Object.keys(this.params)[0]])
        }
        return yield  controllers.common.accessDenied;
    }
    Object.keys(routes[mode]).forEach(function (key) {
        var version = key,
            vRoutes = routes[mode][version],
            aRoutes = routes[mode].actual,
            route = new Router({
                prefix: '/api' + (version === 'actual' ? '' : '/' + version)
            });
        vRoutes.forEach(function (r) {
            bindRoute(route, r);
            aRoutes = aRoutes.filter(function (el) {
                return el.postfix !== r.posix;
            });
        });
        aRoutes.forEach(function (r) {
            bindRoute(route, r);
        });
        app.use(route.routes());
        app.use(route.allowedMethods());

    });
};

