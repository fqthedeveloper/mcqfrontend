export const baseURL = 'http://localhost:8000'; // Change to your Django server's actual URL

// Helper to read auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('utd_auth');
  return token ? { Authorization: `Token ${token}` } : {};
};

// Generic GET request
export const get = async (endpoint) => {
  try {
    const response = await fetch(`${baseURL}${endpoint}`);
    if (!response.ok) throw await response.json();
    return response.json();
  } catch (error) {
    throw error;
  }
};

// Generic POST request
export const post = async (endpoint, data) => {
  try {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw await response.json();
    return response.json();
  } catch (error) {
    throw error;
  }
};

// Authenticated GET
export const authGet = async (endpoint, token = null) => {
  try {
    const response = await fetch(`${baseURL}${endpoint}`, {
      headers: {
        ...getAuthHeaders(),
        ...(token && { Authorization: `Token ${token}` }),
      },
    });
    if (!response.ok) throw await response.json();
    return response.json();
  } catch (error) {
    throw error;
  }
};

// Authenticated POST
export const authPost = async (endpoint, data, token = null) => {
  try {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...(token && { Authorization: `Token ${token}` }),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw await response.json();
    return response.json();
  } catch (error) {
    throw error;
  }
};

// Custom API functions
export const getExam = async (examId) => {
  return get(`/exams/${examId}`);
};

export const submitAnswers = async (examId, answers) => {
  return post(`/exams/${examId}/submit`, { answers });
};

export const getResult = async (examId) => {
  return get(`/results/${examId}`);
};
