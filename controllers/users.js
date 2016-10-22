var jwt = require('koa-jwt'),
    parse = require('co-body'),
    models = require("../models"),
    common = require("../controllers/common"),
    rb = require('../rb');

function * getUserFromHeader (query, includeUserData) {
    var authHeader = query.header.authorization ? query.header.authorization.split('Bearer ') : [],
        token = authHeader.length > 1 ? authHeader[1] : null,
        dToken = token ? jwt.decode(token) : null,
        userLogin = dToken ? dToken.user : '';
    return user = userLogin ? yield models.users.findOne({
        where: {
            login: userLogin
        },
        include: includeUserData ? [{
            model: models.usersdata,
            as: 'usersdata'
        }] : []
    }) : null;
}


function prepareOutput (user) {
    delete user.pwdhash;
    delete user.pwdsalt;
    delete user.SMS;
    return user;
}

module.exports.getUserFromHeader = getUserFromHeader;

module.exports.prepareOutput = prepareOutput;

var createOrFindUser = function * (phone) {
    var user = yield models.users.findOne({
        where: {
            login: phone
        }
    });
    if (user)
        return user;
    return yield models.users.create({
        guid: common.generateGuid(),
        login: phone
    });
};

module.exports.register = function * ()
{
    var body = yield parse(this);
    var phone = body['phone'];
    if (phone == undefined)
    {
        this.status = 400;
        return;
    }

    try
    {
        var result = yield rb.query('register', {
            username: phone,
            phone: phone,
            email: 'romanov4400@gmail.com',
            firstName: 'driveinn',
            lastName: 'driveinn',
            deviceModel: 'driveinn',
            timeZone: '-3',
            password: 'driveinn',
            osType: 'iOS',
            appVersion: '0.1',
            osVersion: '4.2',
            uniqueDeviceId: 'driveinn_app_' + phone
        });

        var user = yield createOrFindUser(phone);
    }
    catch(e)
    {
        result = e;
    }
    console.log(result);
    this.status = 200;
    this.body = result;
};
module.exports.check = function * ()
{
    var body = yield parse(this);
    var phone = body['phone'];
    if (phone == undefined)
    {
        this.status = 400;
        return;
    }

    try
    {
        var result = yield rb.query('checkUser', {
            phone: phone
        });
    }
    catch(e)
    {
        result = e;
    }
    console.log(result);
    this.status = 200;
    this.body = result;
};
module.exports.registerComplete = function * ()
{
    var body = yield parse(this);
    var sessionId = body['sessionId'];
    var verificationCode = body['verificationCode'];
    if (!sessionId || !verificationCode)
    {
        this.status = 400;
        return;
    }

    try
    {
        var result = yield rb.query('completeRegistration', {
            sessionId: sessionId,
            verificationCode: verificationCode
        });
    }
    catch(e)
    {
        result = e;
    }
    console.log(result);
    this.status = 200;
    this.body = result;
};
module.exports.authenticate = function * ()
{
    var body = yield parse(this);
    var username = body['username'];
    var password = body['password'];
    var passwordType = body['passwordType'];
    var imei = body['imei'];
    if (!username || !password || !passwordType || !imei)
    {
        this.status = 400;
        return;
    }

    try
    {
        var result = yield rb.query('authenticate', {
            username: username,
            password: password,
            passwordType: passwordType,
            imei: imei,
            uniqueDeviceId: 'driveinn_app_' + username,
            timeZone: '+3',
            appVersion: '0.1',
            osType: 'iOS',
            osVersion: '9.2',
            deviceModel: 'driveinn'
        });
    }
    catch(e)
    {
        result = e;
    }
    console.log(result);
    this.status = 200;
    this.body = result;
};
module.exports.logout = function * ()
{
    var body = yield parse(this);
    var sessionId = body['sessionId'];
    if (!sessionId)
    {
        this.status = 400;
        return;
    }

    try
    {
        var result = yield rb.query('logout', {
            sessionId: sessionId
        });
    }
    catch(e)
    {
        result = e;
    }
    console.log(result);
    this.status = 200;
    this.body = result;
};
module.exports.changePassword = function * ()
{
    var body = yield parse(this);
    var sessionId = body['sessionId'];
    var passwordType = body['passwordType'];
    var password = body['password'] || undefined;
    var newPasswordType = body['newPasswordType'];
    var newPassword = body['newPassword'];
    if (!sessionId || !passwordType || !newPasswordType || !newPassword)
    {
        this.status = 400;
        return;
    }

    try
    {
        var result = yield rb.query('changePassword', {
            sessionId: sessionId,
            passwordType: passwordType,
            password: password,
            newPasswordType: newPasswordType,
            newPassword: newPassword,
            isMobile: true
        });
    }
    catch(e)
    {
        result = e;
    }
    console.log(result);
    this.status = 200;
    this.body = result;
};