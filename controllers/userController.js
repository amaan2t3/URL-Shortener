const User = require("../models/user")
const { v4: uuidv4 } = require("uuid")
const { setUser } = require("../servics/auth")
////////////////////////// Handle User Signup
async function handleUserSignup(req, res) {

    const { firstName, lastName, email, password } = req.body
    await User.create({
        firstName,
        lastName,
        email,
        password,

    });
    return res.redirect("/")
}
//////////////////////////// Handle User Login
async function handleUserLogin(req, res) {

    const { email, password } = req.body
    const user = await User.findOne({
        email,
        password,
    });
    console.log("user", user);
    if (!user) {
        return res.status(400).json({ error: "Invalid email or password" });
    }

    const sessionId = uuidv4();
    setUser(sessionId, user);
    res.cookie("uid", sessionId)
    return res.redirect("/")
}

module.exports = {
    handleUserSignup,
    handleUserLogin,
}