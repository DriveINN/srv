function prepareOutput (user) {
    delete user.pwdhash;
    delete user.pwdsalt;
    delete user.SMS;
    return user;
}

module.exports.prepareOutput = prepareOutput;
