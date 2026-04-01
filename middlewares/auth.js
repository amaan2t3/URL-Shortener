const { getUser } = require("../servics/auth");

async function restrictToLoginUserOnly(req, res, next) {
    const userUid = req.cookies.uid;

    if (!userUid) return res.redirect("/login");

    const user = getUser(userUid);
    if (!user) return res.redirect("/login");
    req.user = user;
    return next();
}
/////////////////////////////// Check Login User
async function checkUserLogin(req, res, next) {
    const userUid = req.cookies?.uid;

    const user = getUser(userUid);
    req.user = user;
    return next();
}

module.exports = {
    restrictToLoginUserOnly,
    checkUserLogin,
};
