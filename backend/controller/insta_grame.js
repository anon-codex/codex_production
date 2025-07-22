const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const UserAgent = require("user-agents");
const axios = require("axios");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

puppeteer.use(StealthPlugin()); // 🛡️ Stealth Anti-Bot Plugin

const fetchInstagramReelInfo = async (req, res) => {
  const { videoURL } = req.body;

  if (!videoURL || !videoURL.includes("instagram.com/reel/")) {
    return res.status(400).json({ error: "Invalid Instagram reel URL" });
  }

  const userAgent = new UserAgent();

  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--disable-blink-features=AutomationControlled',
        '--single-process',
        '--no-zygote'
      ],
    });

    const page = await browser.newPage();

    // 🧠 Fingerprint Spoofing
    await page.setUserAgent(userAgent.toString());
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    // Remove webdriver flag
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });

    // ⏱️ Random Delay (to simulate human)
    await new Promise(r => setTimeout(r, Math.floor(Math.random() * 3000) + 2000));

    await page.goto(videoURL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('video', { timeout: 12000 });

    const { videoUrl, thumbnail, titleText } = await page.evaluate(() => {
      const video = document.querySelector("video");
      const meta = document.querySelector('meta[property="og:image"]');
      const span = document.querySelector(
        "span.x193iq5w.xeuugli.x13faqbe.x1vvkbs.xt0psk2.x1i0vuye.xvs91rp.xo1l8bm.x5n08af.x10wh9bi.xpm28yp.x8viiok.x1o7cslx.x126k92a"
      );
      return {
        videoUrl: video?.src || "",
        thumbnail: meta?.content || "",
        titleText: span?.innerText?.split("\n")[0] || "Instagram Reel",
      };
    });

    await browser.close();

    if (!videoUrl) {
      return res.status(404).json({ error: "Video URL not found" });
    }

    const token = jwt.sign({ id: uuidv4() }, "lolopopo", { expiresIn: "120m" });

    return res.json({
      title: titleText,
      video: videoUrl,
      thumbnail,
      jwt_token: token,
    });

  } catch (err) {
    console.error("[Fetch Error]", err.message);
    return res.status(500).json({ error: "Failed to fetch Instagram reel metadata" });
  }
};

// 🔹 FUNCTION 2: Download video from videoUrl
const downloadInstagramReel = async (req, res) => {
  const { videoUrl, title } = req.body;
  if (!videoUrl) {
    return res
      .status(400)
      .json({ error: "Video URL is required for download" });
  }

  try {
    const downloadsDir = path.join(__dirname, "downloads");
    if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);

    const filename = `reel-${Date.now()}.mp4`;
    const filePath = path.join(downloadsDir, filename);
    const publicUrl = `https://codex-production-1.onrender.com/downloads/${filename}`;

    const writer = fs.createWriteStream(filePath);
    const response = await axios({
      url: videoUrl,
      method: "GET",
      responseType: "stream",
    });

    response.data.pipe(writer);
    writer.on("finish", () => {
      return res.json({
        message: "Download complete",
        title: title || "Instagram Reel",
        download_link: publicUrl,
      });
    });

    writer.on("error", (err) => {
      console.error("Writer error:", err.message);
      return res.status(500).json({ error: "Failed to save video" });
    });
  } catch (err) {
    console.error("[Download Error]", err.message);
    return res.status(500).json({ error: "Video download failed" });
  }
};

module.exports = {
  fetchInstagramReelInfo,
  downloadInstagramReel,
};
