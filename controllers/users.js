var jwt = require('koa-jwt'),
    parse = require('co-body'),
    models = require("../models"),
    common = require("../controllers/common"),
    cfg = require("../config/config"),
    rb = require('../rb');

function * getUserFromHeader (query, includeUserData) {
    var authHeader = query.header.authorization ? query.header.authorization.split('Bearer ') : [],
        token = authHeader.length > 1 ? authHeader[1] : null,
        dToken = token ? jwt.decode(token) : null,
        userLogin = dToken ? dToken.user : '';
    return user = userLogin ? yield models.users.findOne({
        where: {
            login: userLogin
        }
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
        login: phone,
        groups: ['confirmed']
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
    var phone = this.query['phone'];
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
    this.status = 200;
    this.body = {
        status: result.errorCode === 0
    };
};
module.exports.registerComplete = function * ()
{
    var body = yield parse(this);
    var sessionId = body['sessionId'];
    var verificationCode = body['verificationCode'];
    var phone = body['phone'];
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
        result = yield rb.query('authenticate', {
            username: phone,
            password: 'driveinn',
            passwordType: 'STRING',
            imei: '354190023896443',
            uniqueDeviceId: 'driveinn_app_' + phone,
            timeZone: '+3',
            appVersion: '0.1',
            osType: 'iOS',
            osVersion: '9.2',
            deviceModel: 'driveinn'
        });
        result.token = jwt.sign(
            {
                user: phone
            },
            cfg.token.secret,
            {
                expiresIn: cfg.token.expires
            });
        var user = yield createOrFindUser(phone);
        prepareOutput(user);
        result.user = user;
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
    var username = body['phone'];
    var pin = body['pin'];
    if (!username || !pin)
    {
        this.status = 400;
        return;
    }

    try
    {
        var result = yield rb.query('authenticate', {
            username: username,
            password: pin,
            passwordType: 'PIN',
            imei: '354190023896443',
            uniqueDeviceId: 'driveinn_app_' + username,
            timeZone: '+3',
            appVersion: '0.1',
            osType: 'iOS',
            osVersion: '9.2',
            deviceModel: 'driveinn'
        });
        if (result.errorCode === 0)
        {
            result.token = jwt.sign(
                {
                    user: username
                },
                cfg.token.secret,
                {
                    expiresIn: cfg.token.expires
                }
            );
            var user = yield createOrFindUser(username);
            prepareOutput(user);
            result.user = user;
        }
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
module.exports.changeUser = function * ()
{
    var body = yield parse(this);
    var sessionId = body['sessionId'];
    var email = body['email'];
    var firstName = body['firstName'];
    var lastName = body['lastName'];
    if (!sessionId || !email || !firstName || !lastName)
    {
        this.status = 400;
        return;
    }

    try
    {
        var result = yield rb.query('changeUser', {
            sessionId: sessionId,
            email: email,
            firstName: firstName,
            lastName: lastName
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

module.exports.changeUserAndSetPin = function * ()
{
    var body = yield parse(this);
    var sessionId = body['sessionId'];
    var email = body['email'];
    var firstName = body['firstName'];
    var lastName = body['lastName'];
    var pin = body['pin'];
    if (!sessionId || !email || !firstName || !lastName)
    {
        this.status = 400;
        return;
    }

    try
    {
        var result = yield rb.query('changePassword', {
            sessionId: sessionId,
            passwordType: 'PIN',
            password: undefined,
            newPasswordType: 'PIN',
            newPassword: pin,
            isMobile: true
        });
        result = yield rb.query('changeUser', {
            sessionId: sessionId,
            email: email,
            firstName: firstName,
            lastName: lastName
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
module.exports.renewUserSession = function * ()
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
        var result = yield rb.query('renewUserSession', {
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

module.exports.getFuelCardHistory = function * (card) {

    var user = yield getUserFromHeader(this),
        transactions = yield models.transactions.findAll({
            where: {
                uguid: user.guid,
                card: card
            }
        });
    this.body = transactions;
};