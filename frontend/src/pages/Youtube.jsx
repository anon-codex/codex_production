import React from 'react'
import axios from "axios";
import { useState } from 'react';
import "./youtube.css";

const Youtube = () => {
 const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [error, setError] = useState("");
  const [down, setDown] = useState(false);
  const [cindex, setCindex] = useState(null);

  const fetchVideo = async () => {
    const videoURL = url;
    setLoading(true);
    setVideoData(null);
    setError("");
    try {
      const res = await axios.post("http://localhost:8080/api/getvideo", {
        videoURL,
      });
      console.log(res.data);
      const jwt = res.data.jwt_token;
      localStorage.setItem("token", jwt);
      setVideoData(res.data);
    } catch (err) {
      setError("Failed to fetch video info.");
    } finally {
      setLoading(false);
    }
  };

  // download video api

  const dowmnload_handle = (qua, idx) => {
    // this code only get filter out data for quality
    setCindex(idx);
    const videoURL = url;
    const sp = qua.split("p");
    const quality = sp[0];
    const vtitle = videoData.title;
    console.log(quality, videoURL);
    setDown(true);

    const token = localStorage.getItem("token");

    axios
      .post(
        "https://codex-production-1.onrender.com/api/download_yt",
        { quality: quality, videoURL: videoURL , vtitle: vtitle},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        console.log("✅ Success:", response.data);
        if (response.data.success && response.data.file) {
          const URL = response.data.downloadUrl;
          const downloadUrl = `https://codex-production-1.onrender.com${URL}`;

          // 👇 Trigger direct browser download
          // const a = document.createElement("a");
          // a.href = downloadUrl;
          // a.download = response.data.filename;
          // a.click();
          // setDown(false);

          console.log("full url ",downloadUrl);

           const a = document.createElement("a");
           a.href = downloadUrl;
           a.download = response.data.file;
           document.body.appendChild(a);
           a.click();
           a.remove();
           setDown(false);

          console.log("✅ Success:", response.data);
        }
      })
      .catch((error) => {
        console.error("❌ Error:", error.response?.data || error.message);
        setDown(false);
      });
  };

  return (
    <div className="wrapper">
      <div className="container">
        <div className="content">
          <div className="header">
            <h1>Youtube Video Downloader</h1>
            <p>Download YouTube videos in high quality — fast and easy!</p>
          </div>

          <div className="input-section">
            <input
              type="text"
              placeholder="Paste YouTube video link..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input-box"
            />
            <button
              onClick={fetchVideo}
              disabled={!url || loading}
              className="fetch-button"
            >
              {loading ? "Fetching..." : "Fetch Video"}
            </button>
          </div>

          {error && <div className="error-text">{error}</div>}

          {loading && (
            <div className="loader-container">
              <div className="dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
              <p className="loader-text">Loading, please wait...</p>
            </div>
          )}

          {videoData && (
            <div className="video-box">
              <div className="video-info">
                <img
                  src={videoData.thumbnail}
                  alt="Thumbnail"
                  className="thumbnail"
                />
                <div className="video-text">
                  <h2>{videoData.title}</h2>
                  <p>{videoData.duration}</p>
                </div>
              </div>

              <div className="format-list">
                {videoData.formate.map((format, idx) => (
                  <a
                    key={idx}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault(); // prevent default anchor behavior
                      if (!down) dowmnload_handle(format, idx); // prevent multiple clicks
                    }}
                    style={{
                      pointerEvents: down ? "none" : "auto",
                      opacity: down ? 0.6 : 1,
                      cursor: down ? "not-allowed" : "pointer",
                      position: "relative",
                    }}
                    className="download-button"
                  >
                    {format} - Download
                    {cindex === idx && down && (
                      <div
                        className="loader"
                      ></div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* <div className="steps">
            <span>🔗 Step 1: Paste your YouTube video link above.</span>
            <span>🎞️ Step 2: Click on the "Fetch Video" button.</span>
            <span>⬇️ Step 3: Choose quality and download your video.</span>
          </div> */}

          <div className="steps">
  <h3>🔍 How to Download YouTube Videos</h3>

  <div className="step-item">
    <strong>Step 1:</strong> <span>Copy the YouTube video link from your browser’s address bar or YouTube app.</span>
  </div>

  <div className="step-item">
    <strong>Step 2:</strong> <span>Paste the copied link into the input box above.</span>
  </div>

  <div className="step-item">
    <strong>Step 3:</strong> <span>Click the <b>"Fetch Video"</b> button to analyze the video details securely.</span>
  </div>

  <div className="step-item">
    <strong>Step 4:</strong> <span>Choose your desired video quality (e.g., 360p, 720p, 1080p) from the list.</span>
  </div>

  <div className="step-item">
    <strong>Step 5:</strong> <span>Click the <b>Download</b> button next to the quality you want — your video will start downloading instantly!</span>
  </div>

  <hr className="divider" />

  <h3>📄 Legal Notice</h3>
  <p className="legal-note">
    This tool is intended only for downloading royalty-free or user-owned videos from YouTube. Downloading copyrighted content without permission may violate YouTube’s Terms of Service. Please ensure you have rights to any video you download.
  </p>

  <h3>💡 Features You’ll Love</h3>
  <ul className="feature-list">
    <li>🚀 Fast, secure, and direct download</li>
    <li>🎯 Choose between multiple video qualities</li>
    <li>🖼️ Thumbnail preview and video info shown</li>
    <li>🔐 Token-based secure download system</li>
    <li>📱 Works on both desktop and mobile browsers</li>
  </ul>
</div>

        </div>
        {/* <footer className="footer">
          <p>© {new Date().getFullYear()} XYZ. All rights reserved.</p>
        </footer> */}
      </div>
    </div>
  );
}

export default Youtube