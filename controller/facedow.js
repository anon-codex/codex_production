// backend/routes/Insta_api.js

const axios = require('axios');
require('dotenv').config();

function validateSafeURL(url) {
  if (!url || typeof url !== "string") return false;

  const trimmed = url.trim().toLowerCase();
  const blackList = ["<", ">", "javascript:", "data:", "onerror=", "onload="];
  for (const bad of blackList) {
    if (trimmed.includes(bad)) return false;
  }

    const allowedPattern = /^(https?:\/\/)(www\.)?facebook\.com\/share\/v\/[A-Za-z0-9]+\/?$/i;

  if (!allowedPattern.test(trimmed)) return false;

  try {
    const parsedUrl = new URL(trimmed);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) return false;
  } catch (e) {
    return false;
  }

  return true;
}

const facedow = async (req, res) => {
  const ur = process.env.API_URL;
  const apiKey = process.env.API_TOKEN;

  const { video_url } = req.body;

  if (!video_url || !validateSafeURL(video_url)) {
    return res.status(400).json({
      message: "❌ Video URL is required in request body.",
      success: false
    });
  }

  const data = {
    video_url,
    type: "facebook",
  };

  try {
    const response = await axios.post(ur, data, {
      headers: {
        "x-avatar-key": apiKey,
        "Content-Type": "application/json",
      },
    });

    

    const result = response.data;

    if (
      result &&
      result.data &&
      Array.isArray(result.data) &&
      result.data.length > 0 && response.data.type === "video"
    ) {
      return res.status(200).json({
        message: "✅ Video fetched successfully.",
        success: true,
        data: result.data,
      });
    } 
    else if(response.data.type === "photo")
      {
        return res
    .status(400) // 400 = Bad Request (user ka galat input)
    .json({
      success: false,
      message: "❌ Photo download is not supported. Please provide a valid facebook video link.",
    });
      } 
    else {
      return res.status(404).json({
        message: "⚠️ No video data found. Please check the link.",
        success: false
      });
    }

  } catch (err) {
    console.error("API Error:", err.message);

    if (err.response) {
      if (err.response.status === 429) {
        return res.status(429).json({
          message: "🚫 Too many requests. Please wait and try again later.",
          success: false
        });
      } else if (err.response.status === 403 || err.response.status === 401) {
        return res.status(401).json({
          message: "🔐 Invalid API key or unauthorized access.",
          success: false
        });
      } else if (err.response.data && err.response.data.message) {
        return res.status(500).json({
          message: `❌ ${err.response.data.message}`,
          success: false
        });
      } else {
        return res.status(500).json({
          message: "❌ Server error occurred. Please try again.",
          success: false
        });
      }
    } else if (err.request) {
      return res.status(500).json({
        message: "⚠️ No response from API server. Check your internet connection.",
        success: false
      });
    } else {
      return res.status(500).json({
        message: "⚠️ Something went wrong. Try again later.",
        success: false
      });
    }
  }
};


// 🎯 Controller to force download video
const downloadfacebookVideo = async (req, res) => {
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
      `attachment; filename=video_${Date.now()}.mp4`
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


module.exports = facedow;
