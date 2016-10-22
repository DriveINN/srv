
var request = require('request');
var util = require('util');
var cfg = require('../config/config');

exports.query = function (method, params)
{
    return new Promise(function(resolve, reject)
    {
        request.post({
            url: cfg.rb.baseUrl + cfg.rb.version + '/' + cfg.rb.partner + '/' + method + '.do',
            headers: {
                'Accept-Encoding': 'gzip, deflate',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            qs: params
        }, function(err, httpResponse, body)
        {
            if (err)
            {
                reject(err);
                return;
            }
            var reply = JSON.parse(body);
            if (reply.errorCode !== undefined)
            {
                err = new APIError(reply);
                reject(err);
                return;
            }
            resolve(reply);
        });
    });
};

var APIError = exports.APIError = function(jsonError)
{
    this.message = jsonError.errorMessage;
    this.code = jsonError.errorCode;
    this.cause = jsonError.errorCause;
};
util.inherits(exports.APIError, Error);
