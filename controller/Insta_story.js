const axios = require('axios');
require('dotenv').config();


async function extractInstagramStoryId(url) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (!hostname.includes("instagram.com")) return null;

    const pathname = parsedUrl.pathname.split('/').filter(Boolean);

    // Check for story URL like /stories/username/story_id
    if (pathname.length === 3 && pathname[0] === 'stories') {
      return pathname[2]; // This is the story ID
    }

    return null;
  } catch (err) {
    return null;
  }
}





// ✅ Secure validation function
function validateSafeURL(url) {
  if (!url || typeof url !== "string") return false;

  const trimmed = url.trim().toLowerCase();
  const blackList = ["<", ">", "javascript:", "data:", "onerror=", "onload="];
  for (const bad of blackList) {
    if (trimmed.includes(bad)) return false;
  }

const allowedPattern =
  /^(https?:\/\/)?(www\.)?instagram\.com\/stories\/[a-zA-Z0-9_.]+\/[0-9]+(\?.*)?$/i;


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
const Insta_story_api = async (req, res) => {
  const ur = process.env.API_URL;
  const apiKey = process.env.API_TOKEN;
  
  const { video_url } = req.body;
  const profile_name = await extractInstagramStoryId(video_url);

  // 🚫 Validate incoming URL
  if (!video_url || profile_name == null) {
    return res.status(400).json({
      message: "❌ Please enter a valid Instagram story URL.",
      success: false
    });
  }

  const data = {
    video_url,
    type:"insta_story",
    user_id:profile_name,
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
        message: "✅ Story fetched successfully.",
        success: true,
        data: response.data,
      });
    } else {
      return res.status(404).json({
        message: "⚠️ No Story data found. Please check the link.",
        success: false
      });
    }

  } catch (err) {
    console.error("Instagram API Error:", err.message);

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

module.exports = Insta_story_api;



