module.exports = function(sequelize, DataTypes) {
    var cars = sequelize.define("comments", {
        guid: {
            type: DataTypes.STRING,
            field: 'c_guid',
            primaryKey: true
        },
        uguid: {
            type: DataTypes.STRING,
            field: 'u_guid'
        },
        mark: {
            type: DataTypes.STRING
        },
        model: {
            type: DataTypes.STRING
        },
        year: {
            type: DataTypes.INTEGER
        },
        fuel: {
            type: DataTypes.STRING
        },
        lukIsLeft: {
            type: DataTypes.BOOLEAN
        }

    }, {
        classMethods: {
            associate: function(models) {
                cars.belongsTo(models.users, {
                    foreignKey: 'uguid',
                    as: 'users'
                });
            }
        }
    });
    return cars;
};