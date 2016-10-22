var models = require("../models"),
    db = require("../helpers/db"),
    usersController = require('./users');

module.exports.listCars4User = function * () {
    var user = yield usersController.getUserFromHeader(this),
        cars = yield models.cars.findAll({
            where: {
                uguid: user.guid
            }
        });
    this.body = cars;
};