import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authContext';
import { ExamProvider } from './context/examContext';
import Login from './components/Auth/Login';
import PasswordReset from './components/Auth/PasswordReset';
import Dashboard from './components/Admin/Dashboard';
import UserManagement from './components/Admin/UserManagement';
import QuestionUpload from './components/Admin/QuestionUpload';
import ExamList from './components/Student/ExamList';
import Exam from './components/Student/Exam';
import Result from './components/Student/Result';
import ForcePasswordChange from './components/Auth/ForcePasswordChange';
import Header from './components/Assest/Header';
import Footer from './components/Assest/Footer';
import './App.css';
import AddStudent from './components/Admin/AddStudent';
import ExamForm from './components/Admin/ExamForm';
import AdminExamList from './components/Admin/AdminExamList';
import EditExamDetails from './components/Admin/EditExamDetails';


// Debugging wrapper
const RouteDebugger = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    console.log('Current Route:', location.pathname);
    console.log('Auth State:', { user, loading });
  }, [location, user, loading]);

  return null;
};

// Auth Route Component
const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="d-flex justify-content-center mt-5"><div className="spinner-border"></div></div>;
  }

  if (user) {
    // Redirect based on user role and password change requirement
    if (user.force_password_change) {
      return <Navigate to="/change-password" replace />;
    }
    
    const target = user.role === 'admin' ? '/admin' : '/student';
    return <Navigate to={target} replace />;
  }
  
  return children;
};

// Protected Route Component
const ProtectedRoute = ({ element, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="d-flex justify-content-center mt-5"><div className="spinner-border"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.force_password_change && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // Use user.role for permission checks
  const hasPermission = allowedRoles.length === 0 || allowedRoles.includes(user.role);
  
  if (!hasPermission) {
    console.warn(`Access denied for role: ${user.role} to route: ${location.pathname}`);
    return <Navigate to="/access-denied" replace />;
  }

  return element;
};

// Access Denied Component
const AccessDenied = () => (
  <div className="container text-center mt-5">
    <h2 className="text-danger">Access Denied</h2>
    <p>You don't have permission to view this page.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ExamProvider>
        <Router>
          <Header />
          <RouteDebugger />
          <div className="main-content">
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={
                <AuthRoute>
                  <Login />
                </AuthRoute>
              } />
              
              <Route path="/password-reset" element={
                <AuthRoute>
                  <PasswordReset />
                </AuthRoute>
              } />
              
              {/* Password Change Route */}
              <Route path="/change-password" element={
                <ProtectedRoute element={<ForcePasswordChange />} allowedRoles={['admin', 'student']} />
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute element={<Dashboard />} allowedRoles={['admin']} />
              } />
              
              <Route path="/admin/add-student" element={
                <ProtectedRoute element={<AddStudent />} allowedRoles={['admin']} />
              } />
              
              <Route path="/admin/upload" element={
                <ProtectedRoute element={<QuestionUpload />} allowedRoles={['admin']} />
              } />
              
              <Route path="/admin/add-exam" element={
                <ProtectedRoute element={<ExamForm />} allowedRoles={['admin']} />
              } />

              <Route path="/admin/exam-list" element={
                <ProtectedRoute element={<AdminExamList />} allowedRoles={['admin']} />
              } />

              {/* Corrected edit route */}
              <Route path="/admin/exams/:id/edit" 
                element={<ProtectedRoute element={<EditExamDetails />} allowedRoles={['admin']} />
             } />

              {/* Student Routes */}
              <Route path="/student" element={
                <ProtectedRoute element={<ExamList />} allowedRoles={['student']} />
              } />
              
              <Route path="/exam/:id" element={
                <ProtectedRoute element={<Exam />} allowedRoles={['student']} />
              } />
              
              <Route path="/result" element={
                <ProtectedRoute element={<Result />} allowedRoles={['student']} />
              } />
              
              {/* System Routes */}
              <Route path="/access-denied" element={<AccessDenied />} />
              
              {/* Default Route */}
              <Route path="/" element={
                <AuthRoute>
                  <Navigate to="/login" replace />
                </AuthRoute>
              } />
              
              {/* Catch-all Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Footer />
        </Router>
      </ExamProvider>
    </AuthProvider>
  );
}

export default App;