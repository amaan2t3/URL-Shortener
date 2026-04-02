const jwt = require("jsonwebtoken");
const secretKey = "amaan@3443$"

function setUser(user) {
    return jwt.sign({
        _id: user.id,
        email: user.email
    }, secretKey)
}

function getUser(token) {
    if (!token) return null;
    try {
        return jwt.verify(token, secretKey)
    } catch (error) {
        return null;
    }
}

module.exports = {
    setUser,
    getUser,
}