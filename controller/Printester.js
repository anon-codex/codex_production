const axios = require("axios");
const { URL } = require("url"); // Built-in Node.js module
const https = require("https"); // for streaming video
require("dotenv").config();

// Safe URL validation (Node.js version)
function validateSafeURL(url) {
  if (!url || typeof url !== "string") return false;

  const trimmed = url.trim().toLowerCase();
  const blackList = ["<", ">", "javascript:", "data:", "onerror=", "onload="];
  for (const bad of blackList) {
    if (trimmed.includes(bad)) return false;
  }

  const allowedPattern =
    /^(https?:\/\/)(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|instagram\.com\/reel\/|pinterest\.com\/pin\/|pin\.it\/)/i;
  if (!allowedPattern.test(trimmed)) return false;

  try {
    const parsedUrl = new URL(trimmed);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) return false;
  } catch (e) {
    return false;
  }

  return true;
}

// 🎯 Controller to fetch Pinterest video data
const fetchPinterestVideo = async (req, res) => {
  const { video_url: url, type } = req.body;
  const apiKey = process.env.API_TOKEN;
  const apiUrl = process.env.API_URL;

  if (!url || !validateSafeURL(url)) {
    return res
      .status(400)
      .json({ success: false, message: "❌ Please enter a valid Pinterest URL." });
  }

  try {
    const response = await axios.post(
      apiUrl,
      {
        video_url: url,
        type: type || "pinterest",
      },
      {
        headers: {
          "x-avatar-key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

      if (response.data && response.data.type === "video") {
      return res.status(200).json({ success: true, data: response.data});
    }
    else if(response.data.type === "photo")
      {
        return res
    .status(400) // 400 = Bad Request (user ka galat input)
    .json({
      success: false,
      message: "Photo download is not supported. Please provide a valid Pinterest video link.",
    });
      } else {
      return res.status(404).json({
        success: false,
        message: "⚠️ No video data found. Please check the link.",
      });
    }
  } catch (err) {
    console.error("Fetch error:", err.message);
    if (err.response) {
      const status = err.response.status;
      if (status === 429) {
        return res.status(429).json({
          success: false,
          message: "🚫 Too many requests. Please wait and try again later.",
        });
      } else if (status === 401 || status === 403) {
        return res
          .status(status)
          .json({
            success: false,
            message: "🔐 Invalid API key or unauthorized access.",
          });
      } else if (err.response.data?.message) {
        return res
          .status(status)
          .json({ success: false, message: `❌ ${err.response.data.message}` });
      } else {
        return res
          .status(status)
          .json({ success: false, message: "❌ Server error occurred. Please try again." });
      }
    } else if (err.request) {
      return res.status(500).json({
        success: false,
        message: "⚠️ No response from server. Check your internet connection.",
      });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "⚠️ Something went wrong. Try again later." });
    }
  }
};

// 🎯 Controller to force download video
const downloadPinterestVideo = async (req, res) => {
  const { url } = req.query;
  console.log("video url ",url);
  if (!url) {
    return res
      .status(400)
      .json({ success: false, message: "❌ Invalid or missing download URL." });
  }

  try {
    // set headers to force download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=pinterest_${Date.now()}.mp4`
    );
    res.setHeader("Content-Type", "video/mp4");

    https.get(url, (videoStream) => {
      videoStream.pipe(res);
    }).on("error", (err) => {
      console.error("Download error:", err.message);
      res.status(500).json({ success: false, message: "⚠️ Download failed." });
    });
  } catch (err) {
    console.error("Error while downloading:", err.message);
    res.status(500).json({ success: false, message: "⚠️ Something went wrong." });
  }
};

module.exports = { fetchPinterestVideo, downloadPinterestVideo };

