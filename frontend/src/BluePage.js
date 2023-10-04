import React, { useState, useRef } from 'react';
import './BluePage.css';
import { useDropzone } from 'react-dropzone';

const BluePage = () => {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef();

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
      setMessage('File uploaded successfully!');
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
      <h1>Import Data</h1>
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} ref={fileInputRef} />
        <p>Click to select CSV file</p>
      </div>

      <p>{message}</p>
    </div>
  );
};

export default BluePage;
