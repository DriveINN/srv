var crypto = require('crypto');

module.exports = function(sequelize, DataTypes) {
    var gasStation = sequelize.define("gasStation", {
        guid:  {
            type: DataTypes.STRING,
            field: 'gs_guid',
            primaryKey: true
        },
        longitude: DataTypes.STRING(10),
        latitude: DataTypes.STRING(10),
        name: DataTypes.STRING(255)
    });
    return gasStation;
};