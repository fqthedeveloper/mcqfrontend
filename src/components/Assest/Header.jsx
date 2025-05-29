import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="main-header">
      <div className="container header-container">
        <div className="logo">
          <Link to="/">IRT MCQ App</Link>
        </div>
        
        <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <Link to="/admin" onClick={() => setMenuOpen(false)}>DashBoard</Link>
          <Link to="/admin/add-exam" onClick={() => setMenuOpen(false)}>Exam Add</Link>
          <Link to="/admin/upload" onClick={() => setMenuOpen(false)}>Question Upload</Link>         
          {user ? (
            <div className="user-section">
              <span className="username">Hi, {user.first_name || user.username}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-btn" onClick={() => setMenuOpen(false)}>
              Login
            </Link>
          )}
        </div>
        
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle navigation">
          <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>
      
      <style jsx>{`
        .main-header {
          background: linear-gradient(135deg, #2575fc 0%, #6a11cb 100%);
          color: white;
          padding: 15px 0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .logo a {
          color: white;
          font-size: 1.8rem;
          font-weight: 700;
          text-decoration: none;
          display: flex;
          align-items: center;
        }
        
        .logo a:hover {
          opacity: 0.9;
        }
        
        .nav-links {
          display: flex;
          align-items: center;
          gap: 25px;
        }
        
        .nav-links a {
          color: rgba(255, 255, 255, 0.85);
          text-decoration: none;
          font-weight: 500;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }
        
        .nav-links a:hover {
          color: white;
          transform: translateY(-2px);
        }
        
        .login-btn, .logout-btn {
          background: rgba(255, 255, 255, 0.15);
          border: 2px solid white;
          border-radius: 30px;
          padding: 8px 20px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .login-btn:hover, .logout-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
        }
        
        .user-section {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .username {
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .menu-toggle {
          display: none;
          background: transparent;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
        }
        
        /* Responsive Design */
        @media (max-width: 992px) {
          .nav-links {
            gap: 15px;
          }
          
          .login-btn, .logout-btn {
            padding: 6px 15px;
          }
        }
        
        @media (max-width: 768px) {
          .header-container {
            flex-wrap: wrap;
          }
          
          .nav-links {
            position: absolute;
            top: 70px;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #2575fc 0%, #6a11cb 100%);
            flex-direction: column;
            padding: 20px 0;
            gap: 20px;
            clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
            transition: all 0.4s ease;
          }
          
          .nav-links.active {
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          }
          
          .nav-links a, .user-section {
            width: 100%;
            text-align: center;
            padding: 10px 0;
          }
          
          .menu-toggle {
            display: block;
          }
        }
        
        @media (max-width: 480px) {
          .logo a {
            font-size: 1.5rem;
          }
          
          .menu-toggle {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </header>
  );
}