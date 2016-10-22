
module.exports = function(sequelize, DataTypes) {
    var goods = sequelize.define("goods", {
        guid: {
            type: DataTypes.STRING,
            field: 'gguid',
            primaryKey: true
        },
        name: DataTypes.STRING(250),
        icon: DataTypes.TEXT,
        isFuel: DataTypes.BOOLEAN(),
        maxAmmount: DataTypes.INTEGER(),
        price: DataTypes.DECIMAL(10, 2)
    }, {
        classMethods: {
            associate: function (models) {
                goods.belongsTo(models.stations, {
                    foreignKey: 'sguid',
                    as: 'stations'
                });
            }
        }
    });
    return goods;
};
