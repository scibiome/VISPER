import React, { useEffect, useRef, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap/dist/js/bootstrap.bundle.min";
import neo4j from "neo4j-driver";
import cytoscape from "cytoscape";
import "./dropdownMenu.css";

const DetailGraph = ({ setSearchValue, searchValue, nodeType }) => {
  //graph reference
  const containerRef = useRef(null);

  //list references - allow to set visibility
  const checkListRef = useRef(null);
  const checkListRef2 = useRef(null);
  const checkListRef3 = useRef(null);
  const checkListRef4 = useRef(null);
  const checkListRef5 = useRef(null);

  //selected files information
  const [selectedDatasets, setSelectedDatasets] = useState([]);
  // set GDSC datasets
  const [selectedGDSC, setSelectedGDSC] = useState(['GDSC1', 'GDSC2']);
  //selected properties for the associations
  const [selectedDrugProteinAssociation, setSelectedDrugProteinAssociation] = useState(['none']);
  const [selectedDrugCellLineAssociation, setSelectedDrugCellLineAssociation] = useState(['none']);
  const [selectedCellLineProteinAssociation, setSelectedCellLineProteinAssociation] = useState(['none']);
  
  const [nodeInfo, setNodeInfo] = useState([]);
  const [edgeInfo, setEdgeInfo] = useState([]);
  //var nodeInfo = [];
  //var edgeInfo = [];

  //shows properties from selected node or edge
  const [tableRows, setTableRows] = useState([]);

  //all shown properties in the lists
  const [drugProteinOptions, setDrugProteinOptions] = useState([{ id: "none", name: "none" }]);
  const [drugCellLineOptions,setDrugCellLineOptions] = useState([{ id: "none", name: "none" }]);
  const [cellLineProteinOptions, setCellLineProteinOptions] = useState([{ id: "none", name: "none" }]);

  //selected node for which details are shown
  var selectedNodeValues;

  //Set options for associations    
  
  const handleItemClick = (element) => {
        console.log('List item clicked!' + toString(element));
      };
  const checkboxClick = (element) => {
    const isChecked = selectedDatasets.includes(element);
    if (isChecked) {
      setSelectedDatasets(selectedDatasets.filter((item) => item !== element));
    } else {
      setSelectedDatasets([...selectedDatasets, element]);
    }
  };
  //Set GDSC
  const checkboxClick2 = (element) => {
    const isChecked = selectedGDSC.includes(element);
    if (isChecked) {
      setSelectedGDSC(selectedGDSC.filter((item) => item !== element));
    } else {
      setSelectedGDSC([...selectedGDSC, element]);
    }
  };
  //Set Drug-Protein
  const checkboxClick3 = (element) => {
    if (selectedDrugProteinAssociation.includes(element)) {
      setSelectedDrugProteinAssociation(['none']);
    } else {
      setSelectedDrugProteinAssociation([element]);
    }
  };
  //Set Drug-Cell line
  const checkboxClick4 = (element) => {
    if (selectedDrugCellLineAssociation.includes(element)) {
      setSelectedDrugCellLineAssociation(['none']);
    } else {
      setSelectedDrugCellLineAssociation([element]);
    }
  };
  //Set Cell line-Protein
  const checkboxClick5 = (element) => {
    if (selectedCellLineProteinAssociation.includes(element)) {
      setSelectedCellLineProteinAssociation(['none']);
    } else {
      setSelectedCellLineProteinAssociation([element]);
    }
  };


  //Set visibility for options of lists
  const handleAnchorClick = (checkListRef) => {
    const checkList = checkListRef.current;
    if (checkList.classList.contains("visible")) {
      checkList.classList.remove("visible");
    } else {
      checkList.classList.add("visible");
    }
  };

  //Set color of the edge
  function generateColorSpectrum(startColor, endColor, steps) {
    const interpolateColor = (color1, color2, factor) => {
      const result = color1.slice();
      for (let i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
      }
      return result;
    };

    const startRGB = startColor.match(/\d+/g).map(Number);
    const endRGB = endColor.match(/\d+/g).map(Number);
    const factor = steps / 100;
    const interpolatedColor = interpolateColor(startRGB, endRGB, factor);
    const color = `rgb(${interpolatedColor.join(', ')})`;

    return color;
  }

  //get node id
  function setNodeProperties(node, setNodeType) {
    switch (setNodeType) {
      case "Protein":
        return node.properties.name;
      case "Drug":
        return node.properties.name;
      case "Cell line":
        return node.properties.name;
    }
  }

  //find out highest and lowest value for a "priority" property
  const getValues = (result, priorityProperty) => {
    var lowestValue;
    var highestValue;
    result.records.forEach((record) => {
      const edge = record.get("r");
      const pp = edge.properties[priorityProperty];
      if (lowestValue === undefined && highestValue === undefined) {
        lowestValue = pp;
        highestValue = pp;
      } else {
        if (lowestValue > pp) {
          lowestValue = pp;
        }
        if (highestValue < pp) {
          highestValue = pp;
        }
      }

    });
    return [lowestValue, highestValue];
  }

  //close recommendations if a click is outside of a list
  const handleOutsideClick = (event) => {
    const dropdownLists = [
      checkListRef.current,
      checkListRef2.current,
      checkListRef3.current,
      checkListRef4.current,
      checkListRef5.current,
    ];

    // Check if the click is inside any of the dropdown lists
    const isInsideDropdownList = dropdownLists.some((list) =>
      list.contains(event.target)
    );

    // If the click is outside the dropdown lists, hide them
    if (!isInsideDropdownList) {
      dropdownLists.forEach((list) => {
        list.classList.remove("visible");
      });
    }
  };

  const addInfo = (node1, edge, node2, nodeInfo2, edgeInfo2) => {
    if((!nodeInfo2.some(info => info === node1.properties)) ){
      nodeInfo2.push(node1.properties);
    }
    
    if (edge) {
      if ((!edgeInfo2.some(info => info === edge.properties))) {
        edgeInfo2.push(edge.properties);
      }
    }
    if(node2){
      if((!nodeInfo2.some(info => info === node2.properties)) ){
        nodeInfo2.push(node2.properties);
      }
    }
    //console.log("NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN")
    //console.log(nodeInfo2)
    return [nodeInfo2, edgeInfo2];
  };
  useEffect(() => {
    const driver = neo4j.driver(
      "bolt://localhost:7687",
      neo4j.auth.basic("neo4j", "workwork")
    );

    //define cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      //layout: { name: "cose" },
      style: [
        {
          selector: "node",
          style: {
            label: "data(name)",
          },
        },
        {
          selector: "edge",
          style: {
            "curve-style": "bezier",
          },
        },
      ],
    });

    let cleanup = false; // Flag to ensure cleanup logic is called only once

    const fetchDataAndCreateGraph = async () => {
      //create neo4j session
      const session = driver.session();

      /**try {**/
        var result;
        let shownRelationships = ["applied_to"];
        //define what is shown in Drug Protein dropdown list
        var optionsPD = [{ id: "none", name: "none" }];
        var optionsCD = [{ id: "none", name: "none" }];
        var optionsCP = [{ id: "none", name: "none" }];
        
        //add content to dropdown list
        if (selectedDatasets.includes("mmc6")) {
          shownRelationships.push("applied_to");
          optionsPD.push({ id: "beta", name: "beta" }, { id: "covs", name: "covs" }, { id: "lr", name: "lr" }, { id: "n", name: "n" }, { id: "nc_beta", name: "nc_beta" }, { id: "nc_fdr", name: "nc_fdr" }, { id: "nc_lr", name: "nc_lr" }, { id: "nc_pval", name: "nc_pval" }, { id: "ppi", name: "ppi" }, { id: "pval", name: "pval" }, { id: "r2", name: "r2" }, { id: "skew", name: "skew" });
        }
        if (selectedDatasets.includes("anova")){
          shownRelationships.push("anova_drug");
          shownRelationships.push("anova_mobem");
          optionsPD.push(
            { id: "gdsc", name: "gdsc" },
            { id: "feature_name", name: "feature_name" },
            { id: "n_feature_pos", name: "n_feature_pos" },
            { id: "n_feature_neg", name: "n_feature_neg" },
            { id: "ic50_effect_size", name: "ic50_effect_size" },
            { id: "log_ic50_mean_pos", name: "log_ic50_mean_pos" },
            { id: "log_ic50_mean_neg", name: "log_ic50_mean_neg" },
            { id: "feature_ic50_t_pval", name: "feature_ic50_t_pval" },
            { id: "feature_delta_mean_ic50", name: "feature_delta_mean_ic50" },
            { id: "feature_pos_ic50_var", name: "feature_pos_ic50_var" },
            { id: "feature_neg_ic50_var", name: "feature_neg_ic50_var" },
            { id: "feature_pval", name: "feature_pval" },
            { id: "tissue_pval", name: "tissue_pval" },
            { id: "msi_pval", name: "msi_pval" },
            { id: "fdr", name: "fdr" },
            { id: "tissue_type", name: "tissue_type" },
            { id: "dataset_version", name: "dataset_version" }
          );
        }
        if (selectedDatasets.includes("fitted dose")){
          shownRelationships.push("fitted_dose_response");
          optionsCD.push(
            { id: "gdsc", name: "gdsc" },
            { id: "dataset", name: "dataset" },
            { id: "nlme_result", name: "nlme_result" },
            { id: "nlme_curve_id", name: "nlme_curve_id" },
            { id: "sanger_model_id", name: "sanger_model_id" },
            { id: "tcga_desc", name: "tcga_desc" },
            { id: "putative_target", name: "putative_target" },
            { id: "pathway_name", name: "pathway_name" },
            { id: "company_id", name: "company_id" },
            { id: "webrelease", name: "webrelease" },
            { id: "min_conc", name: "min_conc" },
            { id: "max_conc", name: "max_conc" },
            { id: "ln_ic50", name: "ln_ic50" },
            { id: "auc", name: "auc" },
            { id: "rmse", name: "rmse" },
            { id: "z_score", name: "z_score" }
          );
        }
        if (selectedDatasets.includes("raw data")){
          shownRelationships.push("raw_data_response");
          optionsCD.push(
            { id: "gdsc", name: "gdsc" },
            { id: "research_project", name: "research_project" },
            { id: "barcode", name: "barcode" },
            { id: "scan_id", name: "scan_id" },
            { id: "date_created", name: "date_created" },
            { id: "scan_date", name: "scan_date" },
            { id: "cell_id", name: "cell_id" },
            { id: "master_cell_id", name: "master_cell_id" },
            { id: "cell_line_name", name: "cell_line_name" },
            { id: "sanger_model_id", name: "sanger_model_id" },
            { id: "seeding_density", name: "seeding_density" },
            { id: "drugset_id", name: "drugset_id" },
            { id: "assay", name: "assay" },
            { id: "duration", name: "duration" },
            { id: "position", name: "position" },
            { id: "tag", name: "tag" },
            { id: "conc", name: "conc" },
            { id: "intensity", name: "intensity" }
          );
        }
        if (selectedDatasets.includes("peptide")){
          shownRelationships.push("connected");
          shownRelationships.push("connect_cellline_protein");
          optionsCP.push({id: "average", name: "average"});
        }
        
        setDrugProteinOptions(optionsPD);
        setDrugCellLineOptions(optionsCD);
        setCellLineProteinOptions(optionsCP);

        if (shownRelationships.length > 0) {//asoociation is selected
          console.log(nodeType)
          switch (nodeType) {
            case "Protein":
              result = await session.run(`MATCH (n:Protein { protein_id: $searchValue})-[r${shownRelationships.length > 0 ? ":" + shownRelationships.join("|") : ""}]-(m) RETURN n, r, m`, { searchValue });
              //result = await session.run(`MATCH (n:Protein { protein_id: $searchValue})-[r]-(m) RETURN n, r, m`, { searchValue });
              break;
            case "Drug":
              result = await session.run("MATCH (n:Drug { drug_name: $searchValue})-[r]-(m) RETURN n, r, m", { searchValue });
              break;
            case "CellLine":
              result = await session.run(`MATCH (n:CellLine { cosmic_id: $searchValue})-[r${shownRelationships.length > 0 ? ":" + shownRelationships.join("|") : ""}]-(m) RETURN n, r, m`, { searchValue });
              break;

          }
          var priorityProperty = "beta";
          var [lowestValue, highestValue] = getValues(result, priorityProperty);
          var nodeInfo3 = [];
          var edgeInfo3 = [];
          result.records.forEach((record) => {
            const node = record.get("n");
            const edge = record.get("r");
            const targetNode = record.get("m");
            var addEdge = false;

            if (edge.properties.hasOwnProperty("GDSC")) {
              if (selectedGDSC.includes(edge.properties.GDSC)) {
                addEdge = true;
              }
            } else {
              addEdge = true;
            }
            if (addEdge) {
              var infoTable = addInfo(node, edge, targetNode, nodeInfo3, edgeInfo3);
              nodeInfo3 = infoTable[0];
              edgeInfo3 = infoTable[0];
              console.log("JHHHHHHH");
              console.log(node);
              cy.add([
                { group: "nodes", data: { id: node.identity.low, name: setNodeProperties(node, node.labels[0]), nodeType: node.labels[0], uid: node.properties.uid}},
                { group: "nodes", data: { id: targetNode.identity.low, name: setNodeProperties(targetNode, targetNode.labels[0]), nodeType: targetNode.labels[0], uid: targetNode.properties.uid } },
                { group: "edges", data: { id: edge.identity.toString(), source: node.identity.toString(), target: targetNode.identity.toString()} },
              ]);
              const lightBlue = 'rgb(173, 216, 230)';
              const darkBlue = 'rgb(0, 0, 139)';
              const numberOfSteps = Math.round(((edge.properties[priorityProperty] - lowestValue) / (highestValue - lowestValue)) * 100);
              var colorRGB = generateColorSpectrum(lightBlue, darkBlue, numberOfSteps);
              cy.style().selector(`edge[id = "${edge.identity.toString()}"]`).css({
                'line-color': colorRGB,
              }).update();
            }
            //console.log("HUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU");

          })
          setNodeInfo(nodeInfo3);
          setEdgeInfo(edgeInfo3);
        } else {
          //console.log("NEIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIINNN")
          //console.log("moin2")
          switch (nodeType) {
            case "Protein":
              result = await session.run(`MATCH (n:Protein { protein_id: $searchValue}) RETURN n`, { searchValue });
              break;
            case "Drug":
              result = await session.run(`MATCH (n:Drug { drug_name: $searchValue}) RETURN n`, { searchValue });
              break;
            case "CellLine":
              result = await session.run(`MATCH (n:CellLine { sample_name: $searchValue}) RETURN n`, { searchValue });
              break;
          }
          result.records.forEach((record) => {
            const node = record.get("n");
            selectedNodeValues = node.properties;
            if (selectedNodeValues.hasOwnProperty("drug_id")) {
              selectedNodeValues.drug_id = selectedNodeValues.drug_id.low;
            }

            var infoTable = addInfo(node);
            setNodeInfo(infoTable[0]);
            setEdgeInfo(infoTable[1]);
            cy.add([
              { group: "nodes", data: { id: node.identity.low, name: setNodeProperties(node, node.labels[0]), nodeType: nodeType, uid: node.properties.uid} }
            ]);
          });
        }
        if (cy._private.renderer) {
          cy.layout({ name: "grid" }).run();
        }
        
        cy.on('click', 'node', async function (event) {
          
          const node = event.target;
          //console.log(node.id());
          //console.log(node.data("nodeType"));
          const nodeType = node.data("nodeType");
          const uidValue = node.data("uid");
          console.log(uidValue);
          console.log(nodeType);
          var resultNodeInfo;
          switch (nodeType) {
            case "Protein":
              resultNodeInfo = await session.run(`MATCH (n:Protein { uid: $uidValue}) RETURN n`, { uidValue });
              break;
            case "Drug":
              resultNodeInfo = await session.run(`MATCH (n:Drug { uid: $uidValue}) RETURN n`, { uidValue });
              console.log("DRUGGGGSGS");
              console.log(resultNodeInfo);
              break;
            case "CellLine":
              resultNodeInfo = await session.run(`MATCH (n:CellLine { uid: $uidValue}) RETURN n`, { uidValue });
              break;
          }
          resultNodeInfo.records.forEach((record) => {
            const node = record.get("n");
            selectedNodeValues = node.properties;
            if (selectedNodeValues.hasOwnProperty("drug_id")) {
              selectedNodeValues.drug_id = selectedNodeValues.drug_id.low;
            }
            const newTable = Object.entries(selectedNodeValues).map(([propertyName, value]) => ({
            name: propertyName,
            value,
            }));
            setTableRows(newTable);
          });
        });
    };


    fetchDataAndCreateGraph();
    //cy.layout({ name: "random" }).run();
    document.addEventListener("click", handleOutsideClick);
    return () => {
      // Set the cleanup flag to true to avoid multiple cleanup calls if the component unmounts before fetching completes
      cleanup = true;
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [searchValue, selectedDatasets, selectedGDSC, selectedDrugProteinAssociation]);

  return (
    <div>
      <div className="graph-container">


        <div id="list1" className="dropdown-check-list" tabIndex="100" ref={checkListRef}>
          <span className="anchor" onClick={() => handleAnchorClick(checkListRef)}>Select Associations</span>
          <ul className="items">
            <li><input type="checkbox"
              checked={selectedDatasets.includes("mmc6")}
              onChange={() => checkboxClick("mmc6")}
            />All Drug-Protein associations </li>
            <li><input type="checkbox"              
              checked={selectedDatasets.includes("anova")}
              onChange={() => checkboxClick("anova")}
            />All Drug-Feature-Cell line associations &#40;ANOVA&#41;</li>
            <li><input type="checkbox" 
              checked={selectedDatasets.includes("fitted dose")}
              onChange={() => checkboxClick("fitted dose")}
            />Drug-Cell line associations &#40;fitted dose&#41;</li>
            <li><input type="checkbox" 
              checked={selectedDatasets.includes("raw data")}
              onChange={() => checkboxClick("raw dara")}
            />Drug-Cell line associations &#40;raw data&#41; </li>
            <li><input type="checkbox" 
              checked={selectedDatasets.includes("peptide")}
              onChange={() => checkboxClick("peptide")}            
            />Cell line - Protein associations &#40;peptide&#41;</li>
          </ul>
        </div>
        <div id="list2" className="dropdown-check-list" tabIndex="100" ref={checkListRef2}>
          <span className="anchor" onClick={() => handleAnchorClick(checkListRef2)}>Select Dataset</span>
          <ul className="items">
            <li><input type="checkbox"
              checked={selectedGDSC.includes("GDSC1")}
              onChange={() => checkboxClick2("GDSC1")}
            />GDSC1</li>
            <li><input type="checkbox"
              checked={selectedGDSC.includes("GDSC2")}
              onChange={() => checkboxClick2("GDSC2")}
            />GDSC2</li>
          </ul>
        </div>
        <div id="list3" className="dropdown-check-list" tabIndex="100" ref={checkListRef3}>
          <span className="anchor" onClick={() => handleAnchorClick(checkListRef3)}>Drug-Protein</span>
          <ul className="items">
            {drugProteinOptions.map(dpo => (
              <li key={dpo.id}><input type="checkbox"
                checked={selectedDrugProteinAssociation.includes(dpo.name)}
                onChange={() => checkboxClick3(dpo.name)}
              />{dpo.name}</li>
            ))}
          </ul>
        </div>
        <div id="list4" className="dropdown-check-list" tabIndex="100" ref={checkListRef4}>
          <span className="anchor" onClick={() => handleAnchorClick(checkListRef4)}>Drug-Cell line</span>
          <ul className="items">
            {drugCellLineOptions.map(dpo => (
              <li key={dpo.id}><input type="checkbox"
                checked={selectedDrugCellLineAssociation.includes(dpo.name)}
                onChange={() => checkboxClick4(dpo.name)}
              />{dpo.name}</li>
            ))}
          </ul>
        </div>
        <div id="list5" className="dropdown-check-list" tabIndex="100" ref={checkListRef5}>
          <span className="anchor" onClick={() => handleAnchorClick(checkListRef5)}>Cell line-Protein</span>
          <ul className="items">
            {cellLineProteinOptions.map(dpo => (
              <li key={dpo.id}><input type="checkbox"
                checked={selectedCellLineProteinAssociation.includes(dpo.name)}
                onChange={() => checkboxClick5(dpo.name)}
              />{dpo.name}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex-container">
        <div className="style-graph" ref={containerRef} style={{width: "1500px", height: "700px", border: "2px solid black" }}></div>
        <div className="container-table">
          <table className="table">
            <thead className="table-dark">
              <tr>
                <th scope="col">Property</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, index) => (
                <tr key={index}>
                  <td>{row.name}</td>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div div class="list-group overflow-auto shadow">
        <ul>
            {nodeInfo.map((row, index) => {
                              
              if(row.hasOwnProperty("drug_name")){
                return (
                <li onClick={() => handleAnchorClick(checkListRef)}>
                  {row.drug_name}
                              </li>
                );
              }
            })}
        </ul>

   
      </div>
    </div>
  );
};


export default DetailGraph;