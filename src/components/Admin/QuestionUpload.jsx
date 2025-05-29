import React, { useState, useEffect } from "react";
import {authPostFormData} from "../../services/api"; // import axios directly
import axios from "axios";
import { useAuth } from "../../context/authContext";
import { FaFileExcel, FaDownload, FaCloudUploadAlt, FaPlus, FaCheckCircle } from 'react-icons/fa';
import "../CSS/Questionupload.css"; // Adjust the path as necessary


const QuestionUpload = () => {
  useEffect(() => {
    document.title = "Upload Questions";
  }, []);

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSingleForm, setShowSingleForm] = useState(false);
  const [singleQuestion, setSingleQuestion] = useState({
    subject: "",
    text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A",
    marks: 1,
  });

  const { token } = useAuth();

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("utd_auth");
      const response = await fetch(
        "http://localhost:8000/api/questions/download_format/",
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
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
    } catch (error) {
      console.error("Download error:", error);
      setMessage("Failed to download format");
      setIsError(false);

    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file");
      setShowSuccess(true);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("utd_auth");
      await axios.post("http://localhost:8000/api/questions/bulk_upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Token ${token}`,
        },
      });
      setMessage("Questions uploaded successfully!");
      setShowSuccess(true);
      setFile(null);
      e.target.reset();
    } catch (error) {
      console.error("Upload error:", error.response || error.message);
      setMessage(error.response?.data?.message || "Upload failed");
      setIsError(true);
    }
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    try {
      const authToken = token || localStorage.getItem("utd_auth");

      // Prepare data in expected format (match your backend fields)
      const payload = {
        subject: singleQuestion.subject,
        text: singleQuestion.text,
        options: {
          A: singleQuestion.option_a,
          B: singleQuestion.option_b,
          C: singleQuestion.option_c,
          D: singleQuestion.option_d,
        },
        correct_answers: singleQuestion.correct_answer,
        marks: singleQuestion.marks,
        is_multi: false,  // Adjust if you want to add multi-select in UI
      };

      await axios.post("http://localhost:8000/api/questions/", payload, {
        headers: {
          Authorization: `Token ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      setMessage("Question added successfully!");
      setIsError(false);
      setSingleQuestion({
        subject: "",
        text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "A",
        marks: 1,
      });
    } catch (error) {
      console.error("Add question error:", error.response || error.message);
      setMessage(error.response?.data?.message || "Failed to add question");
      setIsError(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSingleQuestion((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="question-upload-container">
      {/* Header */}
      <div className="header">
        <h1><FaFileExcel /> Question Management</h1>
        <div className="mode-toggle">
          <button
            className={`toggle-btn ${!showSingleForm ? 'active' : ''}`}
            onClick={() => setShowSingleForm(false)}
          >
            <FaCloudUploadAlt /> Bulk Upload
          </button>
          <button
            className={`toggle-btn ${showSingleForm ? 'active' : ''}`}
            onClick={() => setShowSingleForm(true)}
          >
            <FaPlus /> Add Single
          </button>
        </div>
      </div>

      {/* Bulk Upload */}
      {!showSingleForm ? (
        <div className="card">
          <div className="card-header">
            <h2><FaCloudUploadAlt /> Bulk Upload Questions</h2>
            <p>Upload multiple questions using Excel format</p>
          </div>
          
          <div className="card-body">
            <div className="instruction">
              <p>Download the Excel template, fill in your questions, and upload the file.</p>
              <button onClick={handleDownload} className="download-btn">
                <FaDownload /> Download Format
              </button>
            </div>

            <form onSubmit={handleBulkUpload}>
              <div className="form-group">
                <label htmlFor="formFile">Select Excel File</label>
                <input
                  type="file"
                  id="formFile"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                />
              </div>
              <button type="submit" className="upload-btn">
                <FaCloudUploadAlt /> Upload Questions
              </button>
            </form>
          </div>
        </div>
      ) : (
        // Single Question Form
        <div className="card">
          <div className="card-header">
            <h2><FaPlus /> Add Single Question</h2>
            <p>Create a new question manually</p>
          </div>
          
          <div className="card-body">
            <form onSubmit={handleSingleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={singleQuestion.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter subject name"
                  />
                </div>
                <div className="form-group">
                  <label>Marks</label>
                  <input
                    type="number"
                    name="marks"
                    value={singleQuestion.marks}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Question Text</label>
                <textarea
                  name="text"
                  value={singleQuestion.text}
                  onChange={handleInputChange}
                  rows="3"
                  required
                  placeholder="Enter your question here..."
                />
              </div>
              
              <div className="options-grid">
                <div className="option-card">
                  <label>Option A</label>
                  <input
                    type="text"
                    name="option_a"
                    value={singleQuestion.option_a}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter option A"
                  />
                </div>
                <div className="option-card">
                  <label>Option B</label>
                  <input
                    type="text"
                    name="option_b"
                    value={singleQuestion.option_b}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter option B"
                  />
                </div>
                <div className="option-card">
                  <label>Option C</label>
                  <input
                    type="text"
                    name="option_c"
                    value={singleQuestion.option_c}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter option C"
                  />
                </div>
                <div className="option-card">
                  <label>Option D</label>
                  <input
                    type="text"
                    name="option_d"
                    value={singleQuestion.option_d}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter option D"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Correct Answer</label>
                <select
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
              
              <button type="submit" className="add-btn">
                <FaPlus /> Add Question
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="success-message">
          <FaCheckCircle /> {message}
        </div>
      )}

      {/* Error Message */}
      {message && !showSuccess && (
        <div className={`error-message ${isError ? 'show' : ''}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default QuestionUpload;
