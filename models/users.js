var crypto = require('crypto');

module.exports = function(sequelize, DataTypes) {
    var users = sequelize.define("users", {
        guid:  {
            type: DataTypes.STRING,
            field: 'uguid',
            primaryKey: true
        },
        login: {
            type: DataTypes.STRING,
            unique: true
        },
        email: DataTypes.STRING(255),
        firstName: DataTypes.STRING(255),
        lastName: DataTypes.STRING(255),
        avatar: DataTypes.TEXT,
        groups: DataTypes.ARRAY(DataTypes.STRING),
        pwdhash: DataTypes.STRING(255),
        pwdsalt: DataTypes.STRING(255),
        f92: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        f95: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        f95U: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        f98: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        fd: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        bonus: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        instanceMethods: {
            encryptPassword: function(password, salt) {
                if (!password)
                    return '';
                try {
                    return crypto
                        .createHmac('sha1', salt)
                        .update(password)
                        .digest('hex');
                } catch (err) {
                    return '';
                }
            },
            generateSalt: function () {
                return crypto.randomBytes(64).toString('hex');
            }
        },
        classMethods: {
            associate: function (models) {
                users.hasMany(models.cars, {
                    foreignKey: 'uguid',
                    as: 'users'
                });
                users.hasMany(models.transactions, {
                    foreignKey: 'uguid',
                    as: 'users'
                });
            }
        }
    });
    return users;
};