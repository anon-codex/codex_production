import React, { useState } from "react";
import axios from "axios";
import "./instadown.css";

const Instadown = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const fetchVideo = async () => {
    if (!url) return;
    setLoading(true);
    setError("");
    setVideoData(null);

    try {
      const res = await axios.post("http://localhost:8080/api/insta", {
        videoURL: url,
      });
      const jwt = res.data.jwt_token;
      localStorage.setItem("token", jwt);
      setVideoData(res.data);
    } catch (err) {
      setError("Failed to fetch video info.");
    } finally {
      setLoading(false);
    }
  };

  const downloadHandle = async () => {
    // if (!videoData?.download_link) return;
    const videoUrl = videoData.video;
    const title = videoData.title;
    const token = localStorage.getItem("token");
    setDownloading(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/api/download_insta",
        { videoUrl, title },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const video_url = response.data.download_link;
      try {
        const link = document.createElement("a");
        link.href = `${video_url}`; // 👈 Your static file
        link.setAttribute("download", "reel.mp4"); // Force download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Download failed:", err.message);
        alert("Download failed. Please check the link.");
      } finally {
        setDownloading(false);
      }
    } catch (error) {
      setDownloading(false);
    }
  };

  return (
    <div className="wrapper">
      <div className="container">
        <div className="content">
          <div className="header">
            <h1>Instagram Video Downloader</h1>
            <p>Download Instagram videos — fast and easy!</p>
          </div>

          <div className="input-section">
            <input
              type="text"
              placeholder="Paste Instagram video link..."
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
                </div>
              </div>

              <div className="format-list">
                <button
                  onClick={downloadHandle}
                  disabled={downloading}
                  className="download-button"
                  style={{
                    pointerEvents: downloading ? "none" : "auto",
                    opacity: downloading ? 0.6 : 1,
                    cursor: downloading ? "not-allowed" : "pointer",
                    position: "relative",
                  }}
                >
                  {downloading ? "Downloading..." : "Download"}
                  {downloading && <div className="loader"></div>}
                </button>
              </div>
            </div>
          )}

          {/* <div className="steps">
            <span>🔗 Step 1: Paste your Instagram video link above.</span>
            <span>🎞️ Step 2: Click on the "Fetch Video" button.</span>
            <span>⬇️ Step 3: Download the video instantly.</span>
          </div> */}

          <div className="steps">
            <h3>📥 How to Download Instagram Reels</h3>

            <div className="step-item">
              <strong>Step 1:</strong>{" "}
              <span>
                Open the Instagram app or website and navigate to the Reel you
                want to download.
              </span>
            </div>

            <div className="step-item">
              <strong>Step 2:</strong>{" "}
              <span>
                Tap on the three dots (•••) on the Reel and select{" "}
                <b>"Copy Link"</b>.
              </span>
            </div>

            <div className="step-item">
              <strong>Step 3:</strong>{" "}
              <span>Paste the copied Reel link into the input box above.</span>
            </div>

            <div className="step-item">
              <strong>Step 4:</strong>{" "}
              <span>
                Click the <b>"Fetch Video"</b> button to retrieve the video
                details securely.
              </span>
            </div>

            <div className="step-item">
              <strong>Step 5:</strong>{" "}
              <span>Choose the desired video quality from the list.</span>
            </div>

            <div className="step-item">
              <strong>Step 6:</strong>{" "}
              <span>
                Click the <b>Download</b> button next to your selected quality
                to start downloading the Reel.
              </span>
            </div>

            <hr className="divider" />

            <h3>📄 Legal Notice</h3>
            <p className="legal-note">
              This tool is designed to download Instagram Reels for personal use
              only. Please respect copyright laws and do not download or
              distribute content without permission from the original creator.
            </p>

            <h3>💡 Features You’ll Love</h3>
            <ul className="feature-list">
              <li>🚀 Quick and secure Reel downloads</li>
              <li>🎯 Multiple video quality options available</li>
              <li>🖼️ Preview Reel thumbnails and info</li>
              <li>🔐 Secure token-based downloading</li>
              <li>📱 Fully responsive on mobile and desktop</li>
            </ul>
          </div>
        </div>

        {/* <footer className="footer">
          <p>© {new Date().getFullYear()} XYZ. All rights reserved.</p>
        </footer> */}
      </div>
    </div>
  );
};

export default Instadown;
