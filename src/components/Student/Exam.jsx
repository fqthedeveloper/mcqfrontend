// src/components/Student/Exam.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Timer from '../Shared/Timer';
import { useAuth } from '../../context/authContext';
import { useExam } from '../../context/examContext';
import { getExam, submitAnswers } from '../../services/api';

export default function Exam() {
  const { currentExam, submitExam } = useExam();
  const { currentUser } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExamQuestions = async () => {
      try {
        // Use the exam ID from currentExam context
        const examData = await getExam(currentExam.id);
        setQuestions(examData.questions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching exam:', error);
        setLoading(false);
      }
    };

    if (currentExam) {
      fetchExamQuestions();
    }
  }, [currentExam]);

  const handleAnswer = (optionIndex) => {
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Submit to backend
      await submitAnswers(currentExam.id, {
        userId: currentUser.id,
        answers
      });
      
      // Update local context
      submitExam(answers);
      navigate('/result');
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit exam. Please try again.');
    }
  };

  const handleTimeUp = () => {
    handleSubmit();
  };

  if (loading) {
    return <div>Loading exam questions...</div>;
  }

  if (questions.length === 0) {
    return <div>No questions found for this exam.</div>;
  }

  return (
    <div className="exam-container">
      <h2>{currentExam.title}</h2>
      <Timer duration={currentExam.duration} onTimeUp={handleTimeUp} />
      
      <div className="question">
        <h3>Question {currentQuestion + 1}</h3>
        <p>{questions[currentQuestion].text}</p>
        
        <div className="options">
          {questions[currentQuestion].options.map((option, index) => (
            <div key={index} className="option">
              <input
                type="radio"
                name="answer"
                checked={answers[questions[currentQuestion].id] === index}
                onChange={() => handleAnswer(index)}
              />
              {option}
            </div>
          ))}
        </div>
      </div>
      
      <div className="navigation">
        <button 
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>
        
        {currentQuestion < questions.length - 1 ? (
          <button onClick={handleNext}>Next</button>
        ) : (
          <button onClick={handleSubmit}>Submit Exam</button>
        )}
      </div>
    </div>
  );
}