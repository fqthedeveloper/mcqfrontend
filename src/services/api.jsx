export const baseURL = 'http://localhost:8000'; // Change to your backend URL

// Helper to get auth headers with token from localStorage
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
      try { errMsg = await response.json(); } catch {}
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
      try { errMsg = await response.json(); } catch {}
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
      try { errMsg = await response.json(); } catch {}
      throw errMsg;
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

// Authenticated POST (JSON)

export const authPost = async (url, data) => {
  const token = localStorage.getItem('utd_auth');
  if (!token) throw new Error("No auth token found.");

  const response = await fetch(`${baseURL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,  // This is critical!
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorMsg =
      responseData.non_field_errors?.[0] ||
      responseData.detail ||
      'Something went wrong.';
    throw new Error(errorMsg);
  }

  return responseData;
};


// Authenticated PUT (JSON)
export const authPut = async (endpoint, data) => {
  try {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let errMsg = 'Unknown error occurred';
      try { errMsg = await response.json(); } catch {}
      throw errMsg;
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

// Authenticated POST for FormData (file uploads)
export const authPostFormData = async (endpoint, formData) => {
  try {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });
    if (!response.ok) {
      let errMsg = 'Unknown error occurred';
      try { errMsg = await response.json(); } catch {}
      throw errMsg;
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

// === Your specific API calls ===

// Get exam details
export const getExam = async (examId) => {
  return get(`/api/exams/${examId}/`);
};

// Start exam session (e.g., lock exam for user)
export const createExamSession = async (examId) => {
  return authPost(`/api/exams/${examId}/start_session/`, {});
};

// Submit answers for a session
export const submitAnswers = async (sessionId, answers) => {
  return authPost(`/api/sessions/${sessionId}/submit/`, { answers });
};

// Get exam result by result ID
export const getResult = async (resultId) => {
  return get(`/api/results/${resultId}/`);
};

// Check if the current user has already attempted this exam (returns boolean)
// Example backend endpoint: GET /api/exams/{examId}/attempted/
export const checkExamSubmission = async (examId) => {
  return authGet(`/api/exams/${examId}/attempted/`);
};

// Suspend the exam attempt (e.g., on tab leave or cheating detection)
// POST /api/exams/{examId}/suspend/ with reason in body
export const suspendExam = async (examId, reason) => {
  return authPost(`/api/exams/${examId}/suspend/`, { reason });
};
