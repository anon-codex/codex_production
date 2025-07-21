import React from 'react';
import './about.css';

const About = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">About Us</h1>

      <p>
        Welcome to <strong>InstaTube Downloader</strong> – your one-stop solution to easily save and enjoy public videos from platforms like <strong>YouTube</strong> and <strong>Instagram</strong>.
      </p>

      <h2>🌐 What We Do</h2>
      <p>
        We provide a simple and user-friendly web interface to download publicly accessible video content for personal offline use.
        Our service uses open-source tools to extract media content from URLs that users provide, without modifying or storing any copyrighted content on our servers.
      </p>

      <h2>🧾 Legal & Fair Use</h2>
      <p>
        This tool is intended <strong>only for personal and non-commercial use</strong>. We do not promote piracy or infringement of intellectual property rights.
        Downloading copyrighted content without the permission of the rightful owner is strictly prohibited.
        Users are responsible for ensuring that the content they download complies with the terms of the platform.
      </p>

      <h2>🛡️ Copyright & Content Policy</h2>
      <p>
        We do not host any video or audio content. All copyrights remain with the original content creators. If you are a copyright owner and have concerns,
        please reach out to us and we will take appropriate action.
      </p>

      <h2>🤝 Contact Us</h2>
      <p>
        For questions, feedback, or copyright issues, please contact us at: <a href="mailto:support@example.com">support@example.com</a>
      </p>

      <p className="disclaimer">
        Disclaimer: This website is not affiliated with YouTube, Instagram, or any of their subsidiaries.
      </p>
    </div>
  );
};

export default About;
