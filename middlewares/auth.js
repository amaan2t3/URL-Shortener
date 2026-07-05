const { getUser } = require("../servics/auth");

async function restrictToLoginUserOnly(req, res, next) {
    // Check for API Key in Authorization header (Bearer Token)
    const authHeader = req.headers['authorization'];
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else {
        // Fallback to cookie
        token = req.cookies.uid;
    }

    if (!token) {
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(401).json({ error: "Unauthorized. Missing API Key or Token." });
        }
        return res.redirect("/login");
    }

    const user = getUser(token);
    if (!user) {
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(401).json({ error: "Unauthorized. Invalid API Key." });
        }
        return res.redirect("/login");
    }
    
    req.user = user;
    res.locals.user = user; // Make user available to EJS templates
    return next();
}

/////////////////////////////// Check Login User
async function checkUserLogin(req, res, next) {
    const userUid = req.cookies?.uid;

    const user = getUser(userUid);
    req.user = user;
    res.locals.user = user; // Make user available to EJS templates
    return next();
}

module.exports = {
    restrictToLoginUserOnly,
    checkUserLogin,
};
