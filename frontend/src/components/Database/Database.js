import React, { useState, useEffect } from 'react';
import axios from "axios";
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import {Layout} from 'antd';
import './Database.css';
import NavigationBar from "../NavigationBar/NavigationBar";
const {Content} = Layout;
/**
 * Shows Database component
 * Includes information to datasets and filter options for this datasets
 */
function Upload() {
    const [data, setData] = useState([]);
    const [allInformation, setAllInformation] = useState([]);
    const [allAssociation, setAllAssociation] = useState([]);
    const putColor = ['#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF', '#FFFFFC']; // https://coolors.co/palette/ffadad-ffd6a5-fdffb6-caffbf-9bf6ff-a0c4ff-bdb2ff-ffc6ff-fffffc
    const [selectedButtons, setSelectedButtons] = useState([]);
    const [selectedButtons2, setSelectedButtons2] = useState([]);
    const [showResetInformation, setShowResetInformation] = useState(0);
    const [showResetAssociation, setShowResetAssociation] = useState(0);

    //get database informations from the fastapi server
    useEffect(() => {
        axios.get("http://localhost:8000/database/")
            .then((response) => {
                // Handle the response and set the data state
                var response_data = response.data.data;
                let new_information = [];
                let new_association = [];
                let new_information2 = [];
                let new_association2 = [];
                for (let i = 0; i < response_data.length; i++) {
                    new_information = [...new Set(new_information.concat(response_data[i][2]))];
                    new_association = [...new Set(new_association.concat(response_data[i][3]))];
                }
                
                for (let i = 0; i < new_information.length; i++) {
                    new_information2.push([new_information[i], putColor[i]]);
                }
                for (let i = 0; i < new_association.length; i++) {
                    new_association2.push([new_association[i], putColor[i]]);
                }
                setAllInformation(new_information2);
                setAllAssociation(new_association2);
                var loaclNestedListInfo = [];
                var loaclNestedListAss = [];
                for (let i = 0; i < response_data.length; i++) {
                    if (response_data[i][2].length > 0) {
                        for (let j = 0; j < response_data[i][2].length; j++) {
                            var getInfoIndex = -1;
                            if(loaclNestedListInfo.length > 0){
                               getInfoIndex = loaclNestedListInfo.findIndex((subArray) => subArray[0] === response_data[i][2][j]);
                            }
                            
                            if(getInfoIndex > -1){
                                loaclNestedListInfo[getInfoIndex][1].push([response_data[i][0],false, response_data[i][1]]);
                            }else{
                                loaclNestedListInfo.push([response_data[i][2][j],[[response_data[i][0],false, response_data[i][1]]]]);
                            }
                        }
                    }
                    if (response_data[i][3].length > 0) {
                        for (let j = 0; j < response_data[i][3].length; j++) {
                            var getInfoIndex2 = -1;
                            if(loaclNestedListAss.length > 0){
                               getInfoIndex2 = loaclNestedListAss.findIndex((subArray) => subArray[0] === response_data[i][3][j]);
                            }
                            
                            if(getInfoIndex2 > -1){
                                loaclNestedListAss[getInfoIndex2][1].push([response_data[i][0],false, response_data[i][1]]);
                            }else{
                                loaclNestedListAss.push([response_data[i][3][j],[[response_data[i][0],false, response_data[i][1]]]]);
                            }
                        }
                    }
                }
                for (let i = 0; i < response_data.length; i++) {
                    if (response_data[i][2].length > 0) {
                        for (let j = 0; j < response_data[i][2].length; j++) {
                            response_data[i][2][j] = [response_data[i][2][j], new_information.indexOf(response_data[i][2][j])];
                        }
                    }
                    if (response_data[i][3].length > 0) {
                        for (let j = 0; j < response_data[i][3].length; j++) {
                            response_data[i][3][j] = [response_data[i][3][j], new_association.indexOf(response_data[i][3][j])]
                        }
                    }
                }
                for (let i = 0; i < loaclNestedListInfo.length; i++) {
                    loaclNestedListInfo[i].push(false);
                }
                setData(response_data);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, []);

    // select and unselect entities of information
    const toggleSelectedButton = (buttonName) => {
        if (selectedButtons.includes(buttonName)) {
            if (selectedButtons.length === 1) {
                setShowResetInformation(0);
            }
            setSelectedButtons(selectedButtons.filter((btn) => btn !== buttonName));

        } else {
            setSelectedButtons([...selectedButtons, buttonName]);
            setShowResetInformation(1);
        }
    };
    // set back the filter of database
    const resetFilterInfo = () => {
        setSelectedButtons([]);
        setShowResetInformation(0);
    };

    // select and unselect entities of association
    const toggleSelectedButton2 = (buttonName) => {
        if (selectedButtons2.includes(buttonName)) {
            if (selectedButtons2.length === 1) {
                setShowResetAssociation(0);
            }
            setSelectedButtons2(selectedButtons2.filter((btn) => btn !== buttonName));

        } else {
            setSelectedButtons2([...selectedButtons2, buttonName]);
            setShowResetAssociation(1);
        }
    };

    // reset the filter for association
    const resetFilterAss = () => {
        setSelectedButtons2([]);
        setShowResetAssociation(0);
    };

    //take md files code and convert the code to html
    const renderMarkdown = (markdownText) => {
        const html = marked(markdownText);
        const sanitizedHtml = DOMPurify.sanitize(html);
        return { __html: sanitizedHtml };
      };
    return (
        <Layout className="layout">
        <NavigationBar />
        <Content>
        <div>
            <div className="information-container2">
                <p>Information
                    {showResetInformation === 1 ? (
                        <button onClick={resetFilterInfo} style={{ backgroundColor: "#FFADAD", margin: '5px', fontSize: 'medium' }}>Reset</button>
                    ) : null}</p>
            </div>
            <div className="information-buttons">
                {allInformation.map(([buttonName, buttonColor], index) => (
                    <button
                        key={index}
                        onClick={() => toggleSelectedButton(buttonName)}
                        style={{
                            backgroundColor: buttonColor,
                            border: selectedButtons.includes(buttonName) ? '2px solid black' : `2px solid ${buttonColor}`,
                            margin: '5px',
                            padding: '5px',

                        }}
                    >
                        {buttonName}
                    </button>
                ))}
            </div>
            <hr />
            <div className="information-container2">
                <p>Association
                    {showResetAssociation === 1 ? (
                        <button onClick={resetFilterAss} style={{ backgroundColor: "#FFADAD", margin: '5px',fontSize: 'medium' }}>Reset</button>
                    ) : null}</p>
            </div>
            <div className="information-buttons2">
                {allAssociation.map(([buttonName2, buttonColor2], index) => (
                    <button
                        key={index}
                        onClick={() => toggleSelectedButton2(buttonName2)}
                        style={{
                            backgroundColor: buttonColor2,
                            border: selectedButtons2.includes(buttonName2) ? '2px solid black' : `2px solid ${buttonColor2}`,
                            margin: '5px',
                            padding: '5px',

                        }}
                    >
                        {buttonName2}
                    </button>
                ))}
            </div>
            <hr />
            <div>
                {data.map(([dataName, id, info, ass, dataStatus, mdText], index) => (
                    selectedButtons.every(value => info.some(subArray => subArray[0] === value)) ? (
                    <details key={index}>
                        <summary className="summary-with-image">
                            {dataName}
                            <span className="summary-image">
                                {dataStatus === 0 ? (<img src="https://img.icons8.com/fluency/48/loading-sign.png" alt="load" />) : (<img src="https://img.icons8.com/color/48/checkmark--v1.png" alt="integrated" />)}

                            </span>
                        </summary>
                        <p>Information</p>
                        <div className="information-buttons">
                            {info.map(([infoName, infoColor], index) => (
                                <button
                                    key={index}
                                    style={{
                                        backgroundColor: `${putColor[infoColor]}`,
                                        margin: '5px',
                                        padding: '5px',

                                    }}
                                >
                                    {infoName}
                                </button>
                            ))}
                        </div>
                        <hr />
                        <p>Association</p>
                        <div className="information-buttons">
                            {ass.map(([infoName, infoColor], index) => (
                                <button
                                    key={index}
                                    style={{
                                        backgroundColor: `${putColor[infoColor]}`,
                                        margin: '5px',
                                        padding: '5px',

                                    }}
                                >
                                    {infoName}
                                </button>
                            ))}
                        </div>
                        {mdText.length > 0 ?<div><hr /> <div dangerouslySetInnerHTML={renderMarkdown(mdText)}></div></div> : null }    
                    </details>
                    ):null                      
                ))}
            </div>
        </div>        
        </Content>
                </Layout>
    );
}

export default Upload;
 