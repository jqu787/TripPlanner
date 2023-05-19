const crypto = require('crypto');

const SALT = "aw23@FA2!fmaweiIAOJ4"

const hash = (password) => {
    return crypto
        .createHash("sha256")
        .update(SALT + password + SALT)
        .digest()
        .toString();
}

const loggedIn = (req, res, next) => {
    if (req.session.user)
        next();
    else
        res.status(401).json({msg:"Unauthorized, please refresh and log in"});
}

const isMe = (req, res, next) => {
    if (req.session.user && req.params.user && req.params.user == req.params.user.username)
        next();
    else
        res.status(401).json({msg:"Unauthorized, please refresh and log in as " + req.params.user});
}

module.exports = {
    hash, 
    loggedIn, 
    isMe,
}