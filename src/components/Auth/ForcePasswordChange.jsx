// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { changePassword } from '../../services/auth';
// import { useAuth } from '../../context/authContext';

// export default function ForcePasswordChange() {
//   const [newPassword, setNewPassword] = useState('');
//   const [error, setError] = useState('');
//   const { user, login } = useAuth();
//   const navigate = useNavigate();

//   const handleChange = async (e) => {

//     e.preventDefault();
//     try {
//       await changePassword(newPassword);
//       const updatedUser = { ...user, force_password_change: false };
//       login(updatedUser, localStorage.getItem('auth_token'));

//       navigate(user.user_type === 'admin' ? '/admin' : '/student');
//     } catch {
//       setError('Password update failed.');
//     }
//   };

//   return (
//     <div className="auth-form">
//       <h2>Change Your Password</h2>
//       {error && <p className="error">{error}</p>}
//       <form onSubmit={handleChange}>
//         <input
//           type="password"
//           placeholder="New Password"
//           value={newPassword}
//           onChange={e => setNewPassword(e.target.value)}
//           required
//         />
//         <button type="submit">Update Password</button>
//       </form>
//     </div>
//   );
// }
