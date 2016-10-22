var controllers = require('../controllers/'),
    models = require('../models/');

module.exports = {
    free: {
        v01: [],
        actual: [
            {
                type: 'options',
                postfix: '/(.*)',
                method: controllers.common.options
            },
            {
                type: 'put',
                postfix: '/token',
                method: controllers.token.getToken,
                comment: 'Метод авторизации, принимает параметры login и password ИЛИ {token & type}, в случае корректной пары ИЛИ наличия в массиве токенов присланного присылает token, который необходимо выставить в заголовке Authorization с префиком "Bearer "'
            }, {
                type: 'get',
                postfix: '/token/check',
                method: controllers.token.checkToken
            }, {
                type: 'post',
                postfix: '/users/register',
                method: controllers.users.register
            }, {
                type: 'get',
                postfix: '/users/check',
                method: controllers.users.check
            }, {
                type: 'post',
                postfix: '/users/register_complete',
                method: controllers.users.registerComplete
            }, {
                type: 'post',
                postfix: '/users/authenticate',
                method: controllers.users.authenticate
            }, {
                type: 'post',
                postfix: '/users/logout',
                method: controllers.users.logout
            }, {
                type: 'post',
                postfix: '/users/changePassword',
                method: controllers.users.changePassword
            }, {
                type: 'post',
                postfix: '/users/changeUser',
                method: controllers.users.changeUser
            }, {
                type: 'post',
                postfix: '/users/changeUserAndSetPin',
                method: controllers.users.changeUserAndSetPin
            },


            {
                type: 'get',
                postfix: '/cards/getBindings',
                method: controllers.cards.getBindings
            },
            {
                type: 'post',
                postfix: '/cards/createVerifyPayment',
                method: controllers.cards.createVerifyPayment
            },
            {
                type: 'get',
                postfix: '/cards/getPaymentResult',
                method: controllers.cards.getPaymentResult
            }
        ]
    },
    locked: {
        v01: [],
        actual: [
            {
                type: 'get',
                postfix: '/cars/my',
                method: controllers.cars.listCars4User,
                accessGroups: [
                    'admin', 'confirmed'
                ]
            }, {
                type: 'post',
                postfix: '/cars/',
                method: controllers.cars.add,
                accessGroups: [
                    'admin', 'confirmed'
                ]
            }, {
                type: 'options',
                postfix: '/(.*)',
                method: controllers.common.options
            }
        ]
    }
}