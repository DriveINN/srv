module.exports = function(sequelize, DataTypes) {
    var cars = sequelize.define("cars", {
        guid: {
            type: DataTypes.STRING,
            field: 'cguid',
            primaryKey: true
        },
        uguid: {
            type: DataTypes.STRING,
            field: 'uguid'
        },
        mark: {
            type: DataTypes.STRING
        },
        model: {
            type: DataTypes.STRING
        },
        label: {
            type: DataTypes.STRING
        },
        year: {
            type: DataTypes.INTEGER
        },
        ammount: {
            type: DataTypes.INTEGER
        },
        fuel: {
            type: DataTypes.STRING
        },
        number: {
            type: DataTypes.STRING
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