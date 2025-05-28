import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authContext';
import { ExamProvider } from './context/examContext';
import Layout from './components/Shared/Layout';
import Login from './components/Auth/Login';
import PasswordReset from './components/Auth/PasswordReset';
import Dashboard from './components/Admin/Dashboard';
import UserManagement from './components/Admin/UserManagement';
import QuestionUpload from './components/Admin/QuestionUpload';
import ExamList from './components/Student/ExamList';
import Exam from './components/Student/Exam';
import Result from './components/Student/Result';
import './App.css'; 
import Header from './components/Assest/Header';
import Footer from './components/Assest/Footer';

// Protected Route Component
const ProtectedRoute = ({ element, roles = [] }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return element;
};

function App() {
  return (
    <AuthProvider>
      <ExamProvider>
        <Router>
          <Header />
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={<ProtectedRoute element={<Dashboard />} roles={['admin']} />} 
            />
            <Route 
              path="/admin/users" 
              element={<ProtectedRoute element={<UserManagement />} roles={['admin']} />} 
            />
            <Route 
              path="/admin/upload" 
              element={<ProtectedRoute element={<QuestionUpload />} roles={['admin']} />} 
            />
            
            {/* Student Routes */}
            <Route 
              path="/student" 
              element={<ProtectedRoute element={<ExamList />} roles={['student']} />} 
            />
            <Route 
              path="/exam/:id" 
              element={<ProtectedRoute element={<Exam />} roles={['student']} />} 
            />
            <Route 
              path="/result" 
              element={<ProtectedRoute element={<Result />} roles={['student']} />} 
            />
            
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </Router>
      </ExamProvider>
    </AuthProvider>
  );
}

export default App;