import React, { useState } from 'react';
import './BluePage.css';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';  

const BluePage = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);  // New state variable
  const navigate = useNavigate();

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];  

    if (!file || file.type !== 'text/csv') {
      setMessage('Please upload a valid CSV file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    setLoading(true);  // Set loading to true when upload begins

    axios.post('http://localhost:3002/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((response) => {
      setMessage('File uploaded successfully! Redirecting...');
      setTimeout(() => {
        navigate('/redpage');  
      }, 2000);
    })
    .catch((error) => {
      setMessage(`Upload failed: ${error.response?.data?.message || 'An unexpected error occurred'}`);
    })
    .finally(() => {
      setLoading(false);  // Set loading to false once upload is done
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: '.csv',
    multiple: false,
    onDrop,
  });

  return (
    <div className="blue-page">
      <div className="blue-content">
        <h1>Import Data</h1>
        <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} />
          <p>Click to select a CSV file</p>
        </div>
        {loading && <p className="loading-message">Uploading file...</p>}
        <p className={message.includes('success') ? 'message-success' : 'message-fail'}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default BluePage;
