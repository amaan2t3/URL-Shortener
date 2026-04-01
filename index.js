////////////////// Expresss
const express = require("express");
const app = express();
const PORT = 8000;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/////////////////////////// Connect MongoDB
const { connectToMongoDB } = require("./connectMD");
connectToMongoDB("mongodb://127.0.0.1:27017/short-url").then(() =>
    console.log("Mongodb Connected"),
);
// Import URL Model
const URL = require("./models/url");

/////////////////////// Import all Route
const urlRoute = require("./routes/urlRoute");
const staticRouter = require("./routes/staticRouter");
const userRoute = require("./routes/userRoute")

// Import Path and Cookies
const path = require("path");

const cookieParser = require("cookie-parser");

app.use(cookieParser());

// Import Auth Middleware
const { restrictToLoginUserOnly, checkUserLogin } = require("./middlewares/auth");

//////// ejs
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));


/////////////////// alll Routes
app.use("/", checkUserLogin, staticRouter);
app.use("/url", restrictToLoginUserOnly, urlRoute);
app.use("/user", userRoute);

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
