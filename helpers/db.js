var models = require('../models/'),
    Sequelize = require('sequelize');

function validateValue(type, value) {
    if (type instanceof Sequelize.STRING)
        return Sequelize.Validator.toString(value);
    if (type instanceof Sequelize.INTEGER)
        return Sequelize.Validator.toInt(value);
    if (type instanceof Sequelize.BIGINT)
        return Sequelize.Validator.toInt(value);
    if (type instanceof Sequelize.BOOLEAN)
        return Sequelize.Validator.toBoolean(value);
    if (type instanceof Sequelize.DATE)
        return Sequelize.Validator.toDate(value);
    if (type instanceof Sequelize.TEXT)
        return Sequelize.Validator.toString(value);
    if (type instanceof Sequelize.ARRAY) {
        try {
            return JSON.parse(value);
        } catch (e) {
            return [value];
        }
    }
    return null;
}

function createWhere (model, where, defaultWhere) {
    var result = {},
        regEx = new RegExp('^([a-zA-Z]*\\.?[a-zA-Z]*)(>=|<=|<>|<|>|=|{}|~)(.*)$'),
        addWhere = function (modelName, attr, op, value) {
            var opTable = {
                '>': '$gt',
                '>=': '$gte',
                '<': '$lt',
                '<=': '$lte',
                '<>': '$ne',
                '~': '$like',
                '{}': '$overlap'
            };
            value = validateValue(attr.type, value.toString());
            if (!result[modelName]) {
                result[modelName] = {};
            }
            if (op === '=') {
                result[modelName] [attr.fieldName] = value;
            }
            else {
                if (!result[modelName] [attr.fieldName]) {
                    result[modelName][attr.fieldName] = {};
                }
                if (result[modelName][attr.fieldName][opTable[op]] && opTable[op] === '$like') {
                    result[modelName][attr.fieldName][opTable[op]] = {
                        '$any': result[modelName][attr.fieldName][opTable[op]]['$any'] ?
                            [].concat(result[modelName][attr.fieldName][opTable[op]]['$any'], value) :
                            [].concat(result[modelName][attr.fieldName][opTable[op]], value)
                    }
                } else {
                    result[modelName][attr.fieldName][opTable[op]] = value;

                }
            }
        },
        w = [];
    if (Object.keys(where).length) {
        if (!(where instanceof Array))
            where = [where];
        where.forEach(function (we) {
            var parts = regEx.exec(we),
                modelName,
                attribute;
            if (parts === null) {
                return;
            }
            if (parts[1].split('.').length > 1) {
                modelName = parts[1].split('.')[0];
                attribute = parts[1].split('.')[1];
            } else {
                modelName = model.name;
                attribute = parts[1];
            }
            if (models[modelName] && ~Object.keys(models[modelName].attributes).indexOf(attribute)) {
                addWhere(modelName, models[modelName].attributes[attribute], parts[2], parts[3]);
                w.push([modelName, attribute, parts[2], parts[3]])
            }
        });
    }

    if (defaultWhere) {
        Object.keys(defaultWhere).forEach(function (key) {
            var modelName,
                attribute;
            if (key.split('.').length > 1) {
                modelName = key.split('.')[0];
                attribute = key.split('.')[1];
            } else {
                modelName = model.name;
                attribute = key;
            }
            if (!result[modelName]) {
                result[modelName] = {};
            }
            if (result[modelName][attribute] === undefined) {
                result[modelName][attribute] = defaultWhere[key];
            }
        });
    }
    return {
        where:result,
        w:w
    };
}

