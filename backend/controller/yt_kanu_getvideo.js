const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

const get_video_qulity = (req, res) => {
  const { videoURL } = req.body;
  const videoUrl = sanitize(videoURL);
  if (!videoUrl) {
    return res.status(400).json({
      message: "URL is missing",
      success: false,
    });
  }

  const cmd = `yt-dlp -j --no-playlist "${videoUrl}"`;
  exec(cmd, (err, stdout, stderr) => {
    if (err || !stdout) {
      console.error("yt-dlp error:", err || stderr);
      return res.status(400).json({
        message: "Error fetching video data",
        success: false,
      });
    }

    try {
      const json = JSON.parse(stdout);
      const title = json.title || "Unknown";
      const thumbnail = json.thumbnail || "";
      const formats = Array.isArray(json.formats) ? json.formats : [];

      const byResolution = {};
      const finalFormats = [];
      const formatList = [];
      let audioFormat = null;

      for (const f of formats) {
        const { format_id, ext, vcodec, acodec, height } = f;
        const codec = vcodec || "";
        const isAudioOnly = (vcodec === "none") && acodec && acodec !== "none";
        const isVideoOnly = (acodec === "none") && vcodec && vcodec !== "none";

        if (!format_id || !ext) continue;

        // 🎧 Audio Only
        if (!audioFormat && ext === "mp4" && isAudioOnly) {
          audioFormat = { label: "MP3 (Audio Only)", formatCode: format_id };
        }

        // 🎥 Video Only
        if (ext === "mp4" && isVideoOnly && height) {
          const normHeight = normalizeResolution(height);
          const label = `${normHeight}p (MP4)`;
          const codecType = codec.includes("avc1") ? "avc1" : "other";

          if (!byResolution[label]) byResolution[label] = [];
          byResolution[label].push({ label, formatCode: format_id, codec: codecType });
        }
      }

      for (const label in byResolution) {
        const options = byResolution[label];
        const avc = options.find((f) => f.codec === "avc1");
        finalFormats.push(avc || options[0]);
        formatList.push(label);
      }

      if (audioFormat) finalFormats.push(audioFormat);

      const token = jwt.sign({ id: uuidv4() }, "lolopopo", { expiresIn: "120m" });

      return res.status(200).json({
        message: "Fetch success",
        success: true,
        formate: formatList,
        videoUrl,
        jwt_token: token,
        title,
        thumbnail,
      });
    } catch (e) {
      console.error("JSON parse error:", e.message);
      return res.status(400).json({
        message: "Invalid video data",
        success: false,
      });
    }
  });
};

// ✅ Normalize resolution to standard values
function normalizeResolution(height) {
  if (height <= 180) return 144;
  if (height <= 270) return 240;
  if (height <= 360) return 360;
  if (height <= 480) return 480;
  if (height <= 720) return 720;
  if (height <= 1080) return 1080;
  if (height <= 1440) return 1440;
  if (height <= 2160) return 2160;
  return height;
}

function sanitize(input) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function create_downloads_folder() {
  const dir = path.join(__dirname, "downloads");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

module.exports = get_video_qulity;
