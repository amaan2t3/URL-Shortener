require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8000;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const urlRoute = require("./routes/urlRoute");
const staticRouter = require("./routes/staticRouter");
const userRoute = require("./routes/userRoute");

const path = require("path");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

app.use(cookieParser());

// Global Rate Limiting: max 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Too many requests from this IP, please try again after 15 minutes." }
});
app.use(globalLimiter);

// Specific Rate Limiting for URL Creation (e.g., max 10 URLs per 15 minutes)
const createUrlLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: "You have reached the maximum number of URLs allowed per 15 minutes." }
});

const { restrictToLoginUserOnly, checkUserLogin } = require("./middlewares/auth");

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use("/", checkUserLogin, staticRouter);
app.use("/url", restrictToLoginUserOnly, createUrlLimiter, urlRoute);
app.use("/user", userRoute);

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
