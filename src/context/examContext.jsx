// src/context/examContext.js
import React, { createContext, useState, useContext } from 'react';

const ExamContext = createContext();

export function useExam() {
  return useContext(ExamContext);
}

export function ExamProvider({ children }) {
  const [exams, setExams] = useState([]);
  const [currentExam, setCurrentExam] = useState(null);
  const [results, setResults] = useState([]);

  const fetchExams = () => {
    // Mock data
    setExams([
      { id: 1, title: 'Mathematics Final', duration: 60 },
      { id: 2, title: 'Science Quiz', duration: 30 }
    ]);
  };

  const startExam = (exam) => {
    setCurrentExam(exam);
  };

  const submitExam = (answers) => {
    setResults([...results, { examId: currentExam.id, answers }]);
    setCurrentExam(null);
  };

  const value = {
    exams,
    currentExam,
    results,
    fetchExams,
    startExam,
    submitExam
  };

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}