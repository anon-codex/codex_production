const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const jwt = require("jsonwebtoken");
const path = require('path');
const { v4: uuidv4 } = require("uuid");
require("dotenv").config()

// 🔹 FUNCTION 1: Only fetch Instagram Reel metadata
const fetchInstagramReelInfo = async (req, res) => {
  const { videoURL } = req.body;
  if (!videoURL || !videoURL.includes('instagram.com/reel/')) {
    return res.status(400).json({ error: 'Invalid Instagram reel URL' });
  }

  try {
    const browser = await puppeteer.launch({
       args:[
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote"
       ],
       executablePath:
       process.env.NODE_ENV === "production" ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),
      });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64)');
    await page.goto(videoURL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('video', { timeout: 10000 });

    const { videoUrl, thumbnail, titleText } = await page.evaluate(() => {
     
      const video = document.querySelector('video');
      const meta = document.querySelector('meta[property="og:image"]');
      const span = document.querySelector('span.x193iq5w.xeuugli.x13faqbe.x1vvkbs.xt0psk2.x1i0vuye.xvs91rp.xo1l8bm.x5n08af.x10wh9bi.xpm28yp.x8viiok.x1o7cslx.x126k92a');
      return {
        videoUrl: video?.src || '',
        thumbnail: meta?.content || '',
        titleText: span?.innerText?.split('\n')[0] || 'Instagram Reel'
        
      };
    });

    await browser.close();

    if (!videoUrl) {
      return res.status(404).json({ error: 'Video URL not found' });
    }

   const token = jwt.sign({ id: uuidv4() }, "lolopopo", { expiresIn: "120m" });

    return res.json({
      title: titleText,
      video: videoUrl,
      thumbnail,
      jwt_token:token
    });

  } catch (err) {
    console.error('[Fetch Error]', err.message);
    return res.status(500).json({ error: 'Failed to fetch Instagram reel metadata' });
  }
};

// 🔹 FUNCTION 2: Download video from videoUrl
const downloadInstagramReel = async (req, res) => {
  const { videoUrl, title } = req.body;
  if (!videoUrl) {
    return res.status(400).json({ error: 'Video URL is required for download' });
  }

  try {
    const downloadsDir = path.join(__dirname, 'downloads');
    if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);

    const filename = `reel-${Date.now()}.mp4`;
    const filePath = path.join(downloadsDir, filename);
    const publicUrl = `http://localhost:7890/downloads/${filename}`;

    const writer = fs.createWriteStream(filePath);
    const response = await axios({ url: videoUrl, method: 'GET', responseType: 'stream' });

    response.data.pipe(writer);
    writer.on('finish', () => {
      return res.json({
        message: 'Download complete',
        title: title || 'Instagram Reel',
        download_link: publicUrl
      });
    });

    writer.on('error', err => {
      console.error('Writer error:', err.message);
      return res.status(500).json({ error: 'Failed to save video' });
    });

  } catch (err) {
    console.error('[Download Error]', err.message);
    return res.status(500).json({ error: 'Video download failed' });
  }
};

module.exports = {
  fetchInstagramReelInfo,
  downloadInstagramReel
};
