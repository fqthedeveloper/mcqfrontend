import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useExam } from '../../context/examContext';
import { getExam, submitAnswers, checkExamSubmission, createExamSession } from '../../services/api';
import '../CSS/Exam.css';

const LOCAL_STORAGE_KEY = 'exam-progress';
const EXAM_MODE = {
  PRACTICE: 'practice',
  STRICT: 'strict'
};

// Enhanced option parsing that handles various formats
const parseOptions = (options) => {
  // Handle null/undefined
  if (!options) return [];
  
  // If already an array, return as-is
  if (Array.isArray(options)) return options;
  
  // If it's a string that looks like JSON
  if (typeof options === 'string') {
    try {
      // Try parsing as JSON
      const parsed = JSON.parse(options);
      
      // Handle different parsed types
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (typeof parsed === 'object' && parsed !== null) {
        // Convert object to array of values
        return Object.values(parsed);
      } else if (typeof parsed === 'string') {
        // Handle nested JSON strings
        try {
          const doubleParsed = JSON.parse(parsed);
          if (Array.isArray(doubleParsed)) return doubleParsed;
          if (typeof doubleParsed === 'object') return Object.values(doubleParsed);
          return [parsed];
        } catch {
          return [parsed];
        }
      }
      return [parsed];
    } catch (error) {
      // Handle special case of escaped JSON strings
      if (options.includes('\\"')) {
        try {
          const unescaped = options.replace(/\\"/g, '"');
          const parsed = JSON.parse(unescaped);
          if (Array.isArray(parsed)) return parsed;
          if (typeof parsed === 'object') return Object.values(parsed);
        } catch (e) {
          // Fall through to other methods
        }
      }
      
      // Handle key:value format
      if (options.includes(':')) {
        try {
          const keyValuePairs = options.split(',')
            .map(pair => {
              const match = pair.match(/["']?([^"':]+)["']?\s*:\s*["']?([^"']+)["']?/);
              return match ? match[2] : pair;
            });
          return keyValuePairs;
        } catch (e) {
          // Fall through
        }
      }
      
      // Handle comma-separated values
      if (options.includes(',')) {
        return options.split(',').map(opt => opt.trim());
      }
      
      // Return as single element array
      return [options];
    }
  }
  
  // If it's an object, return its values
  if (typeof options === 'object') {
    return Object.values(options);
  }
  
  // Fallback to empty array
  return [];
};

export default function Exam() {
  const { currentUser } = useAuth();
  const { currentExam, setCurrentExam, submitExam, examContextReady } = useExam();
  const navigate = useNavigate();
  const { id: examId } = useParams();
  
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabHidden, setTabHidden] = useState(false);
  const [tabHiddenTimer, setTabHiddenTimer] = useState(10);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [isStrictMode, setIsStrictMode] = useState(false);
  const [examSessionId, setExamSessionId] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const timerRef = useRef(null);
  const tabHiddenTimerRef = useRef(null);
  const visibilityListenerRef = useRef(null);
  const blurListenerRef = useRef(null);

  // Load exam data
  useEffect(() => {
    if (!examContextReady) return;
    
    const loadExam = async () => {
      try {
        setLoading(true);
        const examData = await getExam(examId);
        setCurrentExam(examData);
      } catch (e) {
        setError('Failed to load exam. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (examId) loadExam();
  }, [examId, setCurrentExam, examContextReady]);

  // Shuffle array utility
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Save progress to localStorage
  const saveProgress = useCallback(() => {
    if (!currentExam || !examSessionId) return;
    
    const dataToSave = {
      examId: currentExam.id,
      answers,
      currentQuestion,
      timeLeft,
      shuffledQuestions,
      examMode: currentExam.mode,
      examSessionId
    };
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  }, [answers, currentQuestion, timeLeft, currentExam, shuffledQuestions, examSessionId]);

  // Check submission status
  const checkSubmissionStatus = useCallback(async () => {
    if (!currentExam || !currentUser) return;
    
    try {
      const response = await checkExamSubmission(currentExam.id, currentUser.id);
      if (response.submitted) {
        setExamSubmitted(true);
        setError('You have already submitted this exam. Cannot retake in strict mode.');
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (err) {
      console.error('Failed to check submission status:', err);
    }
  }, [currentExam, currentUser]);

  // Start exam session
  const startExamSession = useCallback(async () => {
    if (!currentExam || !currentUser) return null;
    
    try {
      const sessionData = {
        exam: currentExam.id,
        student: currentUser.id,
        start_time: new Date().toISOString()
      };
      
      const response = await createExamSession(sessionData);
      setExamSessionId(response.id);
      return response.id;
    } catch (err) {
      setError('Failed to start exam session. Please try again.');
      return null;
    }
  }, [currentExam, currentUser]);

  // Handle visibility changes
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && isStrictMode && !examSubmitted && examSessionId) {
      setTabHidden(true);
      clearInterval(tabHiddenTimerRef.current);
      
      tabHiddenTimerRef.current = setInterval(() => {
        setTabHiddenTimer(prev => {
          if (prev <= 1) {
            clearInterval(tabHiddenTimerRef.current);
            handleSubmit(true, 'Exam suspended due to leaving the exam tab');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!document.hidden) {
      clearInterval(tabHiddenTimerRef.current);
      setTabHidden(false);
      setTabHiddenTimer(10);
    }
  }, [isStrictMode, examSubmitted, examSessionId]);

  // Handle window blur
  const handleWindowBlur = useCallback(() => {
    if (isStrictMode && !examSubmitted && examSessionId) {
      setTabHidden(true);
      clearInterval(tabHiddenTimerRef.current);
      
      tabHiddenTimerRef.current = setInterval(() => {
        setTabHiddenTimer(prev => {
          if (prev <= 1) {
            clearInterval(tabHiddenTimerRef.current);
            handleSubmit(true, 'Exam suspended due to leaving the exam window');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [isStrictMode, examSubmitted, examSessionId]);

  // Retry session creation
  useEffect(() => {
    if (retryCount > 0 && retryCount <= MAX_RETRIES) {
      const timer = setTimeout(() => startExamSession(), 2000);
      return () => clearTimeout(timer);
    }
  }, [retryCount, startExamSession]);

  // Main initialization
  useEffect(() => {
    if (!currentExam || !currentUser) {
      if (currentUser && examId) {
        setError('No exam selected. Please select an exam first.');
        setTimeout(() => navigate('/student/exam-list'), 3000);
      }
      return;
    }

    setIsStrictMode(currentExam.mode === EXAM_MODE.STRICT);

    const initializeExam = async () => {
      try {
        setLoading(true);
        setError(null);
        setRetryCount(0);

        if (isStrictMode) {
          await checkSubmissionStatus();
          if (examSubmitted) return;
        }

        const savedData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
        if (savedData && savedData.examId == currentExam.id && savedData.examMode === currentExam.mode) {
          setAnswers(savedData.answers || {});
          setCurrentQuestion(savedData.currentQuestion || 0);
          setTimeLeft(savedData.timeLeft || currentExam.duration * 60);
          setShuffledQuestions(savedData.shuffledQuestions || []);
          setExamSessionId(savedData.examSessionId || null);
          setLoading(false);
          return;
        }

        // Parse and clean questions
        const cleanedQuestions = (currentExam.questions || [])
          .map(q => ({
            ...q,
            options: parseOptions(q.options)
          }))
          .filter(q => {
            // Ensure we have a non-empty array of options
            return Array.isArray(q.options) && q.options.length > 0;
          });

        if (cleanedQuestions.length === 0) {
          setShuffledQuestions([]);
          setLoading(false);
          return;
        }

        // Shuffle questions and options
        const shuffled = shuffleArray(cleanedQuestions).map(question => ({
          ...question,
          options: shuffleArray(question.options)
        }));

        setShuffledQuestions(shuffled);

        // Initialize answers state
        const initialAnswers = {};
        shuffled.forEach(q => {
          initialAnswers[q.id] = q.is_multi ? [] : null;
        });
        setAnswers(initialAnswers);
        setTimeLeft(currentExam.duration * 60);
        
        // Create new session
        const sessionId = await startExamSession();
        setExamSessionId(sessionId);
      } catch (e) {
        setError('Failed to initialize exam. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    initializeExam();
  }, [currentExam, currentUser, isStrictMode, examSubmitted, examId, navigate, checkSubmissionStatus, startExamSession]);

  // Set document title
  useEffect(() => {
    if (currentExam) document.title = `${currentExam.title} - Exam`;
    return () => { document.title = 'Exam Platform'; };
  }, [currentExam]);

  // Timer logic
  useEffect(() => {
    if (loading || examSubmitted || !examSessionId) return;

    if (timeLeft <= 0) {
      handleSubmit(true, 'Time expired');
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, loading, examSubmitted, examSessionId]);

  // Save progress
  useEffect(() => {
    if (!loading && currentExam && !examSubmitted && examSessionId) {
      saveProgress();
    }
  }, [answers, timeLeft, currentQuestion, saveProgress, loading, currentExam, examSubmitted, examSessionId]);

  // Strict mode event listeners
  useEffect(() => {
    if (isStrictMode && !examSubmitted && examSessionId) {
      visibilityListenerRef.current = handleVisibilityChange;
      blurListenerRef.current = handleWindowBlur;
      
      document.addEventListener('visibilitychange', visibilityListenerRef.current);
      window.addEventListener('blur', blurListenerRef.current);
    }
    
    return () => {
      document.removeEventListener('visibilitychange', visibilityListenerRef.current);
      window.removeEventListener('blur', blurListenerRef.current);
      clearInterval(tabHiddenTimerRef.current);
    };
  }, [isStrictMode, examSubmitted, examSessionId, handleVisibilityChange, handleWindowBlur]);

  // Format time
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Handle answer selection
  const handleAnswer = (questionId, optionIndex) => {
    if (examSubmitted) return;
    
    const question = shuffledQuestions.find(q => q.id === questionId);
    if (!question) return;
    
    setAnswers(prev => {
      if (question.is_multi) {
        const currentAnswers = prev[questionId] || [];
        const newAnswers = currentAnswers.includes(optionIndex)
          ? currentAnswers.filter(i => i !== optionIndex)
          : [...currentAnswers, optionIndex];
        return { ...prev, [questionId]: newAnswers };
      } else {
        return { ...prev, [questionId]: optionIndex };
      }
    });
  };

  // Navigation
  const handleNext = () => currentQuestion < shuffledQuestions.length - 1 && setCurrentQuestion(currentQuestion + 1);
  const handlePrevious = () => currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1);
  const handleQuestionNav = (index) => setCurrentQuestion(index);

  // Format answers for submission
  const formatAnswersForSubmission = useCallback(() => {
    return shuffledQuestions.map(question => {
      const answer = answers[question.id];
      let selected_answers = '';
      
      if (question.is_multi) {
        selected_answers = Array.isArray(answer) 
          ? answer.sort().join(',') 
          : '';
      } else {
        selected_answers = (answer !== null && answer !== undefined) 
          ? String(answer) 
          : '';
      }
      
      return {
        question: question.id,
        selected_answers,
        is_multi: question.is_multi
      };
    });
  }, [shuffledQuestions, answers]);

  // Submit exam
  const handleSubmit = useCallback(async (isAuto = false, reason = '') => {
    if (examSubmitted || !examSessionId) return;
    
    setLoading(true);
    try {
      const payload = {
        exam_session: examSessionId,
        answers: formatAnswersForSubmission(),
        submitted_at: new Date().toISOString(),
        auto_submit: isAuto,
        reason
      };
      
      await submitAnswers(payload);
      setExamSubmitted(true);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      submitExam();
      navigate('/student/exam-list');
    } catch (err) {
      alert('Failed to submit exam. Please try again.');
      setRetryCount(prev => Math.min(prev + 1, MAX_RETRIES));
    } finally {
      setLoading(false);
    }
  }, [examSubmitted, examSessionId, formatAnswersForSubmission, submitExam, navigate]);

  // Confirm submit
  const confirmSubmit = () => {
    if (examSubmitted) return;
    if (window.confirm('Are you sure you want to submit the exam?')) {
      handleSubmit(false);
    }
  };

  // Render states
  if (loading) {
    return (
      <div className="exam-loading">
        <div className="loading-spinner"></div>
        <p>Loading exam questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="exam-error">
        <h3>Error Loading Exam</h3>
        <p>{error}</p>
        <button className="retry-btn" onClick={() => window.location.reload()}>
          Reload Page
        </button>
      </div>
    );
  }

  if (examSubmitted) {
    return (
      <div className="exam-submitted">
        <h2>Exam Submitted</h2>
        <p>Thank you for completing the exam.</p>
        <button className="retry-btn" onClick={() => navigate('/student/exam-list')}>
          Back to Exams
        </button>
      </div>
    );
  }

  if (!shuffledQuestions.length) {
    return (
      <div className="exam-empty">
        <h3>No Valid Questions Found</h3>
        <p>This exam doesn't have any properly formatted questions.</p>
        <p>Please contact your instructor.</p>
        <button className="retry-btn" onClick={() => navigate('/student/exam-list')}>
          Back to Exams
        </button>
      </div>
    );
  }

  const currentQ = shuffledQuestions[currentQuestion];
  const progress = Math.round(((currentQuestion + 1) / shuffledQuestions.length) * 100);
  const answeredCount = Object.values(answers).filter(a => 
    a !== null && (Array.isArray(a) ? a.length > 0 : true)
  ).length;

  return (
    <div className="exam-container">
      {tabHidden && isStrictMode && (
        <div className="tab-warning-modal">
          <div className="warning-content">
            <h3>Warning: Exam Suspended</h3>
            <p>You have left the exam window. Return within {tabHiddenTimer} seconds or your exam will auto-submit.</p>
            <button
              className="return-btn"
              onClick={() => {
                setTabHidden(false);
                clearInterval(tabHiddenTimerRef.current);
                setTabHiddenTimer(10);
              }}
            >
              Return to Exam
            </button>
          </div>
        </div>
      )}

      <div className="exam-header">
        <div className="exam-info">
          <h2>{currentExam.title}</h2>
          <div className="exam-meta">
            <span>Subject: {currentExam.subject_name.trim()}</span>
            <span>Mode: {isStrictMode ? 'Strict' : 'Practice'}</span>
            <span>Question: {currentQuestion + 1} of {shuffledQuestions.length}</span>
            <span>Answered: {answeredCount}/{shuffledQuestions.length}</span>
          </div>
        </div>
        <div className="timer-container">
          <div className="timer">
            <span className="time-left">{formatTime(timeLeft)}</span>
            <span className="time-label">Time Remaining</span>
          </div>
        </div>
      </div>

      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="question-container">
        <div className="question-header">
          <h3>Question {currentQuestion + 1}</h3>
          {currentQ.is_multi && <span className="multi-tag">Multiple Select</span>}
        </div>
        <div className="question-text">
          <p>{currentQ.text}</p>
        </div>
        <div className={`options ${currentQ.is_multi ? 'multi-select' : 'single-select'}`}>
          {currentQ.options.map((option, index) => {
            const isSelected = currentQ.is_multi
              ? answers[currentQ.id]?.includes(index)
              : answers[currentQ.id] === index;
              
            return (
              <div
                key={index}
                className={`option ${isSelected ? 'selected' : ''}`}
                onClick={() => !examSubmitted && handleAnswer(currentQ.id, index)}
              >
                <div className="option-selector">
                  {currentQ.is_multi ? (
                    <div className="checkbox">{isSelected && <div className="checkmark"></div>}</div>
                  ) : (
                    <div className="radio">{isSelected && <div className="radio-dot"></div>}</div>
                  )}
                </div>
                <div className="option-text">
                  <span>{String.fromCharCode(65 + index)}.</span> {option}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="question-navigation">
        <div className="question-dots">
          {shuffledQuestions.map((q, idx) => {
            const ans = answers[q.id];
            const answered = Array.isArray(ans) ? ans.length > 0 : ans != null;
            return (
              <div
                key={idx}
                className={`dot ${idx === currentQuestion ? 'active' : ''} ${answered ? 'answered' : ''}`}
                onClick={() => setCurrentQuestion(idx)}
                title={`Question ${idx + 1}`}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
        <div className="nav-buttons">
          <button onClick={handlePrevious} disabled={currentQuestion === 0 || examSubmitted}>
            Previous
          </button>
          {currentQuestion < shuffledQuestions.length - 1 ? (
            <button onClick={handleNext} disabled={examSubmitted}>
              Next
            </button>
          ) : (
            <button onClick={confirmSubmit} disabled={examSubmitted}>
              Submit Exam
            </button>
          )}
        </div>
      </div>
    </div>
  );
}