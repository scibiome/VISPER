import React, { useEffect, useState } from 'react';
import UploadProgressBar from './ProgressBar/UploadProgressBar';
import Entities from './Entities/Entities';
import UploadData from './UploadData/UploadData';
import UploadOptionalData from './UploadOptionalData/UploadOptionalData';
import Settings from './Settings/Settings';
import { useLocation } from 'react-router-dom';
import axios from "axios";
import './Upload.css';
import ProjectName from './ProjectName/ProjectName';
import { Layout } from 'antd';
import NavigationBar from "../NavigationBar/NavigationBar";

const { Content } = Layout;

/**
 * Upload component of the website
 */
function Upload() {
    const location = useLocation();
    const [activeButton, setActiveButton] = useState(null);

    const [stepNumber, setStepNumber] = useState(1);

    const [selctedType, setSelectedType] = useState('');

    const [showTypeError, setShowTypeError] = useState(0);

    const [uploadStatus, setUploadStatus] = useState(0);

    const [uploadedFile, setUploadedFile] = useState(null);

    const [uploadedFileName, setUploadedFileName] = useState(null);

    const [uploadedOptionalFileName, setUploadedOptionalFileName] = useState(null);

    const [objectUrl, setObjectUrl] = useState(null);

    const [columnNames, setColumnNames] = useState(null);

    const [settingsData, setSettingsData] = useState([]);

    const [fileEntities, setFileEntities] = useState(null);

    const [graphML, setGraphML] = useState([]);
    const [settingError, setSettingError] = useState(0);

    const [cookieNum, setCookieNum] = useState(null);

    const [worksheetName, setWorksheetName] = useState("a");
    const handleUploadStatus = (status) => {
        setShowTypeError(0);
        setUploadStatus(status);
    };

    const sendSaveData = (dataSave) => {
        setSettingsData(dataSave);
    };
    const getError = (saveError) => {
        setSettingError(saveError);
    };
    const handleUploadFile = (file) => {
        setUploadedFile(file);
        const objectUrl = URL.createObjectURL(file);
        setObjectUrl(objectUrl);
    };


    const handleEntities = (getEntities) => {
        setFileEntities(getEntities);
    };

    /**
     * Handles Progress bar
     */
    const checkUploadStatus = async () => {
        if (uploadStatus !== 3) {
            setShowTypeError(2);
        } else {
            const formData = new FormData();
            formData.append("file", uploadedFile);
            formData.append("worksheetName", worksheetName);
            formData.append("uploadedFileName", uploadedFileName);
            console.log("worksheetname:", worksheetName)
            try {
                await axios.post("http://localhost:8000/uploadfile/", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                }).then((response) => {
                    setUploadedFileName(response.data.message);
                    setColumnNames(response.data.column_names);
                    const parts = uploadedFile.name.split(".");
                    if (parts[parts.length - 1] === "graphml") {
                        setGraphML(response.data.column_names);
                    } else {
                        setGraphML([]);
                    }
                })
                    .catch((error) => {
                        console.error(error);
                    });
            } catch (error) {
                console.error("Error uploading file:", error);

            }
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
            setStepNumber(stepNumber + 1);
        }
    };

    /**
     * Handle optional status step
     */
    const checkOptionalStatus = async () => {
        if (uploadStatus !== 3) {
        } else {
            const formData = new FormData();
            formData.append("file", uploadedFile);
            formData.append("worksheetName", worksheetName);
            formData.append("uploadedFileName", uploadedFileName);
            try {
                await axios.post("http://localhost:8000/uploadfile/", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                }).then((response) => {
                    setUploadedOptionalFileName(response.data.message);
                })
                    .catch((error) => {
                        console.error(error);
                    });
            } catch (error) {
                console.error("Error uploading file:", error);

            }
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }

        }
        setStepNumber(stepNumber + 1);
    };
    /**
     * check the upload of the file
     */
    const checkSettingsStatus = async () => {
        if (settingError == 1) {
            const requestData = {
                data: settingsData,
                name: uploadedFileName,
            };
            try {
                console.log(requestData);
                await axios.post("http://localhost:8000/uploadSettings/", requestData);
            } catch (error) {
                console.error("Error uploading file:", error);

            }
            setStepNumber(stepNumber + 1);
        } else {
            setShowTypeError(4);
        }

    };
    /**
     * Increase step number
     */
    const checkEntitieStatus = () => {
        if (graphML.length > 0 || fileEntities.length > 0) {
            setStepNumber(stepNumber + 1);
        }
    };
    /**
     * Set worksheet that should be used
     * @param {*} workSheetName 
     */
    const handleWorksheet = (workSheetName) => {
        setWorksheetName(workSheetName);
    };

    /**
     * set cookie for upload process
     */
    useEffect(() => {
        if (location.state) {
            const cookie_num = location.state.cookie_num;
            setCookieNum(cookie_num);
        }
    });

    switch (stepNumber) {
        case 1:
            return (
                <Layout className="layout">
                    <NavigationBar />
                    <Content
                        style={{
                            marginTop: '30px',
                        }}
                    >
                        <div>
                            <UploadProgressBar stepNumber={stepNumber} />
                            <UploadData onUploadStatusChange={handleUploadStatus} onUploadFile={handleUploadFile} onSelectWorksheet={handleWorksheet} />
                            <div className="next-button-container">
                                {showTypeError === 2 ? (
                                    <div className="red-rectangle">
                                        <p className="rectangle-text">You must upload a suitable file</p>
                                    </div>
                                ) : null}
                                <button className="next-button grey" onClick={checkUploadStatus}>Next</button>
                            </div>
                        </div>
                    </Content>
                </Layout>
            );
        case 2:
            return (
                <Layout className="layout">
                    <NavigationBar />
                    <Content
                        style={{
                            marginTop: '30px',
                        }}
                    >
                        <div>
                            <UploadProgressBar stepNumber={stepNumber} />
                            <UploadOptionalData onUploadStatusChange={handleUploadStatus} onUploadFile={handleUploadFile} />
                            <div className="next-button-container">
                                <button className="next-button grey" onClick={checkOptionalStatus}>Next</button>
                            </div>
                        </div>
                    </Content>
                </Layout>
            );
        case 3:
            return (
                <Layout className="layout">
                    <NavigationBar />
                    <Content
                        style={{
                            marginTop: '30px',
                        }}
                    >
                        <div>
                            <UploadProgressBar stepNumber={stepNumber} />
                            <Entities graphML={graphML} selectedEntities={handleEntities} />
                            <div className="next-button-container">
                                <button className="next-button grey" onClick={checkEntitieStatus}>Next</button>
                            </div>
                        </div>
                    </Content>
                </Layout>
            );
        case 4:
            return (
                <Layout className="layout">
                    <NavigationBar />
                    <Content
                        style={{
                            marginTop: '30px',
                        }}
                    >
                        <div>
                            <UploadProgressBar stepNumber={stepNumber} />
                            <Settings getColumnNames={columnNames} getSelectedButton={fileEntities} saveData={sendSaveData} getGraphML={graphML} getError={getError} />
                            <div className="next-button-container">
                                {showTypeError === 4 ? (
                                    <div className="red-rectangle">
                                        <p className="rectangle-text">Not all identifiers are assigned. </p>
                                    </div>
                                ) : null}
                                <button className="next-button grey" onClick={checkSettingsStatus}>Next</button>
                            </div>
                        </div>
                    </Content>
                </Layout>
            );
        case 5:
            return (
                <Layout className="layout">
                    <NavigationBar />
                    <Content
                        style={{
                            marginTop: '30px',
                        }}
                    >
                        <div>
                            <UploadProgressBar stepNumber={stepNumber} />
                            <div>
                                <ProjectName projectID={uploadedFileName} getGraphML={graphML} getWorksheetName={worksheetName} getCookie={cookieNum} />
                            </div>

                        </div>
                    </Content>
                </Layout>
            );
    }

}
export default Upload;