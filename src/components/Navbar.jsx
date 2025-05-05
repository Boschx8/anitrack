// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import SearchBar from './SearchBar';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, login, logout, isLoading } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo">AniTrack</Link>
        <div className={`nav-links ${isMenuOpen ? 'nav-active' : ''}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/catalog" onClick={() => setIsMenuOpen(false)}>Catalog</Link>
          <Link to="/collections" onClick={() => setIsMenuOpen(false)}>Collections</Link>
          {/* Mobile-only buttons */}
          <div className="mobile-auth-buttons">
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="login-btn">Profile</Link>
                <button onClick={logout} className="register-btn">Log out</button>
              </>
            ) : (
              <>
                <button onClick={login} className="login-btn">Log in</button>
                <button onClick={login} className="register-btn">Register</button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="nav-right">
        <div className="search-container">
          <SearchBar />
        </div>
        <div className="desktop-auth-buttons">
          {isLoading ? (
            <span>Loading...</span>
          ) : isAuthenticated ? (
            <>
             <Link to="/profile" className="profile-btn">
                {user?.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="profile-picture"
                  />
                ) : (
                  <User size={20} className="user-icon" />
                )}
                <span className="username">{user?.name}</span>
              </Link>
              <button onClick={logout} className="register-btn">Log out</button>
            </>
          ) : (
            <>
              <button onClick={login} className="login-btn">Log in</button>
              <button onClick={login} className="register-btn">Register</button>
            </>
          )}
        </div>
        <button className="menu-btn" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;