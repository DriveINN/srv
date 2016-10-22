
module.exports = function(sequelize, DataTypes) {
    var gasStations = sequelize.define("gasStations", {
        guid: {
            type: DataTypes.STRING,
            field: 'gsguid',
            primaryKey: true
        },
        longitude: DataTypes.STRING(10),
        latitude: DataTypes.STRING(10), name: DataTypes.STRING(255)
    }, {
        classMethods: {
            associate: function (models) {
                gasStations.hasMany(models.transactions, {
                    foreignKey: 'gsguid',
                    as: 'gasStations'
                });

            }
        }
    });
    return gasStations;
};
