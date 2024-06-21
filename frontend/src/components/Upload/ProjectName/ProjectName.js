import React, { useState } from 'react';
import './ProjectName.css';
import axios from "axios";
import { error } from 'neo4j-driver';
import { useNavigate } from 'react-router-dom';

/**
 * Give the uploaded file a project name
 * @param {*} props 
 * @returns 
 */
function ProjectName(props) {
  const projectID = props.projectID;
  const graphML = props.getGraphML;
  const projectWorksheet = props.getWorksheetName;
  const projectcookie = props.getCookie;
  const [projectName, setProjectName] = useState('');
  const [errorMessage, setErrorMessage] = useState(0);
  const errorText = [null, 'Project name is already assigned'];
  const history = useNavigate();

  /**
   * Send all necessary information to the fastapi server
   * With this the integration process will be started
   * @param {*} e 
   */
  const startIntegration = (e) => {
    let projectNodeInformation = [];
    let projectEdge = [];
    if (graphML.length > 0) {
      for (let i = 0; i < graphML.length; i++) {
        if (i == 0) {
          for (let j = 0; j < graphML[i].length; j++) {
            if (graphML[i][j][1].length > 0) {
              projectNodeInformation.push(graphML[i][j][0]);
            }
          }
        }
        if (i == 1) {
          for (let j = 0; j < graphML[i].length; j++) {
            projectEdge.push(graphML[i][j][1][0] + "-" + graphML[i][j][1][1] + " Association");
          }
        }
      }
    }
    e.preventDefault();
    console.log(projectID);
    console.log(projectName);
    let existing_names = [];
    if (projectcookie) {
      try {
        axios.get("http://localhost:8000/database/").then((response) => {
          console.log("Problem1 ", response.data);
          existing_names = response.data.data.map(item => item[0].toLowerCase());
          if (existing_names.includes(projectName.toLocaleLowerCase())) {
            setErrorMessage(1);
            console.log("hallloala")
          } else {
            setErrorMessage(0);
            const sendData = {
              projectName: projectName,
              projectID: projectID,
              projectNodeInformation: projectNodeInformation,
              projectEdge: projectEdge,
              projectWorksheet: projectWorksheet,
              projectcookie: projectcookie,
            };
            console.log(sendData);
            try {
              axios.post("http://localhost:8000/startAnalysis/", sendData);
            } catch (error) {
              console.error("Error uploading file:", error);

            }
            history('/');
          }

        })
          .catch((error) => {
            console.error("Error uploading file:", error);
          });

      } catch (error) {
        console.error("Error uploading file:", error);

      }
    }
    console.log(existing_names);


  };
  return (
    <div className="nameContainer">
      <h1>What name should the dataset have?</h1>
      <form id="dataset-form" onSubmit={startIntegration}>
        <input type="text" id="dataset-name" placeholder="Enter dataset name" required value={projectName} // Bind the input value to the state variable
          onChange={(e) => { setProjectName(e.target.value); setErrorMessage(0); }} />
        <button className="analysis-button" type="submit">Start the integration of the data </button>
      </form>
      <div>
        {errorMessage > 0 ? (
          <div className="red-rectangle" style={{
            width: `${errorText[errorMessage].length * 10}px`, // Adjust the width based on text length
          }}>
            <p className="file-name">{errorText[errorMessage]}</p>
          </div>) : (null)}
      </div>
    </div>
  );
}

export default ProjectName;
