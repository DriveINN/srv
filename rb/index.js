
var request = require('request');
var util = require('util');
var cfg = require('../config/config');

exports.query = function (method, params)
{
    return new Promise(function(resolve, reject)
    {
        var url = cfg.rb.baseUrl + cfg.rb.version + '/' + cfg.rb.partner + '/' + method + '.do';
        request.post({
            url: url,
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
            console.log('url:', url);
            console.log('reply:', body);
            try
            {
                var reply = JSON.parse(body);
            }
            catch(e)
            {
                reply = {
                    errorCode: -1,
                    errorMessage: 'Invalid JSON',
                    errorCause: body
                };
            }
            if (reply.errorCode !== 0)
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
    this.errorCode = jsonError.errorCode;
    this.errorCause = jsonError.errorCause;
};
util.inherits(exports.APIError, Error);
