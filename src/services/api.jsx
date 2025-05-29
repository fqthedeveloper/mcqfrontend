export const baseURL = 'http://localhost:8000'; // Change this to your backend server URL

// Helper to read auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('utd_auth');
  return token ? { Authorization: `Token ${token}` } : {};
};

// Generic GET (no auth)
export const get = async (endpoint) => {
  try {
    const response = await fetch(`${baseURL}${endpoint}`);
    if (!response.ok) {
      let errMsg = 'Unknown error occurred';
      try {
        errMsg = await response.json();
      } catch {}
      throw errMsg;
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

// Generic POST (no auth)
export const post = async (endpoint, data) => {
  try {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let errMsg = 'Unknown error occurred';
      try {
        errMsg = await response.json();
      } catch {}
      throw errMsg;
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

// Authenticated GET
export const authGet = async (endpoint) => {
  try {
    const response = await fetch(`${baseURL}${endpoint}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      let errMsg = 'Unknown error occurred';
      try {
        errMsg = await response.json();
      } catch {}
      throw errMsg;
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

// Authenticated POST (JSON)
export const authPost = async (endpoint, data) => {
  try {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let errMsg = 'Unknown error occurred';
      try {
        errMsg = await response.json();
      } catch {}
      throw errMsg;
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

// Authenticated POST for FormData (file uploads, no Content-Type header)
export const authPostFormData = async (endpoint, formData) => {
  try {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(), // DO NOT set 'Content-Type' manually here
      },
      body: formData,
    });
    if (!response.ok) {
      let errMsg = 'Unknown error occurred';
      try {
        errMsg = await response.json();
      } catch {}
      throw errMsg;
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

// Example custom API functions (optional)
export const getExam = async (examId) => {
  return get(`/exams/${examId}/`);
};

export const submitAnswers = async (examId, answers) => {
  return post(`/exams/${examId}/submit/`, { answers });
};

export const getResult = async (examId) => {
  return get(`/results/${examId}/`);
};
