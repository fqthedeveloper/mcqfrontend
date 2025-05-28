// src/services/auth.jsimport { baseURL } from './api';
import { baseURL } from './api';

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${baseURL}/api/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      // Handle different error formats
      const errorMsg = responseData.non_field_errors?.[0] || 
                       responseData.detail || 
                       'Login failed';
      throw new Error(errorMsg);
    }
    
    return responseData;
  } catch (error) {
    throw new Error(error.message || 'An error occurred during login');
  }
};



export const resetPassword = async (email) => {
  return baseURL('/auth/reset-password', { email });
};