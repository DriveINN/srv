
module.exports = function(sequelize, DataTypes) {
    var transactions = sequelize.define("transactions", {
        guid: {
            type: DataTypes.STRING,
            field: 'tguid',
            primaryKey: true
        },
        longitude: DataTypes.STRING(10),
        latitude: DataTypes.STRING(10), name: DataTypes.STRING(255)
    }, {
        classMethods: {
            associate: function(models) {
                transactions.belongsTo(models.users, {
                    foreignKey: 'uguid',
                    as: 'users'
                });
                transactions.belongsTo(models.stations, {
                    foreignKey: 'sguid',
                    as: 'stations'
                });
            }
        }
    });
    return transactions;
};