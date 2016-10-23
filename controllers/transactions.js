var models = require("../models"),
    db = require("../helpers/db"),
    models = require("../models"),
    parse = require('co-body'),
    common = require('./common'),
    usersController = require('./users');

module.exports.listTR4User = function * () {
    var user = yield usersController.getUserFromHeader(this),
        transactions = yield models.transactions.findAll({
            where: {
                uguid: user.guid
            },
            order: [['date', 'DESC']]
        });
    this.body = transactions;
};

module.exports.make = function * () {
    var user = yield usersController.getUserFromHeader(this);
    var body = yield parse(this);
    var stationGuid = body['stationGuid'];
    var card = body['card'];
    var station = yield models.stations.findOne({
        where: {
            guid: stationGuid
        }
    });
    if (!station || ['f92', 'f95', 'f95U', 'f98', 'fd', 'bonus', 'creditcard'].indexOf(card) === -1)
    {
        this.status = 400;
        this.body = 'invalid card or station';
        return;
    }

    try
    {
        var goodsJson = JSON.parse(body['goods'])
    }
    catch(e)
    {
        console.log(body['goods'], e);
        this.body = 'invalid goods';
        this.status = 400;
        return;
    }

    var goods = yield models.goods.findAll({
        where: {
            guid: goodsJson.map(g => g.guid)
        }
    });
    var totalCost = goods.reduce(function(totalCost, good){
        var oneCost = good && card !== 'creditcard' ? 1 : good.price;
        return totalCost + oneCost * goodsJson.find(g => g.guid == good.guid).ammount;
    }, 0);
    if (card !== 'creditcard' && (goods.length !== 1 || !(goods[0].name === card || card === 'bonus')))
    {
        this.body = {
            errorCode: 24,
            errorCause: 'PAYMENT_DECLINED',
            message: 'С топливной карты можно платить только за соответствующее топливо'
        };
        return
    }
    if (card !== 'creditcard' && totalCost > user[card])
    {
        this.body = {
            errorCode: 24,
            errorCause: 'PAYMENT_DECLINED',
            message: 'Недостаточно средств'
        };
        return;
    }
    var tr = yield models.transactions.create({
        guid: common.generateGuid(),
        date: new Date(),
        card: card,
        total: goods.length === 1 && goods[0].isFuel && card === 'creditcard' ? totalCost : -totalCost,
        bouns: card !== 'creditcard' ? 0 : totalCost/10 | 0,
        goods: goods.map(g => ({
            ammount: goodsJson.find(gj => gj.guid == g.guid).ammount + (g.isFuel ? ' лит.' : ' шт.'),
            description: g.isFuel ? g.name.replace('f', 'АИ-') : g.name
        })),
        sguid: stationGuid,
        uguid: user.guid
    });
    if (card !== 'creditcard')
    {
        user[card] = user[card] - totalCost;
        yield user.save();
    }
    this.body = tr;
};
