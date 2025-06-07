// src/components/Admin/AdminResultList.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authGet } from '../../services/api';
import '../CSS/Result.css'; // You can reuse the same CSS

export default function AdminResultList() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllResults = async () => {
      try {
        // Admin can GET /api/results/ to see all students’ results
        const data = await authGet('/api/results/');
        setResults(data.results || data); 
      } catch (err) {
        console.error('Error fetching all results:', err);
        setError(err.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    fetchAllResults();
  }, []);

  if (loading) {
    return (
      <div className="result-loading">
        <div className="loading-spinner"></div>
        <p>Loading all student results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result-error">
        <h3>Error Loading Results</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="result-empty">
        <h3>No Results Found</h3>
        <p>Students have not completed any exams yet.</p>
      </div>
    );
  }

  return (
    <div className="result-container">
      <div className="result-header">
        <h1>All Students’ Results</h1>
      </div>

      <div className="result-details">
        <table className="result-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Exam Title</th>
              <th>Date</th>
              <th>Score</th>
              <th>Right Answers</th>
              <th>Wrong Answers</th>
              <th>Result</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {results.map((res) => (
              <tr key={res.id}>
                <td>{res.student_name}</td>
                <td>{res.exam_title}</td>
                <td>{new Date(res.date).toLocaleString()}</td>
                <td>
                  {res.score} / {res.total_marks}
                </td>
                <td>{res.right_answers}</td>
                <td>{res.wrong_answers}</td>
                <td>
                  <span
                    className={`status-badge ${
                      res.pass_fail === 'Pass' ? 'correct' : 'incorrect'
                    }`}
                  >
                    {res.pass_fail}
                  </span>
                </td>
                <td>
                  <Link to={`/student/results/${res.session}`}>
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
