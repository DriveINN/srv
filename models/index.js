var fs = require('fs'),
    path = require('path'),
    config = require('../config/config'),
    Sequelize = require('sequelize'),
    sequelize = new Sequelize(config.database.database, config.database.user, config.database.password, {
        host: config.database.server,
        dialect: 'postgres',
        define: {
            timestamps: false
        },
        dialectOptions: {
            encrypt: true
        }
    }),
    db = {};

fs.readdirSync(__dirname).filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
}).forEach(function(file) {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
});

Object.keys(db).forEach(function(modelName) {
    if ('associate' in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
