// src/components/admin/ExamForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authGet } from '../../services/api';
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '../../context/authContext';
import '../CSS/ExamForm.css';



const ExamForm = ({ isEdit }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [exam, setExam] = useState({
    title: '',
    subject: '',
    mode: 'practice',
    duration: 60,
    start_time: '',
    end_time: '',
    selected_questions: [],
    notification_message: 'A new exam has been scheduled. Please check your dashboard for details.'
  });
  const [allQuestions, setAllQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState({
    subject: '',
    search: ''
  });

  useEffect(() => {
        document.title = "Add Exam";
      }, []);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch questions
        const questionsRes = await axios.get('http://127.0.0.1:8000/api/questions/', {
          headers: { Authorization: `Token ${token}` }
        });
        setAllQuestions(questionsRes.data);
        
        // Fetch subjects
        const subjectsRes = await axios.get('http://127.0.0.1:8000/api/subjects/', {
          headers: { Authorization: `Token ${token}` }
        });
        setSubjects(subjectsRes.data);
        
        // If editing, fetch exam data
        if (isEdit) {
          const examRes = await axios.get(`http://127.0.0.1:8000/api/exams/${id}/`, {
            headers: { Authorization: `Token ${token}` }
          });
          setExam({
            ...examRes.data,
            selected_questions: examRes.data.questions.map(q => q.id)
          });
        }
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEdit, token]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setExam(prev => ({ ...prev, [name]: value }));
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  // Toggle question selection
  const handleQuestionSelect = (questionId) => {
    setExam(prev => {
      const newSelected = [...prev.selected_questions];
      const index = newSelected.indexOf(questionId);
      
      if (index > -1) {
        newSelected.splice(index, 1);
      } else {
        newSelected.push(questionId);
      }
      
      return { ...prev, selected_questions: newSelected };
    });
  };

  // Move question in the list
  const handleMoveQuestion = (index, direction) => {
    setExam(prev => {
      const newSelected = [...prev.selected_questions];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (targetIndex >= 0 && targetIndex < newSelected.length) {
        [newSelected[index], newSelected[targetIndex]] = 
          [newSelected[targetIndex], newSelected[index]];
      }
      
      return { ...prev, selected_questions: newSelected };
    });
  };

  // Filter questions based on criteria
  const filteredQuestions = allQuestions.filter(q => {
  const matchesSubject = filter.subject ? q.subject.id == filter.subject : true;
  const matchesSearch = filter.search
    ? q.text.toLowerCase().includes(filter.search.toLowerCase())
    : true;
  return matchesSubject && matchesSearch;
});

  // Get selected question details
  const selectedQuestionDetails = exam.selected_questions
    .map(id => allQuestions.find(q => q.id === id))
    .filter(q => q); // Remove undefined

  // Submit exam (save or update)
  const handleSubmit = async (e, publish = false) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const examData = { 
        ...exam, 
        is_published: publish 
      };
      
      let response;
      if (isEdit) {
        response = await axios.put(`http://127.0.0.1:8000/api/exams/${id}/`, examData, {
          headers: { Authorization: `Token ${token}` }
        });
      } else {
        response = await axios.post('http://127.0.0.1:8000/api/exams/', examData, {
          headers: { Authorization: `Token ${token}` }
        });
      }
      
      setSuccess(`${isEdit ? 'Updated' : 'Created'} exam successfully!`);
      
      // If publishing, send notifications
      if (publish) {
        await axios.post(`http://127.0.0.1:8000/api/exams/${response.data.id}/publish/`, {
          message: exam.notification_message
        }, {
          headers: { Authorization: `Token ${token}` }
        });
        setSuccess(prev => prev + ' Notifications sent to students!');
      }
      
      // Redirect after delay
      setTimeout(() => navigate('/admin/exams'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save exam');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="exam-form-container">
      <h2>{isEdit ? 'Edit Exam' : 'Create New Exam'}</h2>
      
      {/* Success/Error Messages */}
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={(e) => handleSubmit(e, false)}>
        {/* Exam Details */}
        <div className="form-section">
          <h3>Exam Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Title*</label>
              <input
                type="text"
                name="title"
                value={exam.title}
                onChange={handleChange}
                required
                placeholder="Enter exam title"
              />
            </div>
            
            <div className="form-group">
              <label>Subject*</label>
              <select
                name="subject"
                value={exam.subject}
                onChange={handleChange}
                required
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Mode*</label>
              <select
                name="mode"
                value={exam.mode}
                onChange={handleChange}
                required
              >
                <option value="practice">Practice</option>
                <option value="strict">Strict</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Duration (minutes)*</label>
              <input
                type="number"
                name="duration"
                value={exam.duration}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="datetime-local"
                name="start_time"
                value={exam.start_time}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label>End Time</label>
              <input
                type="datetime-local"
                name="end_time"
                value={exam.end_time}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Notification Message */}
        <div className="form-section">
          <h3>Notification Message</h3>
          <div className="form-group">
            <textarea
              name="notification_message"
              value={exam.notification_message}
              onChange={handleChange}
              rows="3"
              placeholder="Message to send to students"
            />
          </div>
        </div>

        {/* Question Selection */}
        <div className="form-section">
          <div className="section-header">
            <h3>Select Questions</h3>
            <div className="selection-count">
              {exam.selected_questions.length} selected
            </div>
          </div>
          
          {/* Filters */}
          <div className="filters">
            <div className="form-group">
              <label>Filter by Subject</label>
              <select
                name="subject"
                value={filter.subject}
                onChange={handleFilterChange}
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Search Questions</label>
              <input
                type="text"
                name="search"
                value={filter.search}
                onChange={handleFilterChange}
                placeholder="Search question text..."
              />
            </div>
          </div>
          
          {/* Question Lists */}
          <div className="question-lists-container">
            {/* Available Questions */}
            <div className="question-list available-questions">
              <h4>Available Questions ({filteredQuestions.length})</h4>          <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      const top100 = filteredQuestions.slice(0, 100).map(q => q.id);
                      setExam(prev => ({
                        ...prev,
                        selected_questions: Array.from(new Set([...prev.selected_questions, ...top100]))
                      }));
                    }
                  }}
                />{' '}
                Select Top 100 Questions
              </label>
            </div>

              <div className="questions-container">
                {filteredQuestions.map(question => (
                  <div
                    key={question.id}
                    className={`question-item ${
                      exam.selected_questions.includes(question.id) ? 'selected' : ''
                    }`}
                    onClick={() => handleQuestionSelect(question.id)}
                  >
                    <div className="question-checkbox">
                      <input
                        type="checkbox"
                        checked={exam.selected_questions.includes(question.id)}
                        onChange={() => handleQuestionSelect(question.id)}
                      />
                    </div>
                    <div className="question-content">
                      <div className="question-text">{question.text}</div>
                      <div className="question-meta">
                        <span>Subject: {subjects.find(s => s.id === question.subject.id)?.name}</span>
                        <span>Marks: {question.marks}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Selected Questions */}
            <div className="question-list selected-questions">
              <h4>Selected Questions</h4>
              
              <div className="questions-container">
                {selectedQuestionDetails.length > 0 ? (
                  selectedQuestionDetails.map((question, index) => (
                    <div key={question.id} className="question-item selected">
                      <div className="question-header">
                        <div className="question-order">#{index + 1}</div>
                        <div className="question-actions">
                          <button
                            type="button"
                            onClick={() => handleMoveQuestion(index, 'up')}
                            disabled={index === 0}
                          >
                            <FaArrowUp />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveQuestion(index, 'down')}
                            disabled={index === selectedQuestionDetails.length - 1}
                          >
                            <FaArrowDown />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuestionSelect(question.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      <div className="question-content">
                        <div className="question-text">{question.text}</div>
                        <div className="question-meta">
                          <span>Marks: {question.marks}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    No questions selected. Select questions from the left panel.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/exams')}
            className="btn-cancel"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="btn-save"
          >
            {isEdit ? 'Update Exam' : 'Save as Draft'}
          </button>
          
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            className="btn-publish"
            disabled={exam.selected_questions.length === 0}
          >
            <FaPaperPlane /> {isEdit ? 'Update & Publish' : 'Publish Exam'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExamForm;