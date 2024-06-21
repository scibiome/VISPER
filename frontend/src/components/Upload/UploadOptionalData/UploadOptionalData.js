import React, { useMemo, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import './UploadOptionalData.css';
const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#eeeeee',
  borderStyle: 'dashed',
  backgroundColor: '#fafafa',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out'
};

const focusedStyle = {
  borderColor: '#2196f3'
};

const acceptStyle = {
  borderColor: '#00e676'
};

const rejectStyle = {
  borderColor: '#ff1744'
};

/**
 * Upload optional md file 
 * @param {*} props 
 * @returns 
 */
function UploadOptionalData(props) {
  const { onUploadStatusChange } = props;
  const { onUploadFile } = props;
  const [uploadStatus, setUploadStatus] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [stepNumber, setStepNumber] = useState(2);

  useEffect(() => {
    onUploadStatusChange(uploadStatus);
  }, [uploadStatus]);

  /**
   * Handle md file upload
   * @param {*} file 
   */
  const handleFileDrop = (file) => {
    const allowedExtensions = ['md'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const maxSize = 100; //in mb
    const fileSizeInBytes = file.size;
    const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
    setUploadedFileName(file.name);
    if (!allowedExtensions.includes(fileExtension)) {
      setUploadStatus(1);
    } else if (fileSizeInMB > maxSize) {
      setUploadStatus(2);
    } else {
      onUploadFile(file);
      setUploadStatus(3);
    }
  };

  /**
   * Dropzone configuration
   */
  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject
  } = useDropzone({
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFileDrop(acceptedFiles[0]);
      }
    },
  });
  
  /**
   * Show file name and size
   */
  const files = acceptedFiles.map(file => (
    <li key={file.name}>
      {file.name} - {file.size} bytes
    </li>
  ));
  
  /**
   * set style
   */
  const style = useMemo(() => ({
    ...baseStyle,
    ...(isFocused ? focusedStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isFocused,
    isDragAccept,
    isDragReject
  ]);
  return (
    <div className="container">
      <p>Optional: Would you like to upload a file with extra information for the uploaded data?</p>
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} onChange={() => { }} />
        {uploadStatus === 0 ? (
          <p>Upload a md file here</p>
        ) : uploadStatus === 1 ? (
          <div className="red-rectangle">
            <p className="file-name">The file {uploadedFileName} has a not supported file format</p>
          </div>
        ) : uploadStatus === 2 ? (
          <div className="red-rectangle">
            <p className="file-name">We only support files with maximum file size of 100 MB</p>
          </div>
        ) : (
          <div className="green-rectangle">
            <p className="file-name">The file {uploadedFileName} was selected succesfully</p>
          </div>
        )}
      </div>
    </div>
  );
}
export default UploadOptionalData;