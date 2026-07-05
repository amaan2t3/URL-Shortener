const supabase = require("../supabaseClient");
const { setUser } = require("../servics/auth");

////////////////////////// Handle User Signup
async function handleUserSignup(req, res) {
    const { firstName, lastName, email, password } = req.body;
    
    const { error } = await supabase
        .from("users")
        .insert([{ firstName, lastName, email, password }]);

    if (error) {
        console.error("Signup error:", error);
    }
    return res.redirect("/");
}

//////////////////////////// Handle User Login
async function handleUserLogin(req, res) {
    const { email, password } = req.body;
    
    const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single();

    if (!user || error) {
        return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = setUser(user);
    res.cookie("uid", token);
    return res.redirect("/");
}

module.exports = {
    handleUserSignup,
    handleUserLogin,
};