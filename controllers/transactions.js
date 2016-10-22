var models = require("../models"),
    db = require("../helpers/db"),
    parse = require('co-body'),
    common = require('./common'),
    usersController = require('./users');

module.exports.listTR4User = function * () {
    var user = yield usersController.getUserFromHeader(this),
        transactions = yield models.transactions.findAll({
            where: {
                uguid: user.guid
            }
        });
    this.body = transactions;
};
