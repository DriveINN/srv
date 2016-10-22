var models = require("../models"),
    db = require("../helpers/db"),
    parse = require('co-body'),
    common = require('./common'),
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

module.exports.add = function * () {
    var user = yield usersController.getUserFromHeader(this),
        data = yield parse(this),
        guid = common.generateGuid(),
        car = yield models.cars.create({
            guid: guid,
            uguid: user.guid,
            fuel: data['fuel'],
            number: data['number'],
            label: data['label'],
            ammount: parseInt(data['ammount'])
        });
        this.body = car;
};