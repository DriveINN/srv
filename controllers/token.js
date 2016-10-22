var parse = require('co-body'),
    jwt = require('koa-jwt'),
    models = require("../models"),
    cfg = require("../config/config"),
    usersController = require('./users');

module.exports.getToken = function * () {
    var data = yield parse(this),
        login = data['login'],
        password = data['password'],
        user;

    if ( login && password ) {

        user = yield models.users.findOne({
            where: {
                login: login
            }
        });
        if (user  && user.encryptPassword(password, user.pwdsalt) !== user.pwdhash) {
            this.status = 200;
            this.body = {
                'errorCode': '4004',
                'error': 'Login or password invalid!'
            };
            return;
        }

        if (!user) {
            this.status = 200;
            this.body = {
                'error': 'no such a user',
                'errorCode': '4002'
            };
            return;
        }

        if (!~user.groups.indexOf('admin') && !~user.groups.indexOf('confirmed')) {
            this.status = 200;
            this.body = {
                'error': 'not allowed to login',
                'errorCode': '4001'
            };
            return;
        }


        this.body = {
            token: jwt.sign(
                {
                    user: user.login
                },
                cfg.token.secret,
                {
                    expiresIn: cfg.token.expires
                }
            ),
            user: usersController.prepareOutput(user.toJSON())
        };

        this.status = 200;
    } else {
        this.status = 200;
        this.body = {
            'error': 'need login && pwd',
            'errorCode': '4003'
        };
    }
};

module.exports.checkToken = function * () {
    var parts,
        scheme,
        token;

    if (!this.header.authorization) {
        this.body = { authorized: false };
        return;
    }
    parts = this.header.authorization.split(' ');
    if (parts.length !== 2) {
        this.body = { authorized: false };
        return;
    }

    scheme = parts[0];

    if (!/^Bearer$/i.test(scheme)) {
        this.body = { authorized: false };
        return;
    }

    token = parts[1];
    try {
        yield jwt.verify(token, cfg.token.secret);
    }
    catch(e) {
        this.body = { authorized: false };
        return;
    }
    this.body = { authorized: true };
};