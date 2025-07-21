const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");

const downloadsPath = path.join(__dirname, "downloads");

const download_yt = async (req, res) => {
  const { quality, videoURL ,vtitle} = req.body;
  if (!videoURL) return res.status(400).json({ error: "URL is required" });

//   const fileName = `video-${Date.now()}.mp4`; 
  const safeTitle = sanitizeFilename(vtitle); 
  const fileName = `${safeTitle}-${quality}-video.mp4`

  const outputPath = path.join(downloadsPath, fileName).replace(/\\/g, "/");

  // ✅ Use yt-dlp with bestvideo + bestaudio, then re-encode audio to 128kbps AAC using ffmpeg
  const command = `yt-dlp -f "bestvideo[height<=${quality}]+bestaudio" --merge-output-format mp4 -o "${outputPath}" --postprocessor-args "-c:v copy -c:a aac -b:a 128k -strict experimental" "${videoURL}"`;

  console.log("▶️ Running yt-dlp:", command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ yt-dlp error:\n", stderr);
      return res.status(500).json({ error: "Download failed", success: false });
    }

    if (!fs.existsSync(outputPath)) {
      return res.status(500).json({ error: "File not created", success: false });
    }

    console.log("✅ Download done:", fileName);
    res.json({
      file: fileName,
      downloadUrl: `/downloads/${fileName}`,
      success: true
    });
  });
};

module.exports = download_yt;

function sanitizeFilename(name) {
  return name
    .replace(/[/\\?%*:|"<>]/g, '-') // illegal characters
    .replace(/\s+/g, ' ')           // extra spaces
    .trim();                        // remove leading/trailing space
}