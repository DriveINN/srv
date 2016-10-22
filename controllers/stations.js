var models = require("../models");

module.exports.getStationById = function * (guid) {

    var station = yield models.stations.findOne({
        where: {
            guid: guid
        }
    });
    this.body = station;
};

module.exports.getStationGoods = function * (guid) {

    var goods = yield models.goods.findAll({
        where: {
            sguid: guid,
            isFuel: false
        }
    });
    this.body = goods;
};

module.exports.getStationFuel = function * (guid) {

    var fuels = yield models.goods.findAll({
        where: {
            sguid: guid,
            isFuel: true
        }
    });
    this.body = fuels;
};
