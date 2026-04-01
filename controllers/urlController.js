const shortId = require("shortid");
const URL = require("../models/url");
const shortid = require("shortid");

async function handleGenerateNewShortURL(req, res) {
    const body = req.body;

    if (!body.url) return res.status(400).json({ error: "url is require" });
    const shortID = shortId();

    await URL.create({
        shortID: shortID,
        redirectURL: body.url,
        visitHistory: [],
        createdBy: req.user._id,
    });
    const allUrls = await URL.find({ createdBy: req.user._id });
    return res.render("home", { id: shortID, urls: allUrls });
}

async function handleGenerateRedirectURL(req, res) {
    const shortID = req.params.shortID;
    const entry = await URL.findOneAndUpdate(
        {
            shortID,
        },
        {
            $push: {
                visitHistory: {
                    timestamp: Date.now(),
                },
            },
        },
    );
    if (!entry) {
        return res.status(404).send("Short URL not found");
    }
    res.json({ redirect: entry.redirectURL });
}

/////total click
async function handleGetAnalyticsURL(req, res) {
    const shortID = req.params.shortID;

    const result = await URL.findOne({ shortID });
    if (!result) return res.status(404).json({ error: "Short URL not found" });

    return res.json({
        totalClicks: result.visitHistory.length,
        analytics: result.visitHistory,
    });
}



module.exports = {
    handleGenerateNewShortURL,
    handleGenerateRedirectURL,
    handleGetAnalyticsURL,
};
