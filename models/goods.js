
module.exports = function(sequelize, DataTypes) {
    var goods = sequelize.define("goods", {
        guid: {
            type: DataTypes.STRING,
            field: 'gguid',
            primaryKey: true
        },
        name: DataTypes.STRING(250),
        icon: DataTypes.STRING(100),
        isFuel: DataTypes.BOOLEAN(),
        maxAmmount: DataTypes.INTEGER()
    }, {
        classMethods: {
            associate: function (models) {
                goods.belongsTo(models.stations, {
                    foreignKey: 'sguid',
                    as: 'stations'
                });
                goods.belongsToMany(models.transactions, {through: 'gt'});
            }
        }
    });
    return goods;
};
