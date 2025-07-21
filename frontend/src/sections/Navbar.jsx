import React from 'react';
import './navbar.css';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">📥 InstaTube</Link>
      </div>

      <ul className="navbar-links">
        <li><Link to="/">YouTube</Link></li>
        <li><Link to="/insta">Instagram</Link></li>
        {/* Future buttons */}
        <li><Link to="/tiktok">TikTok</Link></li>
        <li><Link to="/linkedin">LinkedIn</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
