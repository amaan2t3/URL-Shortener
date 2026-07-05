const express = require("express");
const supabase = require("../supabaseClient");
const { checkUserLogin } = require("../middlewares/auth");
const router = express.Router();

////////////////////////// Home Route
router.get("/", checkUserLogin, async (req, res) => {
    if (!req.user) return res.redirect("/login");
    
    const { data: allUrls } = await supabase
        .from("urls")
        .select("*")
        .eq("createdBy", req.user._id);

    return res.render("home", {
        urls: allUrls || [],
    });
});

///////////////////// Signup Route
router.get("/signup", (req, res) => {
    return res.render("signup");
});
////////////////// Login Route
router.get("/login", (req, res) => {
    return res.render("login");
});

module.exports = router;
