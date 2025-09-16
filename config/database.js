const crypto = require('crypto').randomBytes(256).toString('hex');

module.exports = {
    //uri: 'mongodb://localhost:27017/rezerwacja',
    uri:'mongodb://test1:111111@ds125016.mlab.com:25016/rezerwacja-nocelgow', //production
    secret: crypto,
    db: 'rezerwacja'
}