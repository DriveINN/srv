
module.exports = function(sequelize, DataTypes) {
    var stations = sequelize.define("stations", {
        guid: {
            type: DataTypes.STRING,
            field: 'sguid',
            primaryKey: true
        },
        longitude: DataTypes.STRING(10),
        latitude: DataTypes.STRING(10), name: DataTypes.STRING(255)
    }, {
        classMethods: {
            associate: function (models) {
                stations.hasMany(models.transactions, {
                    foreignKey: 'sguid',
                    as: 'stations'
                });

            }
        }
    });
    return stations;
};
