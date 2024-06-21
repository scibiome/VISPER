import React, { useState, useEffect } from 'react';
import './Entities.css';
/**
 * Define the selectable entities
 * @param {*} param0 
 * @returns 
 */
const RectangleList = ({ names, colors, selectedRectangles, onSelectRectangle, onAddRectangle, onDoneClick, graphML }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
      {names.map((name, index) => (
        <button
          key={index}
          style={{
            backgroundColor: colors[index],
            padding: '10px',
            margin: '5px',
            borderRadius: '10px',
            maxWidth: '200px',
            minWidth: '150px',
            border: selectedRectangles.includes(name) ? '4px solid black' : 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
          onClick={() => onSelectRectangle(name)}
        >
          {name}
        </button>
      ))}
      {graphML.length === 0 ? (
        <div
          style={{
            backgroundColor: 'lightgray',
            padding: '10px',
            margin: '5px',
            borderRadius: '10px',
            maxWidth: '150px',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          <input type="text" placeholder="" id="customName" style={{ width: '100%' }} />
          <button
            onClick={() => {
              const customName = document.getElementById('customName').value;
              onAddRectangle(customName);
            }}
          > Create a Entity</button>
        </div>
      ) : null}

    </div>
  );
};
/**
 * 
 * @param {*} props 
 * @returns 
 */
const App = (props) => {
  /**
   * Get entities from graphml file
   * @param {*} columns 
   * @returns 
   */
  const graphMLWorker = (columns) => {
    let new_entities = [];
    console.log(columns);
    if (columns.length > 0) {
      for (let i = 0; i < columns[0].length; i++) {
        new_entities.push(columns[0][i][0]);
      }
    }
    return new_entities;
  };
  var graphML = graphMLWorker(props.graphML);
  const [names, setNames] = useState(['Drug', 'Protein', 'Cell_Line']);
  const colors = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff', '#fffffc']; //https://coolors.co/palette/ffadad-ffd6a5-fdffb6-caffbf-9bf6ff-a0c4ff-bdb2ff-ffc6ff-fffffc
  //const colors = ['#ef476f', '#ffd166', '#06d6a0','#118ab2','#073b4c'];
  const { selectedEntities } = props;
  const [selectedRectangles, setSelectedRectangles] = useState([]);
  const [errorMessage, setErrorMessage] = useState(0);
  const errorText = [
    null,
    'The maximum Number of entities are selected!',
    'Only letters are allowed!',
    'A Entity with a similar Name already exists!',
    'Please write a entity name!'
  ];
  /**
   * Update selected entities
   */
  useEffect(() => {
    selectedEntities(selectedRectangles);
  }, [selectedRectangles]);

  /**
   * Change selected rectangles
   * @param {*} name 
   */
  const handleRectangleClick = (name) => {
    if (graphML.length === 0) {
      if (selectedRectangles.includes(name)) {
        setSelectedRectangles(selectedRectangles.filter((selected) => selected !== name));
        setErrorMessage(0);
      } else if (selectedRectangles.length < 2) {
        setSelectedRectangles([...selectedRectangles, name]);
        setErrorMessage(0);
      } else {
        setErrorMessage(1);
      }
    }
  };

  /**
   * Create a new rectangle/entity
   * @param {*} customName 
   */
  const handleAddRectangle = (customName) => {
    if (graphML.length === 0) {
      if (customName) {
        if (/^[A-Za-z]+$/.test(customName)) {
          if (!names.some((name) => name.toLowerCase() === customName.toLowerCase())) {
            setNames([...names, customName]);
            setErrorMessage(0);
          } else {
            setErrorMessage(3);
          }
        } else {
          setErrorMessage(2);
        }
      } else {
        setErrorMessage(4);
      }
    }

  };

  return (
    <div>
      {graphML.length > 0 ? (
        <div>
          <p>The following entities were automatically detected</p>
          <RectangleList
            names={graphML}
            colors={colors}
            selectedRectangles={selectedRectangles}
            onSelectRectangle={handleRectangleClick}
            onAddRectangle={handleAddRectangle}
            graphML={graphML}
          />
        </div>
      ) : (
        <div style={{marginLeft: "70px", marginTop: "40px"}}>
          <p>Select up to two Entities </p>
          <RectangleList
            names={names}
            colors={colors}
            selectedRectangles={selectedRectangles}
            onSelectRectangle={handleRectangleClick}
            onAddRectangle={handleAddRectangle}
            graphML={graphML}
          />
          <div>
            {errorMessage > 0 ? (
              <div className="red-rectangle" style={{
                width: `${errorText[errorMessage].length * 10}px`,
              }}>
                <p className="file-name">{errorText[errorMessage]}</p>
              </div>) : (null)}
          </div>

        </div>
      )}
    </div>


  );
};

export default App;
