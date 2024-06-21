import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import NavigationBar from "../NavigationBar/NavigationBar";
import neo4j from 'neo4j-driver';
import { Select, Modal } from 'antd';
const { Option } = Select;
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: rgba(240, 240, 240, 0.5);
`;

const FormContainer = styled.form`
  text-align: center;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

/**
 * Search for a list of search terms
 * @returns 
 */
function App() {
  const [textFieldValue, setTextFieldValue] = useState("SCNN1A , FCGR2A, STX1A");
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(true);
  const [isCheckboxChecked2, setIsCheckboxChecked2] = useState(true);
  const history = useNavigate();
  const handleTextChange = (event) => {
    setTextFieldValue(event.target.value);
  };
  const [selectedEntity, setSelectedEntity] = useState("");
  const [showCheckbox, setShowCheckbox] = useState(true);

  const handleSelectChange = (value) => {
    setSelectedEntity(value);
    setShowCheckbox(value === "" || value === ":Protein");
  };
  const handleCheckboxChange = (event) => {
    setIsCheckboxChecked(event.target.checked);
  };
  const handleCheckboxChange2 = (event) => {
    setIsCheckboxChecked2(event.target.checked);
  };
  const [showWarningModal, setShowWarningModal] = useState(false);

  /**
   * Start search
   */
  const handleModalOk = () => {
    setShowWarningModal(false);
  };

  const handleModalCancel = () => {
    setShowWarningModal(false);
  };

  /**
   * Show video in the background
   */
  useEffect(() => {
    const video = document.getElementById('bgvid');
    if (video) {
      video.playbackRate = 0.4;
    }
  }, []);

  /**
   * handle start search for terms
   * @param {*} event 
   */
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "workwork"));
    const session = driver.session();
    const tx = session.beginTransaction();
    const uniqueUids = new Set();
    const jsonS = textFieldValue.split(/\n|,|;/);
    const elementList = jsonS.map(item => item.trim()).filter(item => item !== '');
    const project_id = 1;
    for (const query of elementList) {
      var construct_queries = "OPTIONAL MATCH (n" + selectedEntity + ") WHERE toLower(n.name) = toLower('" + query + "') and (n.project_id = " + project_id + " or n.project_id_0 IS NULL) WITH n.uid AS uid ";
      if (selectedEntity === "" || selectedEntity === ":Protein") {
        //HAS SYNONYM
        construct_queries += "\nCALL apoc.do.when( \nuid IS NOT NULL, \n'RETURN uid',";
        construct_queries += "\n'OPTIONAL MATCH (p)-[r:HAS_SYNONYM]->(s) WHERE toLower(s.name) = toLower(\"" + query + "\") AND (r.project_id = " + project_id + " or r.project_id_0 IS NULL) RETURN p.uid AS uid LIMIT 1',";
        construct_queries += "\n{uid: uid} \n) YIELD value";
        construct_queries += "\n WITH value.uid AS uid";
        //SWISS
        construct_queries += "\nCALL apoc.do.when( \nuid IS NOT NULL, \n'RETURN uid',";
        construct_queries += "\n'OPTIONAL MATCH (n:Protein) WHERE toLower(n.swiss) = toLower(\"" + query + "\") and (n.project_id = " + project_id + "  or n.project_id_0 IS NULL)  RETURN n.uid AS uid LIMIT 1',";
        construct_queries += "\n{uid: uid} \n) YIELD value";
        construct_queries += "\n WITH value.uid AS uid";
      }
      let lowerCaseString = query.toLowerCase();
      var coss_string = query
      if (lowerCaseString.startsWith("coss") && lowerCaseString.length > 4) {
        coss_string = lowerCaseString.slice(4);
      }
      if (selectedEntity === "" || selectedEntity === ":Cell_Line") {
        construct_queries += "\nCALL apoc.do.when( \nuid IS NOT NULL, \n'RETURN uid',";
        construct_queries += "\n'OPTIONAL MATCH (n:Cell_Line) WHERE toString(n.COSMIC_ID) = \"" + coss_string + "\" and (n.project_id = " + project_id + "  or n.project_id_0 IS NULL) RETURN n.uid AS uid LIMIT 1',";
        construct_queries += "\n{uid: uid} \n) YIELD value";
        construct_queries += "\n WITH value.uid AS uid";
      }

      if (selectedEntity === "" || selectedEntity === ":Drug") {
        construct_queries += "\nCALL apoc.do.when( \nuid IS NOT NULL, \n'RETURN uid',";
        construct_queries += "\n'OPTIONAL MATCH (d:Drug) WHERE toLower(d.CHEMBL) = toLower(\"" + query + "\") AND (d.project_id = " + project_id + "  or d.project_id_0 IS NULL) RETURN d.uid AS uid LIMIT 1',";
        construct_queries += "\n{uid: uid} \n) YIELD value";
        construct_queries += "\n WITH value.uid AS uid";
        var drug_string = query;
        if (lowerCaseString.startsWith("drug") && lowerCaseString.length > 4) {
          drug_string = lowerCaseString.slice(4);
        }
        if (/^\d{4}$/.test(drug_string)) {
          construct_queries += "\nCALL apoc.do.when( \nuid IS NOT NULL, \n'RETURN uid',";
          construct_queries += "\n'OPTIONAL MATCH (d:Drug) WHERE d.drug_id = \"" + drug_string + "\" AND (d.project_id = " + project_id + " or d.project_id_0 IS NULL)  RETURN d.uid AS uid LIMIT 1',";
          construct_queries += "\n{uid: uid} \n) YIELD value";
          construct_queries += "\n WITH value.uid AS uid";
        }

      }
      var other_condition = "";
      /**if (isCheckboxChecked2) {
        other_condition = " and n.Organism_ID_Interactor_0 = \"9606\"";
      }**/
      if (isCheckboxChecked && (selectedEntity === "" || selectedEntity === ":Protein")) {

        construct_queries += "\nCALL apoc.do.when( \nuid IS NOT NULL, \n'RETURN uid',";
        construct_queries += "\n'OPTIONAL MATCH (n" + selectedEntity + ") WHERE toLower(n.name) = toLower(\"" + query + "\") and n.project_id_0 = 0" + other_condition + " RETURN n.uid AS uid LIMIT 1',";
        construct_queries += "\n{uid: uid} \n) YIELD value";
        construct_queries += "\n WITH value.uid AS uid";

        construct_queries += "\nCALL apoc.do.when( \nuid IS NOT NULL, \n'RETURN uid',";
        construct_queries += "\n'OPTIONAL MATCH (n)-[r:HAS_SYNONYM]->(s) WHERE toLower(s.name) = toLower(\"" + query + "\") AND r.project_id_0 = 0" + other_condition + " RETURN n.uid AS uid LIMIT 1',";
        construct_queries += "\n{uid: uid} \n) YIELD value";
        construct_queries += "\n WITH value.uid AS uid";


        construct_queries += "\nCALL apoc.do.when( \nuid IS NOT NULL, \n'RETURN uid',";
        construct_queries += "\n'OPTIONAL MATCH (n:Protein) WHERE toLower(n.SWISS_PROT_Accessions_Interactor	) = toLower(\"" + query + "\") and n.project_id_0 = 0" + other_condition + " RETURN n.uid AS uid LIMIT 1',";
        construct_queries += "\n{uid: uid} \n) YIELD value";
        construct_queries += "\n WITH value.uid AS uid";

      }

      construct_queries += "\nRETURN uid LIMIT 1";
      const result = await tx.run(construct_queries);
      const uid = result.records[0]?.get('uid');

      if (uid !== undefined) {
        uniqueUids.add(uid);
      }
    }

    await tx.commit();
    await session.close();
    await driver.close();
    const arr = [...uniqueUids];
    console.log("uniqueUids", JSON.stringify(arr));
    if (arr.length > 0 && arr[0] !== null) {
      history('/Graph', { state: { arr } });
    } else {
      setShowWarningModal(true);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <img
        src="background3.jpg"
        alt="Background"
        className="image-background"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          top: -20,
          left: 0,
          zIndex: 1,
        }}
      />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
        <NavigationBar />
        <Container>
          <FormContainer onSubmit={handleSubmit} method="GET">
            <Title>Search for the following Entities: </Title>
            <Select
              style={{ width: 200, marginLeft: 10 }}
              defaultValue=""
              onChange={handleSelectChange}
              value={selectedEntity}
            >
              <Option value="">All Entities</Option>
              <Option value=":Protein">Protein</Option>
              <Option value=":Drug">Drug</Option>
              <Option value=":Cell_Line">Cell Line</Option>
            </Select>
            <Textarea
              rows="5"
              cols="60"
              name="text"
              placeholder="SCNN1A , FCGR2A, STX1A"
              value={textFieldValue}
              onChange={handleTextChange}
            />
            <br />
            {showCheckbox && (
              <>
                <label>
                  <input type="checkbox" onChange={handleCheckboxChange} checked={isCheckboxChecked} />
                  &nbsp;Include Proteins that are only in the BioGRID dataset.
            </label>

                {/**<label>
                  <input type="checkbox" onChange={handleCheckboxChange2} checked={isCheckboxChecked2} />
                  &nbsp;Include only human proteins.
                </label>**/}
              </>
            )}
            <Button type="submit">Search List</Button>
          </FormContainer>
        </Container>
        <Modal
          title="Warning"
          visible={showWarningModal}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          okButtonProps={{
            onClick: handleModalOk,
            style: { backgroundColor: '#4096FF' }
          }}
        >
          <p>No matches where found.</p>
        </Modal>
      </div>
    </div>
  );
}

export default App;
