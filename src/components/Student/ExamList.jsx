// src/components/Student/ExamList.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../../context/examContext';

export default function ExamList() {
  const { exams, fetchExams, startExam } = useExam();
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleStartExam = (exam) => {
    startExam(exam);
    navigate('/exam');
  };

  return (
    <div className="exam-list">
      <h1>Available Exams</h1>
      {exams.length === 0 ? (
        <p>No exams available</p>
      ) : (
        <div className="exams-container">
          {exams.map(exam => (
            <div key={exam.id} className="exam-card">
              <h3>{exam.title}</h3>
              <p>Duration: {exam.duration} minutes</p>
              <p>Questions: {exam.questionCount}</p>
              <button onClick={() => handleStartExam(exam)}>Start Exam</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}