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
            osType: 'Android',
            appVersion: '0.1',
            osVersion: '4.2',
            uniqueDeviceId: 'driveinn_web' + phone
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