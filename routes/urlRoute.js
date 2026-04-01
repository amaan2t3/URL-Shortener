const express = require("express");
const {
    handleGenerateNewShortURL,
    handleGenerateRedirectURL,
    handleGetAnalyticsURL,
} = require("../controllers/urlController");

const router = express.Router();

router.post("/", handleGenerateNewShortURL);
router.get("/:shortID", handleGenerateRedirectURL);
router.get("/analytics/:shortID", handleGetAnalyticsURL);

module.exports = router;
