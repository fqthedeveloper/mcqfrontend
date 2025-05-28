import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExam, createExam, updateExam, getQuestions } from '../../services/api';
import { useAuth } from '../../context/authContext';

const ExamForm = ({ isEdit }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState({
    title: '',
    subject: '',
    mode: 'practice',
    duration: 60,
    selected_questions: []
  });
  const [allQuestions, setAllQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const questions = await getQuestions();
        setAllQuestions(questions);
        setFilteredQuestions(questions);
        
        if (isEdit) {
          const examData = await getExam(id);
          setExam({
            ...examData,
            selected_questions: examData.questions.map(q => q.id)
          });
        }
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isEdit]);

  useEffect(() => {
    let result = allQuestions;
    
    if (subjectFilter) {
      result = result.filter(q => q.subject == subjectFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(q => 
        q.text.toLowerCase().includes(term) ||
        q.subject.toLowerCase().includes(term)
      );
    }
    
    setFilteredQuestions(result);
  }, [subjectFilter, searchTerm, allQuestions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExam(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionSelect = (questionId) => {
    setExam(prev => {
      if (prev.selected_questions.includes(questionId)) {
        return {
          ...prev,
          selected_questions: prev.selected_questions.filter(id => id !== questionId)
        };
      } else {
        return {
          ...prev,
          selected_questions: [...prev.selected_questions, questionId]
        };
      }
    });
  };

  const handleMoveQuestion = (fromIndex, toIndex) => {
    const newSelected = [...exam.selected_questions];
    const [moved] = newSelected.splice(fromIndex, 1);
    newSelected.splice(toIndex, 0, moved);
    
    setExam(prev => ({ ...prev, selected_questions: newSelected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateExam(id, exam);
      } else {
        await createExam(exam);
      }
      navigate('/admin/exams');
    } catch (err) {
      setError('Failed to save exam');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container">
      <h2>{isEdit ? 'Edit Exam' : 'Create New Exam'}</h2>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title:</label>
          <input 
            type="text" 
            name="title" 
            value={exam.title} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label>Subject:</label>
          <input 
            type="text" 
            name="subject" 
            value={exam.subject} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label>Mode:</label>
          <select name="mode" value={exam.mode} onChange={handleChange}>
            <option value="practice">Practice</option>
            <option value="strict">Strict</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Duration (minutes):</label>
          <input 
            type="number" 
            name="duration" 
            value={exam.duration} 
            onChange={handleChange} 
            min="1"
            required 
          />
        </div>
        
        <div className="question-selection">
          <h3>Select Questions ({exam.selected_questions.length} selected)</h3>
          
          <div className="filters">
            <div className="filter-group">
              <label>Subject:</label>
              <input 
                type="text" 
                placeholder="Filter by subject" 
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label>Search:</label>
              <input 
                type="text" 
                placeholder="Search questions..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="question-lists">
            <div className="available-questions">
              <h4>Available Questions ({filteredQuestions.length})</h4>
              <div className="question-scroll">
                {filteredQuestions.map(question => (
                  <div 
                    key={question.id} 
                    className={`question-item ${exam.selected_questions.includes(question.id) ? 'selected' : ''}`}
                    onClick={() => handleQuestionSelect(question.id)}
                  >
                    <input 
                      type="checkbox" 
                      checked={exam.selected_questions.includes(question.id)} 
                      onChange={() => handleQuestionSelect(question.id)} 
                    />
                    <div className="question-text">{question.text}</div>
                    <div className="question-meta">
                      <span>Subject: {question.subject}</span>
                      <span>Marks: {question.marks}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="selected-questions">
              <h4>Selected Questions</h4>
              {exam.selected_questions.length === 0 ? (
                <p>No questions selected</p>
              ) : (
                <div className="question-scroll">
                  {exam.selected_questions.map((questionId, index) => {
                    const question = allQuestions.find(q => q.id === questionId);
                    if (!question) return null;
                    
                    return (
                      <div key={questionId} className="question-item selected">
                        <div className="question-header">
                          <span className="order">#{index + 1}</span>
                          <button 
                            type="button" 
                            className="remove-btn"
                            onClick={() => handleQuestionSelect(questionId)}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="question-text">{question.text}</div>
                        <div className="question-actions">
                          {index > 0 && (
                            <button 
                              type="button"
                              onClick={() => handleMoveQuestion(index, index - 1)}
                            >
                              ↑
                            </button>
                          )}
                          {index < exam.selected_questions.length - 1 && (
                            <button 
                              type="button"
                              onClick={() => handleMoveQuestion(index, index + 1)}
                            >
                              ↓
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <button type="submit">Save Exam</button>
      </form>
    </div>
  );
};

export default ExamForm;