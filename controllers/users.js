var jwt = require('koa-jwt'),
    models = require("../models");

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
