import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { authGet } from '../../services/api';
import '../CSS/Result.css';

export default function ResultDetail() {
  const { session } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await authGet(`/api/results/${session}/`);
        setResult(data);
      } catch (err) {
        console.error('Error fetching result details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [session]);

  if (loading) return <p>Loading result...</p>;
  if (!result) return <p>Result not found or unavailable.</p>;

  const percentage = result.total_marks
    ? Math.round((result.score / result.total_marks) * 100)
    : 0;

  return (
    <div className="result-container">
      <h1>Exam: {result.exam_title}</h1>
      <p><strong>Score:</strong> {result.score} / {result.total_marks}</p>
      <p><strong>Percentage:</strong> {percentage}%</p>
      <p><strong>Status:</strong> {result.pass_fail}</p>

      <h3>Answers:</h3>
      {result.answers && result.answers.length > 0 ? (
        <ul>
          {result.answers.map((ans, idx) => (
            <li key={idx}>
              <strong>Q:</strong> {ans.question}<br />
              <strong>Your Answer:</strong> {ans.given_answer}<br />
              <strong>Correct Answer:</strong> {ans.correct_answer}<br />
              <span className={ans.is_correct ? 'correct' : 'incorrect'}>
                {ans.is_correct ? '✔ Correct' : '✘ Incorrect'}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No detailed answers available.</p>
      )}
    </div>
  );
}
