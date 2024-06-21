import React, { useState } from 'react';
import './Settings.css';
/**
 * Change the names and integration process in the neo4j db of the uploaded data 
 * @param {*} props 
 * @returns 
 */
function Settings(props) {
  /**
   * Show structure of uploaded graphml
   * @param {*} graphML 
   * @returns 
   */
  const handleGraphML = (graphML) => {
    let createmlList = [];
    if (graphML != []) {
      for (let i = 0; i < graphML.length; i++) {
        if (i === 0) {
          for (let j = 0; j < graphML[i].length; j++) {
            let attributeString = "";
            for (let k = 0; k < graphML[i][j][1].length; k++) {
              if (attributeString != "") {
                attributeString = attributeString + ", ";
              }
              attributeString = attributeString + graphML[i][j][1][k];
            }
            createmlList.push([graphML[i][j][0], "node", attributeString]);
          }
        }
        if (i === 1) {
          for (let j = 0; j < graphML[i].length; j++) {
            let attributeString = "";
            for (let k = 0; k < graphML[i][j][2].length; k++) {
              if (attributeString != "") {
                attributeString = attributeString + ", ";
              }
              attributeString = attributeString + graphML[i][j][2][k];
            }
            createmlList.push([graphML[i][j][0], graphML[i][j][1][0] + "-" + graphML[i][j][1][1] + " Association", attributeString]);
          }
        }
      }
    }
    return createmlList;
  };
  const columnName = props.getColumnNames;
  const dataType = props.getSelectedButton;
  const gML = handleGraphML(props.getGraphML) || [];
  const { saveData, getError } = props;
  if (gML.length > 0) {
    getError(1);
  }
  let createConnectionTypes = ['Ignore'];
  const [criticalTypes, setCriticalTypes] = useState([]);
  var selectedCriticalTypes = [];
  let usedCriticalTypes = [];
  const colors = ['#f54545', '#647bf7', '#88f545', '#f764e1', '#f7e164'];
  const [names, setNames] = useState(['Drug', 'Protein', 'Cell_Line']);

  /**
   * Set selectable information types
   * @returns 
   */
  const initialConnectionTypes = () => {
    let cTypes = [];
    if (gML.length == 0) {
      for (let i = 0; i < dataType.length; i++) {
        switch (dataType[i]) {
          case 'Drug':
            createConnectionTypes.push('Drug name', 'Drug information');
            cTypes.push('Drug name');
            break;
          case 'Cell_Line':
            createConnectionTypes.push('Cell_Line name', 'Cell_Line information');
            cTypes.push('Cell_Line name');
            break;
          case 'Protein':
            createConnectionTypes.push('Gen name', 'Protein information');
            cTypes.push('Gen name');
            break;
          default:
            createConnectionTypes.push(dataType[i] + " ID", dataType[i] + " information");
            break;
        }
        for (let j = i; j < dataType.length; j++) {
          createConnectionTypes.push(dataType[i] + "-" + dataType[j] + " association");
        }
      }

    }
    setCriticalTypes(cTypes);
    return createConnectionTypes;
  }
  const [connectionTypes, setConnectionTypes] = useState(() => {
    return initialConnectionTypes();
  });

  /**
   * Get types of entities that are available
   * @param {*} index 
   * @returns 
   */
  const getAvailableTypes = (index) => {
    const selectedTypes = data
      .filter((_, i) => i !== index)
      .map((item) => item.selectedType);

    return connectionTypes.filter(
      (type) => !criticalTypes.includes(type) || !selectedTypes.includes(type)
    );
  };


  const [data, setData] = useState(
    columnName.map((name, index) => ({
      originalName: name,
      changedName: name,
      selectedType: 'Ignore',
    }))
  );

  const handleNameChange = (index, value) => {
    const newData = [...data];
    newData[index].changedName = value;
    setData(newData);
    saveData(newData);
  };

  /**
   * Change selected types
   * @param {*} index 
   * @param {*} value 
   */
  const handleTypeChange = (index, value) => {
    const newData = [...data];
    let errorCode = 0;
    if (selectedCriticalTypes.includes(newData[index].selectedType)) {
      selectedCriticalTypes.splice(newData[index].selectedType, 1);
    }
    if (usedCriticalTypes.includes(value)) {
      selectedCriticalTypes.push(value);
    }
    if (selectedCriticalTypes.length == usedCriticalTypes.length) {
      errorCode = 1;
    }
    newData[index].selectedType = value;
    setData(newData);
    saveData(newData);
    getError(errorCode);
  };
  return (
    <div>
      {gML.length > 0 ? (
        <div className="App">
          <p>Detected Node and Edges</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Attributes</th>
              </tr>
            </thead>
            <tbody>
              {gML.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="App">

          <div>
            <h1>Rectangles with Text and Colors</h1>

          </div>
          <table>
            <thead>
              <tr>
                <th>Column Name</th>
                <th>Changed Column Name</th>
                <th>Connection Type</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td>{row.originalName}</td>
                  <td>
                    <input
                      type="text"
                      value={row.changedName}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                    />
                  </td>
                  <td>
                    <select
                      value={row.selectedType}
                      onChange={(e) => handleTypeChange(index, e.target.value)}
                    >
                      {getAvailableTypes(index).map((type, typeIndex) => (
                        <option key={typeIndex} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

  );
}

export default Settings;
