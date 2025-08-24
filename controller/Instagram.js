const axios = require('axios');
require('dotenv').config();

function validateSafeURL(url) {
  if (!url || typeof url !== "string") return false;

  const trimmed = url.trim().toLowerCase();
  const blackList = ["<", ">", "javascript:", "data:", "onerror=", "onload="];
  for (const bad of blackList) {
    if (trimmed.includes(bad)) return false;
  }

  const allowedPattern =
    /^(https?:\/\/)(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|instagram\.com\/reel\/|linkedin\.com\/)/i;
  if (!allowedPattern.test(trimmed)) return false;

  try {
    const parsedUrl = new URL(trimmed);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) return false;
  } catch (e) {
    return false;
  }

  return true;
}

const Insta_api = async (req, res) => {
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
    type: "instagram",
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
      result.data.length > 0
    ) {
      return res.status(200).json({
        message: "✅ Video fetched successfully.",
        success: true,
        data: result.data,
      });
    } else {
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

module.exports = Insta_api;
