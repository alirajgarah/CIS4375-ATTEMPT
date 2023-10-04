import React, { useState, useRef } from 'react';
import './BluePage.css';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';  

const BluePage = () => {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef();
  const navigate = useNavigate();  

  const onDrop = (acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      const warningMessage = 'Please upload a valid .csv file.';
      setMessage(warningMessage);
      alert(warningMessage);
      return;
    }

    // File reading logic to validate if it's a probable CSV
    const file = acceptedFiles[0];  // Assuming single file as 'multiple' is false
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target.result;
      const firstLine = content.split('\n')[0];
      
      // Simple CSV check: Expecting at least one comma in the first line
      if (!firstLine.includes(',')) {
        const warningMessage = 'The uploaded file does not appear to be a valid CSV.';
        setMessage(warningMessage);
        alert(warningMessage);
        return;
      }

      // If the file passes the check, you can continue to process it...
      setMessage('File uploaded successfully! Redirecting...');

      // Redirecting to the RedPage after a short delay
      setTimeout(() => {
        navigate('/redpage');  // Redirect to RedPage
      }, 2000);
    };

    reader.onerror = () => {
      const warningMessage = 'An error occurred while reading the file.';
      setMessage(warningMessage);
      alert(warningMessage);
    };

    reader.readAsText(file);
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
          <input {...getInputProps()} ref={fileInputRef} />
          <p>Click or drag to select a CSV file</p>
        </div>
        <p className={message.includes('success') ? 'message-success' : 'message-fail'}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default BluePage;
