
module.exports = function(sequelize, DataTypes) {
    var transactions = sequelize.define("transactions", {
        guid: {
            type: DataTypes.STRING,
            field: 'tguid',
            primaryKey: true
        },
        date: DataTypes.DATE(),
        card: DataTypes.STRING(20),
        total: DataTypes.INTEGER,
        bouns: DataTypes.INTEGER,
        goods: DataTypes.JSON
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
