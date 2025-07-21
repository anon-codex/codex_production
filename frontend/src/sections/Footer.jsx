// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-top">
        <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/dmca">DMCA</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Video Downloader. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
