import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/authContext';
import '../CSS/ExamForm.css';

const EditExamDetails = () => {
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
    notification_message: ''
  });

  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [oldQuestionIds, setOldQuestionIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subjectsRes = await axios.get('http://127.0.0.1:8000/api/subjects/', {
          headers: { Authorization: `Token ${token}` }
        });
        setSubjects(subjectsRes.data);

        const examRes = await axios.get(`http://127.0.0.1:8000/api/exams/${id}/`, {
          headers: { Authorization: `Token ${token}` }
        });

        const data = examRes.data;
        setExam({
          title: data.title || '',
          subject: data.subject || '',
          mode: data.mode || 'practice',
          duration: data.duration || 60,
          start_time: data.start_time ? data.start_time.slice(0, 16) : '',
          end_time: data.end_time ? data.end_time.slice(0, 16) : '',
          notification_message: data.notification_message || ''
        });

        setQuestions(data.questions || []);
        setOldQuestionIds((data.questions || []).map(q => q.id));
      } catch (err) {
        setError('Error fetching exam.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExam(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const addNewQuestion = () => {
    setQuestions([...questions, {
      text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: ''
    }]);
  };

  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Update exam details
      await axios.put(`http://127.0.0.1:8000/api/exams/${id}/`, exam, {
        headers: { Authorization: `Token ${token}` }
      });

      // Delete old questions
      for (const qid of oldQuestionIds) {
        await axios.delete(`http://127.0.0.1:8000/api/questions/${qid}/`, {
          headers: { Authorization: `Token ${token}` }
        });
      }

      // Create new questions
      for (const q of questions) {
        await axios.post(`http://127.0.0.1:8000/api/questions/`, {
          ...q,
          exam: id
        }, {
          headers: { Authorization: `Token ${token}` }
        });
      }

      setSuccess('Exam and questions replaced successfully.');
      setTimeout(() => navigate('/admin/exams'), 2000);
    } catch (err) {
      setError('Failed to update exam/questions.');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="exam-form-container">
      <h2>Edit Exam (Replace Questions)</h2>

      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Title*</label>
            <input type="text" name="title" value={exam.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Subject*</label>
            <select name="subject" value={exam.subject} onChange={handleChange} required>
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Mode*</label>
            <select name="mode" value={exam.mode} onChange={handleChange} required>
              <option value="practice">Practice</option>
              <option value="strict">Strict</option>
            </select>
          </div>

          <div className="form-group">
            <label>Duration (minutes)*</label>
            <input type="number" name="duration" value={exam.duration} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Start Time</label>
            <input type="datetime-local" name="start_time" value={exam.start_time} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>End Time</label>
            <input type="datetime-local" name="end_time" value={exam.end_time} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label>Notification Message</label>
          <textarea
            name="notification_message"
            value={exam.notification_message}
            onChange={handleChange}
            rows="2"
          />
        </div>

        <h3>Questions</h3>
        {questions.map((q, index) => (
          <div key={index} className="question-edit-box">
            <label>Question {index + 1}</label>
            <textarea
              value={q.text}
              onChange={e => handleQuestionChange(index, 'text', e.target.value)}
              rows="2"
              required
            />

            <div className="form-grid">
              <input
                type="text"
                value={q.option_a}
                onChange={e => handleQuestionChange(index, 'option_a', e.target.value)}
                placeholder="Option A"
                required
              />
              <input
                type="text"
                value={q.option_b}
                onChange={e => handleQuestionChange(index, 'option_b', e.target.value)}
                placeholder="Option B"
                required
              />
              <input
                type="text"
                value={q.option_c}
                onChange={e => handleQuestionChange(index, 'option_c', e.target.value)}
                placeholder="Option C"
                required
              />
              <input
                type="text"
                value={q.option_d}
                onChange={e => handleQuestionChange(index, 'option_d', e.target.value)}
                placeholder="Option D"
                required
              />
            </div>

            <div>
              <label>Correct Answer (A/B/C/D)</label>
              <input
                type="text"
                value={q.correct_answer}
                onChange={e => handleQuestionChange(index, 'correct_answer', e.target.value.toUpperCase())}
                maxLength={1}
                required
              />
            </div>

            <button type="button" onClick={() => removeQuestion(index)} className="btn btn-danger">
              Remove
            </button>
          </div>
        ))}

        <button type="button" onClick={addNewQuestion} className="btn btn-secondary">
          + Add Question
        </button>

        <div className="form-group">
          <button type="submit" className="btn btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  );
};

export default EditExamDetails;
