import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import {
  FaFileExcel,
  FaDownload,
  FaCloudUploadAlt,
  FaPlus,
  FaCheckCircle,
} from "react-icons/fa";
import "../CSS/Questionupload.css";

const QuestionUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSingleForm, setShowSingleForm] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [isMulti, setIsMulti] = useState(false);
  const [bulkSubjectId, setBulkSubjectId] = useState("");

  const [singleQuestion, setSingleQuestion] = useState({
    subject_id: "",
    text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A",
    correct_answers: [],
    marks: 1,
    explanation: "",
  });

  const { token } = useAuth();

  useEffect(() => {
    document.title = "Upload Questions";
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const authToken = token || localStorage.getItem("utd_auth");
      const response = await axios.get("http://localhost:8000/api/subjects/", {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });
      setSubjects(response.data);
    } catch (error) {
      console.error("Failed to load subjects", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSingleQuestion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMultiToggle = (e) => {
    const checked = e.target.checked;
    setIsMulti(checked);
    setSingleQuestion((prev) => ({
      ...prev,
      correct_answer: "A",
      correct_answers: [],
    }));
  };

  const handleMultiCorrectAnswerChange = (e) => {
    const { value, checked } = e.target;
    setSingleQuestion((prev) => {
      let newCorrectAnswers = [...prev.correct_answers];
      if (checked) {
        if (!newCorrectAnswers.includes(value)) newCorrectAnswers.push(value);
      } else {
        newCorrectAnswers = newCorrectAnswers.filter((ans) => ans !== value);
      }
      return {
        ...prev,
        correct_answers: newCorrectAnswers,
      };
    });
  };

  const handleDownload = async () => {
    try {
      const authToken = token || localStorage.getItem("utd_auth");
      const response = await fetch(
        "http://localhost:8000/api/questions/download_format/",
        {
          method: "GET",
          headers: {
            Authorization: `Token ${authToken}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to download format");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "question_format.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMessage("Format downloaded successfully!");
      setShowSuccess(true);
      setIsError(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Download error:", error);
      setMessage("Failed to download format");
      setIsError(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!file || !bulkSubjectId) {
      setMessage("Please select a file and subject");
      setShowSuccess(true);
      setIsError(true);
      setTimeout(() => setShowSuccess(false), 3000);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("subject_id", bulkSubjectId);

    try {
      const authToken = token || localStorage.getItem("utd_auth");
      await axios.post(
        "http://localhost:8000/api/questions/bulk_upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Token ${authToken}`,
          },
        }
      );
      setMessage("Questions uploaded successfully!");
      setShowSuccess(true);
      setIsError(false);
      setFile(null);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Upload error:", error.response || error.message);
      setMessage(error.response?.data?.message || "Upload failed");
      setShowSuccess(true);
      setIsError(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    try {
      const authToken = token || localStorage.getItem("utd_auth");

      let correctAnswersPayload;
      if (isMulti) {
        if (singleQuestion.correct_answers.length === 0) {
          setMessage("Please select at least one correct answer.");
          setIsError(true);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          return;
        }
        correctAnswersPayload = singleQuestion.correct_answers;
      } else {
        correctAnswersPayload = singleQuestion.correct_answer;
      }

      const payload = {
        subject_id: singleQuestion.subject_id,
        text: singleQuestion.text,
        options: {
          A: singleQuestion.option_a,
          B: singleQuestion.option_b,
          C: singleQuestion.option_c,
          D: singleQuestion.option_d,
        },
        correct_answers: correctAnswersPayload,
        marks: singleQuestion.marks,
        is_multi: isMulti,
        explanation: singleQuestion.explanation,
      };

      await axios.post("http://localhost:8000/api/questions/", payload, {
        headers: {
          Authorization: `Token ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      setMessage("Question added successfully!");
      setShowSuccess(true);
      setIsError(false);
      setSingleQuestion({
        subject_id: "",
        text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "A",
        correct_answers: [],
        marks: 1,
        explanation: "",
      });
      setIsMulti(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Add question error:", error.response || error.message);
      setMessage(error.response?.data?.message || "Failed to add question");
      setShowSuccess(true);
      setIsError(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className="question-upload-container">
      <div className="header">
        <h1>
          <FaFileExcel /> Question Management
        </h1>
        <div className="mode-toggle">
          <button
            className={`toggle-btn ${!showSingleForm ? "active" : ""}`}
            onClick={() => setShowSingleForm(false)}
            aria-pressed={!showSingleForm}
          >
            <FaCloudUploadAlt /> Bulk Upload
          </button>
          <button
            className={`toggle-btn ${showSingleForm ? "active" : ""}`}
            onClick={() => setShowSingleForm(true)}
            aria-pressed={showSingleForm}
          >
            <FaPlus /> Add Single
          </button>
        </div>
      </div>

      {!showSingleForm ? (
        <div className="bulk-upload">
          <form onSubmit={handleBulkUpload}>
            <div className="form-group">
              <label htmlFor="bulkSubject">Select Subject</label>
              <select
                id="bulkSubject"
                value={bulkSubjectId}
                onChange={(e) => setBulkSubjectId(e.target.value)}
                required
              >
                <option value="">--Select Subject--</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="bulkFile">Upload Excel File</label>
              <input
                id="bulkFile"
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="download-btn"
                onClick={handleDownload}
                aria-label="Download Excel format"
              >
                <FaDownload /> Download Format
              </button>
              <button
                type="submit"
                className="upload-btn"
                aria-label="Upload questions"
              >
                <FaCloudUploadAlt /> Upload Questions
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="single-question-form">
          <form onSubmit={handleSingleSubmit}>
            <div className="form-group">
              <label htmlFor="singleSubject">Subject</label>
              <select
                id="singleSubject"
                value={singleQuestion.subject_id}
                name="subject_id"
                onChange={handleInputChange}
                required
              >
                <option value="">--Select Subject--</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="questionText">Question Text</label>
              <textarea
                id="questionText"
                name="text"
                value={singleQuestion.text}
                onChange={handleInputChange}
                rows="3"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="optionA">Option A</label>
                <input
                  id="optionA"
                  type="text"
                  name="option_a"
                  value={singleQuestion.option_a}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="optionB">Option B</label>
                <input
                  id="optionB"
                  type="text"
                  name="option_b"
                  value={singleQuestion.option_b}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="optionC">Option C</label>
                <input
                  id="optionC"
                  type="text"
                  name="option_c"
                  value={singleQuestion.option_c}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="optionD">Option D</label>
                <input
                  id="optionD"
                  type="text"
                  name="option_d"
                  value={singleQuestion.option_d}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="explanation">Explanation</label>
              <textarea
                id="explanation"
                name="explanation"
                value={singleQuestion.explanation}
                onChange={handleInputChange}
                rows="3"
                placeholder="Add explanation here..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="marks">Marks</label>
              <input
                id="marks"
                type="number"
                name="marks"
                value={singleQuestion.marks}
                onChange={handleInputChange}
                min="1"
                max="10"
                required
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={isMulti}
                  onChange={handleMultiToggle}
                  aria-checked={isMulti}
                />{" "}
                Multiple Correct Answers
              </label>
            </div>

            {!isMulti ? (
              <div className="form-group">
                <label htmlFor="correctAnswer">Correct Answer</label>
                <select
                  id="correctAnswer"
                  name="correct_answer"
                  value={singleQuestion.correct_answer}
                  onChange={handleInputChange}
                  required
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
            ) : (
              <div className="form-group checkbox-group">
                <label>Select All Correct Answers</label>
                <div className="multi-checkboxes">
                  {["A", "B", "C", "D"].map((option) => (
                    <label key={option} htmlFor={`correct-${option}`}>
                      <input
                        id={`correct-${option}`}
                        type="checkbox"
                        value={option}
                        checked={singleQuestion.correct_answers.includes(option)}
                        onChange={handleMultiCorrectAnswerChange}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="submit-btn"
              aria-label="Add question"
            >
              <FaCheckCircle /> Add Question
            </button>
          </form>
        </div>
      )}

      {showSuccess && (
        <div
          className={`message-box ${isError ? "error" : "success"}`}
          role="alert"
          aria-live="assertive"
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default QuestionUpload;