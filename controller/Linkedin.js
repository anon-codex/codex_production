const axios = require('axios');
require('dotenv').config();

// ✅ Secure validation function
function validateSafeURL(url) {
  if (!url || typeof url !== "string") return false;

  const trimmed = url.trim().toLowerCase();
  const blackList = ["<", ">", "javascript:", "data:", "onerror=", "onload="];
  for (const bad of blackList) {
    if (trimmed.includes(bad)) return false;
  }

  const allowedPattern =
    /^(https?:\/\/)(www\.)?(linkedin\.com\/(posts|feed|video|learning|in|company)\/)/i;
  if (!allowedPattern.test(trimmed)) return false;

  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
  } catch {
    return false;
  }

  return true;
}

// ✅ Express controller
const LinkedIn_api = async (req, res) => {
  const ur = process.env.API_URL;
  const apiKey = process.env.API_TOKEN;

  const { video_url } = req.body;

  // 🚫 Validate incoming URL
  if (!video_url || !validateSafeURL(video_url)) {
    return res.status(400).json({
      message: "❌ Please enter a valid LinkedIn URL.",
      success: false
    });
  }

  const data = {
    video_url,
    type:"linkedin",
    get_url:true
  };

  try {
    const response = await axios.post(ur, data, {
      headers: {
        "x-avatar-key": apiKey,
        "Content-Type": "application/json",
      },
    });

    

    if (response.data) {
      return res.status(200).json({
        message: "✅ Video fetched successfully.",
        success: true,
        data: response.data,
      });
    } else {
      return res.status(404).json({
        message: "⚠️ No video data found. Please check the link.",
        success: false
      });
    }

  } catch (err) {
    console.error("LinkedIn API Error:", err.message);

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
      } else if (err.response.data?.message) {
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

module.exports = LinkedIn_api;
