import React, { useMemo, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import './UploadData.css';
import axios from "axios";
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
 * 
 * @param {*} props 
 * @returns 
 */
function UploadData(props) {
  const { onUploadStatusChange } = props;
  const { onUploadFile } = props;
  const { onSelectWorksheet } = props;
  const [uploadStatus, setUploadStatus] = useState(0);
  const [workSheetList, setworkSheetList] = useState([]);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [usedWorkSheet, setUsedWorkSheet] = useState(workSheetList[0]);
  const exampleFiles = [
    { name: 'example.graphml' },
    { name: 'example.csv' },
    { name: 'example.xlsx' },
    { name: 'example.tsv' },
  ];
  /**
   * Change status after upload
   */
  useEffect(() => {
    onUploadStatusChange(uploadStatus);
  }, [uploadStatus]);

  /**
   * Upload data file
   * @param {*} file 
   */
  const handleFileDrop = async (file) => {
    const allowedExtensions = ['csv', 'tsv', 'xlsx', 'graphml'];
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
      if (fileExtension === 'xlsx') {
        const formData = new FormData();
        formData.append("file", file);
        let sheetName
        try {
          await axios.post("http://localhost:8000/getWorksheets/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          }).then((response) => {
            sheetName = response.data.worksheets;
          })
            .catch((error) => {
              console.error(error);
            });
        } catch (error) {
          console.error("Error uploading file:", error);

        }
        if (sheetName.length > 1) {
          onSelectWorksheet(sheetName[0])
          setworkSheetList(sheetName);
          setUploadStatus(3);
        } else {
          setUploadStatus(3);
        }
      } else {
        setUploadStatus(3);
      }
    }
  };

  /**
   * Configure dropzone
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
      //setAcceptedFiles(acceptedFiles);
    },
  });

  useEffect(() => {
    if (acceptedFiles.length > 0) {
      handleFileDrop(acceptedFiles[0]);
    }
  }, [acceptedFiles]);

  /**
   * Show file name and size
   */
  const files = acceptedFiles.map(file => (
    <li key={file.name}>
      {file.name} - {file.size} bytes
    </li>
  ));
  
  /**
   * Configure style
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

  /**
   * Change selected worksheet
   * @param {*} event 
   */
  const handleWorkSheetChange = (event) => {
    setUsedWorkSheet(event.target.value);
    onSelectWorksheet(event.target.value);
  };

  /**
   * Get example files
   * @param {*} fileToDownload 
   */
  const handleFileClick = async (fileToDownload) => {
    try {
      const response = await axios.get(`http://localhost:8000/download/${fileToDownload.name}`, {
        responseType: "blob",
      });
      const fileContent = new Blob([response.data]);
      const downloadedFile = new File([fileContent], fileToDownload.name, { type: 'application/octet-stream' });

      handleFileDrop(downloadedFile);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const fileNames = exampleFiles.map((file) => file.name).join(', ');
  return (
    <div className="container">
      <p>What file would you like to upload?</p>
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} onChange={(event) => {
          if (event.target.files.length > 0) {
            handleFileDrop(event.target.files[0]);
          }
        }} />
        {uploadStatus === 0 ? (
          <p>Upload a csv, tsv, xlsx or graphml file here</p>
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

      <div>
        <p>Select a example:
          {exampleFiles.map((file, index) => (
            <a
              key={index}
              href="#"
              onClick={() => handleFileClick(file)}
              style={{ marginRight: '10px', textDecoration: 'underline', cursor: 'pointer' }}
            >
              {file.name}
            </a>
          ))}</p>
      </div>
      {workSheetList.length !== 0 ? (
        <div>
          <p>Select a worksheet: </p>
          <select id="worksheetSelect"
            value={usedWorkSheet}
            onChange={handleWorkSheetChange}
          >
            {workSheetList.map((worksheet) => (
              <option key={worksheet} value={worksheet}>
                {worksheet}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}
export default UploadData;