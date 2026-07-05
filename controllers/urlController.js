const shortId = require("shortid");
const supabase = require("../supabaseClient");
const UAParser = require("ua-parser-js");
const geoip = require("geoip-lite");
const QRCode = require('qrcode');

async function handleGenerateNewShortURL(req, res) {
    const body = req.body;

    if (!body.url) return res.status(400).json({ error: "url is required" });
    
    // Use custom alias if provided, otherwise generate random shortID
    const shortID = body.customAlias ? body.customAlias.trim() : shortId();

    // Check if custom alias is already taken
    if (body.customAlias) {
        const { data: existing } = await supabase
            .from("urls")
            .select("shortID")
            .eq("shortID", shortID)
            .single();
            
        if (existing) {
            return res.status(400).json({ error: "Custom alias is already in use. Please choose another." });
        }
    }

    const { error } = await supabase
        .from("urls")
        .insert([{
            shortID: shortID,
            redirectURL: body.url,
            visitHistory: [],
            createdBy: req.user._id,
        }]);

    if (error) console.error("Error creating short URL:", error);

    // Generate QR Code Data URI
    const fullShortUrl = `http://localhost:8001/url/${shortID}`;
    let qrCodeDataUri = null;
    try {
        qrCodeDataUri = await QRCode.toDataURL(fullShortUrl);
    } catch (err) {
        console.error("QR Code Error:", err);
    }

    const { data: allUrls } = await supabase
        .from("urls")
        .select("*")
        .eq("createdBy", req.user._id);

    // Support AJAX JSON response for the new UI
    if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
        return res.json({ id: shortID, qrCode: qrCodeDataUri, urls: allUrls || [] });
    }

    return res.render("home", { 
        id: shortID, 
        qrCode: qrCodeDataUri,
        urls: allUrls || [] 
    });
}

async function handleGenerateRedirectURL(req, res) {
    const shortID = req.params.shortID;

    // Fetch the current entry
    const { data: entry } = await supabase
        .from("urls")
        .select("*")
        .eq("shortID", shortID)
        .single();

    if (!entry) {
        return res.status(404).send("Short URL not found");
    }

    // Append to visit history
    const visitHistory = entry.visitHistory || [];
    visitHistory.push({ timestamp: Date.now() });

    // Update the record
    await supabase
        .from("urls")
        .update({ visitHistory })
        .eq("shortID", shortID);

    // Phase 1: Track detailed visit
    try {
        const parser = new UAParser(req.headers['user-agent']);
        const result = parser.getResult();
        
        // Handle IPs behind proxies/load balancers
        let ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        if (ipAddress && ipAddress.includes(',')) ipAddress = ipAddress.split(',')[0].trim();
        if (!ipAddress) ipAddress = '';
        
        const geo = geoip.lookup(ipAddress);

        await supabase.from("visits").insert([{
            shortID: shortID,
            ipAddress: ipAddress,
            country: geo ? geo.country : 'Unknown',
            city: geo ? geo.city : 'Unknown',
            browser: result.browser.name || 'Unknown',
            operatingSystem: result.os.name || 'Unknown',
            deviceType: result.device.type || 'desktop',
            language: req.headers['accept-language'] ? req.headers['accept-language'].split(',')[0] : 'Unknown',
            referralSource: req.headers.referer || 'Direct',
        }]);
    } catch (err) {
        console.error("Tracking Error:", err);
    }

    res.redirect(entry.redirectURL);
}

/////total click
async function handleGetAnalyticsURL(req, res) {
    const shortID = req.params.shortID;

    const { data: result } = await supabase
        .from("urls")
        .select("*")
        .eq("shortID", shortID)
        .single();

    if (!result) return res.status(404).json({ error: "Short URL not found" });

    const visitHistory = result.visitHistory || [];
    return res.json({
        totalClicks: visitHistory.length,
        analytics: visitHistory,
    });
}

module.exports = {
    handleGenerateNewShortURL,
    handleGenerateRedirectURL,
    handleGetAnalyticsURL,
};
