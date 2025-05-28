// src/components/Admin/QuestionUpload.js
import React, { useState } from 'react';

export default function QuestionUpload() {
  const [examTitle, setExamTitle] = useState('');
  const [questions, setQuestions] = useState([{ text: '', options: ['', '', '', ''], correctOption: 0 }]);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correctOption: 0 }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit logic
    console.log({ examTitle, questions });
    alert('Exam created successfully!');
  };

  return (
    <div className="question-upload">
      <h1>Create New Exam</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Exam Title:
          <input
            type="text"
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
            required
          />
        </label>

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="question-card">
            <h3>Question {qIndex + 1}</h3>
            <textarea
              value={q.text}
              onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
              placeholder="Question text"
              required
            />

            <div className="options">
              {q.options.map((option, oIndex) => (
                <div key={oIndex}>
                  <input
                    type="radio"
                    name={`correct-${qIndex}`}
                    checked={q.correctOption === oIndex}
                    onChange={() => handleQuestionChange(qIndex, 'correctOption', oIndex)}
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                    placeholder={`Option ${oIndex + 1}`}
                    required
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button type="button" onClick={addQuestion}>Add Question</button>
        <button type="submit">Create Exam</button>
      </form>
    </div>
  );
}