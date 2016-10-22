var parse = require('co-body'),
    models = require("../models"),
    rb = require('../rb');

exports.getBindings = function * () {
    var body = yield parse(this);
    var sessionId = body['sessionId'];
    if (!sessionId)
    {
        this.status = 400;
        return;
    }

    try
    {
        var result = yield rb.query('getBindings', {
            sessionId: sessionId,
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
exports.createVerifyPayment = function * () {
    var body = yield parse(this);
    var sessionId = body['sessionId'];
    var pan = body['pan'];
    var expiry = body['expiry'];
    var cvc = body['cvc'];
    if (!sessionId || !pan || !expiry || !cvc)
    {
        this.status = 400;
        return;
    }

    try
    {
        var result = yield rb.query('createVerifyPayment', {
            sessionId: sessionId,
            pan: pan,
            expiry: expiry,
            cvc: cvc,
            mnemonic: 'Card *****' + pan.slice(-4),
            cardholderName: 'Drive INN',
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
exports.getPaymentResult = function * () {
    var body = yield parse(this);
    var sessionId = body['sessionId'];
    var mdOrder = body['mdOrder'];
    if (!sessionId || !mdOrder)
    {
        this.status = 400;
        return;
    }

    try
    {
        var result = yield rb.query('getPaymentResult', {
            sessionId: sessionId,
            mdOrder: mdOrder,
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