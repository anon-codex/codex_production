const axios = require('axios');
require('dotenv').config();
const fs = require('fs');
const path = require('path');


// 📁 Ensure download directory exists
const DOWNLOAD_DIR = path.join(__dirname, '../downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);


// 🔍 Extract username from profile URL
// function extractInstagramUsername(url) {
//   try {
//     const parsedUrl = new URL(url);
//     const hostname = parsedUrl.hostname.toLowerCase();

//     if (!hostname.includes("instagram.com")) return null;

//     const pathname = parsedUrl.pathname.split('/').filter(Boolean);
//     if (pathname.length === 1 && !["p", "reel", "tv", "stories"].includes(pathname[0])) {
//       return pathname[0];
//     }

//     return null;
//   } catch (err) {
//     return null;
//   }
// }

function extractInstagramUsername(url) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (!hostname.includes("instagram.com")) return null;

    const pathname = parsedUrl.pathname.split('/').filter(Boolean);

    // If it's a profile URL, return the username (not reel, tv, p, stories, etc.)
    if (
      pathname.length === 1 &&
      !["p", "reel", "tv", "stories", "explore", "directory"].includes(pathname[0])
    ) {
      return pathname[0];
    }

    return null;
  } catch (err) {
    return null;
  }
}



// 🔐 URL validation
function validateSafeURL(url) {
  if (!url || typeof url !== "string") return false;

  const trimmed = url.trim().toLowerCase();
  const blackList = ["<", ">", "javascript:", "data:", "onerror=", "onload="];
  for (const bad of blackList) {
    if (trimmed.includes(bad)) return false;
  }

  const allowedPattern =
    /^(https?:\/\/)?(www\.)?instagram\.com\/([a-zA-Z0-9_.]+)(\/)?(\?.*)?$/i;

  if (!allowedPattern.test(trimmed)) return false;

  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
  } catch {
    return false;
  }

  return true;
}


// 📥 Download image from URL to local storage
const downloadImageToServer = async (imageUrl, req) => {
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

  const ext = path.extname(imageUrl.split('?')[0]) || '.jpg';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `insta_${timestamp}${ext}`;
  const filePath = path.join(DOWNLOAD_DIR, fileName);

  fs.writeFileSync(filePath, response.data);

  return `${req.protocol}://${req.get('host')}/downloads/${fileName}`;
};


// ✅ Express controller
const Insta_profile_api = async (req, res) => {
  const ur = process.env.API_URL;
  const apiKey = process.env.API_TOKEN;

  // const  video_url  = "neoo_nerd";
  const { video_url } = req.body;

  const profile_name = extractInstagramUsername(video_url);
  // !validateSafeURL(video_url)

  if (!video_url || profile_name == null) {
    return res.status(400).json({
      message: "❌ Please enter a valid Instagram profile URL.",
      success: false
    });
  }

  const data = {
    profile_name,
    type: "profile_pic",
    user_id:profile_name,
  };

  try {
    const response = await axios.post(ur, data, {
      headers: {
        "x-avatar-key": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (response.data && response.data.profilePic) {
      // Download image to server and return hosted URL
      const downloadedUrl = await downloadImageToServer(response.data.profilePic, req);

      return res.status(200).json({
        message: "✅ Profile fetched successfully.",
        success: true,
        data: downloadedUrl
      });
    } else {
      return res.status(404).json({
        message: "⚠️ No Profile data found. Please check the link.",
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

module.exports = Insta_profile_api;
