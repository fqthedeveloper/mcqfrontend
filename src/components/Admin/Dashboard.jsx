// src/components/Admin/Dashboard.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-cards">
        <Link to="/admin/users" className="card">
          <div className="card-icon">
            <i className="fas fa-users"></i>
          </div>
          <h3>User Management</h3>
          <p>Manage system users</p>
        </Link>
        
        <Link to="/admin/upload" className="card">
          <div className="card-icon">
            <i className="fas fa-file-upload"></i>
          </div>
          <h3>Upload Questions</h3>
          <p>Create new exams</p>
        </Link>
        
        <Link to="/admin/stats" className="card">
          <div className="card-icon">
            <i className="fas fa-chart-bar"></i>
          </div>
          <h3>Exam Statistics</h3>
          <p>View performance reports</p>
        </Link>
      </div>
      
      <style jsx>{`
        .admin-dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          min-height: calc(100vh - 60px);
        }
        
        h1 {
          text-align: center;
          margin: 30px 0 40px;
          color: #2c3e50;
          font-size: 2.5rem;
        }
        
        .dashboard-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          padding: 20px;
        }
        
        .card {
          background: white;
          border-radius: 15px;
          padding: 30px 25px;
          text-align: center;
          text-decoration: none;
          color: #34495e;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 2px solid transparent;
        }
        
        .card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
          border-color: #3498db;
        }
        
        .card-icon {
          width: 80px;
          height: 80px;
          background: #f8f9fa;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 25px;
          transition: all 0.3s ease;
        }
        
        .card:hover .card-icon {
          background: #3498db;
          transform: scale(1.1);
        }
        
        .card-icon i {
          font-size: 36px;
          color: #3498db;
          transition: all 0.3s ease;
        }
        
        .card:hover .card-icon i {
          color: white;
        }
        
        .card h3 {
          font-size: 1.8rem;
          margin-bottom: 15px;
          color: #2c3e50;
        }
        
        .card p {
          font-size: 1.1rem;
          color: #7f8c8d;
          margin: 0;
          line-height: 1.6;
        }
        
        /* Responsive Design */
        @media (max-width: 1024px) {
          .dashboard-cards {
            gap: 25px;
          }
          
          .card {
            padding: 25px 20px;
          }
        }
        
        @media (max-width: 768px) {
          h1 {
            font-size: 2.2rem;
            margin: 20px 0 30px;
          }
          
          .dashboard-cards {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            padding: 10px;
          }
          
          .card-icon {
            width: 70px;
            height: 70px;
          }
          
          .card h3 {
            font-size: 1.6rem;
          }
        }
        
        @media (max-width: 480px) {
          .admin-dashboard {
            padding: 15px;
          }
          
          h1 {
            font-size: 2rem;
            margin: 15px 0 25px;
          }
          
          .dashboard-cards {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .card {
            padding: 30px 20px;
          }
        }
        
        @media (max-width: 360px) {
          .card-icon {
            width: 60px;
            height: 60px;
          }
          
          .card-icon i {
            font-size: 30px;
          }
          
          .card h3 {
            font-size: 1.4rem;
          }
          
          .card p {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}