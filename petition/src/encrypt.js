const {genSalt, hash, compare} = require("bcryptjs");

exports.hash = password => {
    return genSalt().then(salt => {
        return hash(password, salt);
    });
};

module.exports.compare = compare;