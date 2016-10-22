var cfg = {
    'database': {
        server: 'driveinn.westeurope.cloudapp.azure.com',
        user: 'postgres',
        password: 'Qaz12345',
        database: 'driveinn',
        options: {
            encrypt: true
        }
    },
    token: {
        secret: 'N5g9clpxuATS7Sts7ketnZ3FeicFkj',
        expires: 2* 24 * 60 * 60
    },
    rb: {
        baseUrl: 'https://openfightsgate.open.ru/boplatform-deploy/',
        version: '3.4',
        partner: 'RavINN'
    }
};

module.exports = cfg;