function createOrder (model, order) {
    var result = [],
        o = [];

    if (!(order instanceof Array))
        order = [order];
    if (!order.length) {
        return {
            order: result,
            o: o
        };
    }

    order.forEach(function (od) {
        if (od.split('~').length == 2 && ~['asc', 'desc'].indexOf(od.split('~')[1].toLowerCase())) {
            var attribute = od.split('~')[0],
                sort = od.split('~')[1],
                modelName,
                parentModel,
                attrs;
            if (attribute.split('.').length === 2) {
                modelName = attribute.split('.')[0];
                attribute = attribute.split('.')[1];
            } else if (attribute.split('.').length === 3) {
                parentModel = attribute.split('.')[0];
                modelName = attribute.split('.')[1];
                attribute = attribute.split('.')[2];
            } else {
                modelName = model.name
            }
            if (models[modelName] && (parentModel ? models[parentModel] : 1)) {
                attrs = Object.keys(models[modelName].attributes);
                if (~attrs.indexOf(attribute)) {
                    if (modelName === model.name) {
                        result.push([attribute, sort]);
                    } else if (parentModel) {
                        result.push([
                            {
                                model: models[parentModel],
                                as: parentModel
                            }, {
                                model: models[modelName],
                                as: modelName
                            },
                            attribute,
                            sort
                        ]);
                    } else  {
                        result.push([
                            {
                                model: models[modelName],
                                as: modelName
                            },
                            attribute,
                            sort
                        ]);
                    }
                    o.push([modelName, attribute, sort])
                }
            }
        }
    });
    return {
        order: result,
        o: o
    };
}

module.exports.syncData = function () {
    var syncData = require('../config/sync-data.json');
    syncData.forEach(function (d) {
        if (d.sync) {
            models[d.name].destroy({where: {}});
            var tmpData = require(d.require);
            tmpData.forEach(function (n) {
                models[d.name].create(n);
            });
        }
    });
};

module.exports.queryOptions = function (options) {
    var queryString = options.queryString || [],
        start = Math.max(queryString['offset'] || ((options.default && options.default.start) ? options.default.start : 0), 0),
        count = queryString['limit'] || ((options.default && options.default.count) ?  options.default.count : 10),
        where,
        newWhere = [],
        newOrder = [],
        order,
        o,
        w,
        result = {};
    if (count !== 'all') {
        result.limit = Math.max(count, 1);
    }
    if (start) {
        result.offset = start;
    }

    /*
     where и order можно задавать двумя способами, а также комбинировать их:
     where=topic~aaaa&
     where=status~draft|and|addedDate<1
     */


    /* prepare order */
    order = queryString['order'] || [];
    if (Object.keys(order).length) {
        if (!Array.isArray(order)) {
            order = [order]
        }
        order.forEach(function (o) {
            o.split('|and|').forEach(function (a) {
                newOrder.push(a);
            });
        });
    }
    order = newOrder;
    order = createOrder(options.model, order);
    o = order.o;
    order = order.order;
    order =  order.length ? order : ((options.default && options.default.order) ? options.default.order : []);
    if (order.length) {
        result.order = order;
    }
    /* prepare order */

    /* prepare where */
    where = queryString['where'] !== undefined ? queryString['where'] : {};
    if (Object.keys(where).length) {
        if (!Array.isArray(where)) {
            where = [where]
        }
        where.forEach(function (w) {
            w.split('|and|').forEach(function (a) {
                newWhere.push(a);
            });
        });
    }
    where = newWhere;
    where = createWhere(options.model, where, (options.default && options.default.where) ? options.default.where : {});
    w = where.w ? where.w : (options.default && options.default.where) ? options.default.where : [];
    where = where.where;
    result.where = where[options.model.name] ? where[options.model.name] : {};
    /* prepare where */

    if (options.include && Object.keys(options.include).length) {
        result.include = [];
        Object.keys(options.include).forEach(function (inc) {
            var name = options.include[inc].model.name;
            if (where[name]) {
                options.include[inc].where = where[name]
            }
            if (options.include[inc].include && options.include[inc].include.length) {
                options.include[inc].include.forEach(function (i) {
                    var n = i.model.name;
                    if (where[n]) {
                        i.where = where[n]
                    }
                });
            }
            result.include.push(options.include[inc]);

        });
    }
    result.dump ={
        where: w,
        order: o
    };
    return result;
};