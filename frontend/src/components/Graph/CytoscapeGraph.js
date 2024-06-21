import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import neo4j from "neo4j-driver";
import axios from "axios";
import contextMenus from 'cytoscape-context-menus';
import SelectMenu from './SelectMenu';
import GraphTable from './GraphTable';
import Legend from './Legend';
import NavigationBar from "../NavigationBar/NavigationBar";
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Checkbox, Layout, Tabs, Button, Tooltip } from 'antd';
import {
  LayoutOutlined,
  DownloadOutlined,
  PictureOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  ExperimentOutlined
} from '@ant-design/icons';

import { saveAs } from 'file-saver';
import xmlbuilder from 'xmlbuilder';
import CustomModalContent from './CustomModalContent';
import cytoscapeGraphML from 'cytoscape-graphml';
import svg from 'cytoscape-svg';
import fcose from 'cytoscape-fcose';
import coseBilkent from 'cytoscape-cose-bilkent';
import elk from 'cytoscape-elk';
import cola from 'cytoscape-cola';
import 'cytoscape-context-menus/cytoscape-context-menus.css';

/**
 * CytoscapeGraph includes all components of the graph component
 */

// add cytoscape.js plugins
cytoscape.use(cytoscapeGraphML);
cytoscape.use(svg);
cytoscape.use(fcose);
cytoscape.use(coseBilkent);
cytoscape.use(elk);
cytoscape.use(cola);
cytoscape.use(contextMenus);
const { Content } = Layout;
const { TabPane } = Tabs;
const { SubMenu } = Menu;
const CreateGraph = (props) => {
  const layoutNames = [
    'grid',
    'circle',
    'cose',
    'cola',
    'elk',
  ];

  const clusterData = [{ name_external: 'Protein-Drug Community Louvain', name_intern: "drug_protein_beta_louvain", entities: ['Drug', 'Protein'], entitie_arr: [true, true, false] },
  { name_external: 'Drug-Drug GDSC1 Cosine tSNE', name_intern: "drug_drug_GDSC1_cosine_tsne", entities: ['Drug'], entitie_arr: [true, false, false], rel_name: "DRUG_SIMILARITY", rel_dataset: "GDSC1" },
  { name_external: 'Drug-Drug GDSC2 Cosine tSNE', name_intern: "drug_drug_GDSC2_cosine_tsne", entities: ['Drug'], entitie_arr: [true, false, false], rel_name: "DRUG_SIMILARITY", rel_dataset: "GDSC2" },
  { name_external: 'Drug-Drug GDSC1 Cosine tSNE global', name_intern: "drug_drug_GDSC1_cosine_tsne_global", entities: ['Drug'], entitie_arr: [true, false, false], rel_name: "DRUG_SIMILARITY", rel_dataset: "GDSC1" },
  { name_external: 'Drug-Drug GDSC2 Cosine tSNE global', name_intern: "drug_drug_GDSC2_cosine_tsne_global", entities: ['Drug'], entitie_arr: [true, false, false], rel_name: "DRUG_SIMILARITY", rel_dataset: "GDSC2" },
  { name_external: 'Drug-Drug GDSC1 Cosine Isomap', name_intern: "drug_drug_GDSC1_cosine_isomap", entities: ['Drug'], entitie_arr: [true, false, false], rel_name: "DRUG_SIMILARITY", rel_dataset: "GDSC1" },
  { name_external: 'Drug-Drug GDSC2 Cosine Isomap', name_intern: "drug_drug_GDSC2_cosine_isomap", entities: ['Drug'], entitie_arr: [true, false, false], rel_name: "DRUG_SIMILARITY", rel_dataset: "GDSC2" },
  { name_external: 'Drug-Drug GDSC1 Cosine Isomap global', name_intern: "drug_drug_GDSC1_cosine_isomap_global", entities: ['Drug'], entitie_arr: [true, false, false], rel_name: "DRUG_SIMILARITY", rel_dataset: "GDSC1" },
  { name_external: 'Drug-Drug GDSC2 Cosine Isomap global', name_intern: "drug_drug_GDSC2_cosine_isomap_global", entities: ['Drug'], entitie_arr: [true, false, false], rel_name: "DRUG_SIMILARITY", rel_dataset: "GDSC2" },
  { name_external: 'Drug-Drug GDSC1 Cosine Louvain', name_intern: "drug_drug_GDSC1_cosine_louvain", entities: ['Drug'], entitie_arr: [true, false, false], rel_name: "DRUG_SIMILARITY", rel_dataset: "GDSC1" },
  { name_external: 'Drug-Drug GDSC2 Cosine Louvain', name_intern: "drug_drug_GDSC2_cosine_louvain", entities: ['Drug'], entitie_arr: [true, false, false], rel_name: "DRUG_SIMILARITY", rel_dataset: "GDSC2" },
  { name_external: 'Drug-Drug GDSC1 Cosine Louvain more communities', name_intern: "drug_drug_GDSC1_cosine_louvain_more_communities", entities: ['Drug'], entitie_arr: [true, false, false], rel_name: "DRUG_SIMILARITY", rel_dataset: "GDSC1" },
  { name_external: 'Drug-Drug GDSC2 Cosine Louvain more communities', name_intern: "drug_drug_GDSC2_cosine_louvain_more_communities", entities: ['Drug'], entitie_arr: [true, false, false], rel_name: "DRUG_SIMILARITY", rel_dataset: "GDSC2" },
  { name_external: 'Drug-Drug GDSC1 Cosine Umap', name_intern: "drug_drug_GDSC1_cosine_umap", entities: ['Drug'], entitie_arr: [true, false, false], rel_name: "DRUG_SIMILARITY", rel_dataset: "GDSC1" },
  { name_external: 'Drug-Drug GDSC2 Cosine Umap', name_intern: "drug_drug_GDSC2_cosine_umap", entities: ['Drug'], entitie_arr: [true, false, false], rel_name: "DRUG_SIMILARITY", rel_dataset: "GDSC2" },
  { name_external: 'Drug-Drug GDSC1 Cosine Umap local', name_intern: "drug_drug_GDSC1_cosine_umap_local", entities: ['Drug'], entitie_arr: [true, false, false], rel_name: "DRUG_SIMILARITY", rel_dataset: "GDSC1" },
  { name_external: 'Drug-Drug GDSC2 Cosine Umap local', name_intern: "drug_drug_GDSC2_cosine_umap_local", entities: ['Drug'], entitie_arr: [true, false, false], rel_name: "DRUG_SIMILARITY", rel_dataset: "GDSC2" },
  { name_external: 'Drug-Drug GDSC1 Cosine Umap global', name_intern: "drug_drug_GDSC1_cosine_umap_global", entities: ['Drug'], entitie_arr: [true, false, false], rel_name: "DRUG_SIMILARITY", rel_dataset: "GDSC1" },
  { name_external: 'Drug-Drug GDSC2 Cosine Umap global', name_intern: "drug_drug_GDSC2_cosine_umap_global", entities: ['Drug'], entitie_arr: [true, false, false], rel_name: "DRUG_SIMILARITY", rel_dataset: "GDSC2" },
  { name_external: 'Drug-Protein GDSC1 tSNE local', name_intern: "drug_protein_GDSC1_tsne_local", entities: ['Drug', 'Protein'], entitie_arr: [true, true, false], rel_name: "ASSOCIATION", rel_dataset: "GDSC1" },
  { name_external: 'Drug-Protein GDSC1 tSNE global', name_intern: "drug_protein_GDSC1_tsne_global", entities: ['Drug', 'Protein'], entitie_arr: [true, true, false], rel_name: "ASSOCIATION", rel_dataset: "GDSC1" },
  { name_external: 'Drug-Protein GDSC2 tSNE local', name_intern: "drug_protein_GDSC2_tsne_local", entities: ['Drug', 'Protein'], entitie_arr: [true, true, false], rel_name: "ASSOCIATION", rel_dataset: "GDSC2" },
  { name_external: 'Drug-Protein GDSC2 tSNE global', name_intern: "drug_protein_GDSC2_tsne_global", entities: ['Drug', 'Protein'], entitie_arr: [true, true, false], rel_name: "ASSOCIATION", rel_dataset: "GDSC2" },
  { name_external: 'Drug-Protein GDSC1 Isomap local', name_intern: "drug_protein_GDSC1_isomap_local", entities: ['Drug', 'Protein'], entitie_arr: [true, true, false], rel_name: "ASSOCIATION", rel_dataset: "GDSC1" },
  { name_external: 'Drug-Protein GDSC1 Isomap global', name_intern: "drug_protein_GDSC1_isomap_global", entities: ['Drug', 'Protein'], entitie_arr: [true, true, false], rel_name: "ASSOCIATION", rel_dataset: "GDSC1" },
  { name_external: 'Drug-Protein GDSC2 Isomap local', name_intern: "drug_protein_GDSC2_isomap_local", entities: ['Drug', 'Protein'], entitie_arr: [true, true, false], rel_name: "ASSOCIATION", rel_dataset: "GDSC2" },
  { name_external: 'Drug-Protein GDSC2 Isomap global', name_intern: "drug_protein_GDSC2_isomap_global", entities: ['Drug', 'Protein'], entitie_arr: [true, true, false], rel_name: "ASSOCIATION", rel_dataset: "GDSC2" },
  { name_external: 'Drug-Protein GDSC1 Louvain local', name_intern: "drug_protein_GDSC1_louvain_local", entities: ['Drug', 'Protein'], entitie_arr: [true, true, false], rel_name: "ASSOCIATION", rel_dataset: "GDSC1" },
  { name_external: 'Drug-Protein GDSC1 Louvain global', name_intern: "drug_protein_GDSC1_louvain_global", entities: ['Drug', 'Protein'], entitie_arr: [true, true, false], rel_name: "ASSOCIATION", rel_dataset: "GDSC1" },
  { name_external: 'Drug-Protein GDSC2 Louvain local', name_intern: "drug_protein_GDSC2_louvain_local", entities: ['Drug', 'Protein'], entitie_arr: [true, true, false], rel_name: "ASSOCIATION", rel_dataset: "GDSC2" },
  { name_external: 'Drug-Protein GDSC2 Louvain global', name_intern: "drug_protein_GDSC2_louvain_global", entities: ['Drug', 'Protein'], entitie_arr: [true, true, false], rel_name: "ASSOCIATION", rel_dataset: "GDSC2" },
  { name_external: 'Drug-Protein GDSC1 Umap global', name_intern: "drug_protein_GDSC1_umap_global", entities: ['Drug', 'Protein'], entitie_arr: [true, true, false], rel_name: "ASSOCIATION", rel_dataset: "GDSC1" },
  { name_external: 'Drug-Protein GDSC2 Umap global', name_intern: "drug_protein_GDSC2_umap_global", entities: ['Drug', 'Protein'], entitie_arr: [true, true, false], rel_name: "ASSOCIATION", rel_dataset: "GDSC2" },
  { name_external: 'Drug-Protein GDSC1 Umap local', name_intern: "drug_protein_GDSC1_umap_local", entities: ['Drug', 'Protein'], entitie_arr: [true, true, false], rel_name: "ASSOCIATION", rel_dataset: "GDSC1" },
  { name_external: 'Drug-Protein GDSC2 Umap local', name_intern: "drug_protein_GDSC2_umap_local", entities: ['Drug', 'Protein'], entitie_arr: [true, true, false], rel_name: "ASSOCIATION", rel_dataset: "GDSC2" },
  { name_external: 'Drug-Protein GDSC1 Umap', name_intern: "drug_protein_GDSC1_umap", entities: ['Drug', 'Protein'], entitie_arr: [true, true, false], rel_name: "ASSOCIATION", rel_dataset: "GDSC1" },
  { name_external: 'Drug-Protein GDSC2 Umap', name_intern: "drug_protein_GDSC2_umap", entities: ['Drug', 'Protein'], entitie_arr: [true, true, false], rel_name: "ASSOCIATION", rel_dataset: "GDSC2" },

  ]
  const [activeClusterConnections, setActiveClusterConnections] = useState(null);
  const [selectedLayout, setSelectedLayout] = useState('cose');
  const handleDownload = (fileContent, fileName, fileType) => {
    const blob = new Blob([fileContent], { type: fileType });
    saveAs(blob, fileName);
  };
  const [showLabels, setShowLabels] = useState(true);
  const [newQuery, setNewQuery] = useState(null);
  const items = [
    {
      label: 'Shown Nodes',
      key: 'snodes',
      children: [],
    },
    {
      label: 'Shown Relationships',
      key: 'sass',
      children: [],
    },
    {
      label: 'Drug Color',
      key: 'nvalues',
      children: [{ label: "Default", key: "4001" }, { label: "ATC-Codes", key: "4003" }, { label: "Drug Types", key: "4005" }, { label: "Drug Indication", key: "4006" }],
    },
  ];
  const [item, setItem] = useState(items);
  const containerRef = useRef(null);
  const [cy, setCy] = useState(null);
  const location = useLocation();

  //All shown data in the local view
  const [neo4jJson, setNeo4jJson] = useState(null);
  //
  const [getAllDrug, setAllDrug] = useState(null);
  const [getAllProtein, setAllProtein] = useState(null);
  const [getAllCell_Line, setAllCell_Line] = useState(null);
  const [filterValueSettings, setFilterValueSettings] = useState([]);
  const [visibleModal, setVisibleModal] = useState(false);
  const [titleModal, setTitleModal] = useState("");
  const [selectedData, setSelectedData] = useState(null);
  const [updateGraph, setUpdateGraph] = useState(false);
  const [selectedNodesState, setSelectedNodesState] = useState([]);
  const [selectedElementInfo, setSelectedElementInfo] = useState([]);
  const [allInformation, setAllInformation] = useState(null);
  const navigate = useNavigate();
  /**
   * Variables for the Filter (e.g. shown node, rel.)
   */
  const [filterSettingsNodes, setFilterSettingsNodes] = useState([]);
  const [filterSettingsEdges, setFilterSettingsEdges] = useState([]);
  //backup data to switch between global and local view
  const [selectNewNode, setSelectNewNode] = useState(null);
  const [deselectNewNode, setDeselectNewNode] = useState(null);
  //selected Clusters that should be shown
  const [newCluster, setnewCluster] = useState([]);

  // state for the view type. if true = local view, false = global view
  const [showLocalView, setShowLocalView] = useState(true);
  const [graphInformation, setGraphInformation] = useState(null);

  const [filterSettingsAttributes, setFilterSettingsAttributes] = useState([]);

  const [showLegend, setShowLegend] = useState([false]);

  //calls useeffect function to change the neo4jjson
  const [deleteElement, setDeleteElement] = useState(null);
  const [trueSmall, setTrueSmall] = useState(null);
  const [falseSmall, setFalseSmall] = useState(null);

  const [c_otherdrugs, setc_otherdrugs] = useState(0);
  const [c_otherproteins, setc_otherproteins] = useState(0);
  const [c_othercelllines, setc_othercelllines] = useState(0);
  const [c_other, setc_other] = useState(0);
  const [showAnalysisTools, setShowAnalysisTools] = useState(true);

  const [activeTab, setActiveTab] = useState('1');

  /**
   * delete shown Element from graph
   */
  useEffect(() => {
    if (deleteElement) {
      var delete_element_id = deleteElement;
      var delete_element_from_list = [...neo4jJson];
      delete_element_from_list = delete_element_from_list.filter(element => {
        return element.id !== delete_element_id &&
          (!element.start || element.start.id !== delete_element_id) &&
          (!element.end || element.end.id !== delete_element_id);
      });
      setNeo4jJson(delete_element_from_list);

    }

  }, [deleteElement]);

  /**
 * Set small to true for a element
 */
  useEffect(() => {
    if (trueSmall) {
      var delete_element_id = trueSmall;
      var delete_element_from_list = [...neo4jJson];
      for (let i = 0; i < delete_element_from_list.length; i++) {
        if (delete_element_from_list[i].id === delete_element_id) {
          delete_element_from_list[i].properties.small = true;
          break;
        }
      }
      setNeo4jJson(delete_element_from_list);
    }

  }, [trueSmall]);



  /**
* Set small to false for a element
*/
  useEffect(() => {
    if (falseSmall) {
      var delete_element_id = falseSmall;
      var delete_element_from_list = [...neo4jJson];
      for (let i = 0; i < delete_element_from_list.length; i++) {
        if (delete_element_from_list[i].id === delete_element_id) {
          delete_element_from_list[i].properties.small = false;
          break;
        }
      }
      setNeo4jJson(delete_element_from_list);
    }

  }, [falseSmall]);

  /**
   * Delete the element from a local graph
   */
  var optionsLocal = {
    evtType: "cxttap",
    menuItems: [
      {
        id: "removed",
        content: "Remove Element",
        tooltipText: "Remove the Element from the graph",
        selector: "node, edge",
        onClickFunction: (event) => {
          var target = event.target;
          var delete_element_id = target.id();
          target.remove();
          setDeleteElement(delete_element_id)
        },
        hasTrailingDivider: true
      }
    ]
  };

  /**
 * Delete the element from a global graph
 */
  var optionsGlobal = {
    evtType: "cxttap",
    menuItems: [
      {
        id: "removed",
        content: "Remove Element",
        tooltipText: "Remove the Element from the graph",
        selector: "node, edge",
        onClickFunction: (event) => {
          var target = event.target;
          var delete_element_id = target.id();
          target.remove();
          setDeleteElement(delete_element_id)
        },
        hasTrailingDivider: true
      },
      {
        id: "pin a element",
        content: "Pin element",
        tooltipText: "Element is shown in all local and global graphs",
        selector: "node, edge",
        onClickFunction: (event) => {
          var target = event.target;
          target.data('small', true);
          target.style({
            'border-color': 'red',
          });
          var delete_element_id = target.id();
          setTrueSmall(delete_element_id);
        },
        hasTrailingDivider: true
      },
      {
        id: "unpin a element",
        content: "Unpin element",
        tooltipText: "Element is not shown in all local and global graphs",
        selector: "node, edge",
        onClickFunction: (event) => {
          var target = event.target;
          target.data('small', false);
          target.style({
            'border-color': 'gray',
          });
          var delete_element_id = target.id();
          setFalseSmall(delete_element_id);
        },
        hasTrailingDivider: true
      }


    ]
  };

  /**
   * Switch bteween local and global view
   */
  const handleSwitchToLocal = () => {
    if (!showLocalView) {
      setShowLocalView(!showLocalView);
      cy.contextMenus(optionsLocal);
    }
  };


  /**
   * Change layout
   * @param {*} layout 
   */
  const handleLayoutChange = (layout) => {
    setSelectedLayout(layout);
    if (cy._private.renderer) {
      cy.layout({ name: layout }).run();
    }
    setCy(cy);
  };


  const handleTabChange = (key) => {
    setActiveTab(key);
  };
  /**
   * Hide or show analysis tools
   */
  const handleShowAnalysisTools = () => {
    setShowAnalysisTools(!showAnalysisTools);
  }


  /**
   * Change shown cluster
   * @param {*} layout 
   */
  const handleClusterChange = (layout) => {
    cy.contextMenus(optionsGlobal);
    setShowLocalView(false);
    const getClusterData = clusterData.find(item => item.name_external === layout);
    var getClusterArray = [];
    getClusterArray.push(getClusterData);
    if (getClusterArray.length > 0) {
      setnewCluster(getClusterArray);
    }
  };

  /**
   * convert neo4j json in json for the graph - only includes nodes and edges that are shown in the graph
   * @param {*} jsonObjects 
   * @param {*} getSeed 
   * @returns 
   */
  const convertJson = (jsonObjects, getSeed) => {
    //create data structure
    const graphData = {
      nodes: [],
      edges: []
    };
    const nodeData = [];
    const edgeData = [];
    //extract information from json
    for (const jsonElement of jsonObjects) {
      var smallGraph = false;
      if (getSeed) {
        smallGraph = true;
      }
      if (jsonElement.type == 'node') {
        const dataObject = {
          ...jsonElement.properties,
          id: jsonElement.id,
          label: jsonElement.labels[0],
        };
        nodeData.push(dataObject);
      } else {
        const dataObject = {
          ...jsonElement.properties,
          id: jsonElement.id,
          label: jsonElement.label,
          source: jsonElement.start.id,
          target: jsonElement.end.id,
        };
        edgeData.push(dataObject);
      }

    }
    //add nodeData and edgeData to graphData json
    for (const data of nodeData) {
      graphData.nodes.push({ data });
    }

    for (const data of edgeData) {
      graphData.edges.push({ data });
    }
    return graphData
  }

  /**
   * Update slider after change
   * @param {*} obj 
   */
  const handleSliderChange = (obj) => {
    // Update the slider value in the selected data
    const updatedData = filterValueSettings.map((item) =>
      JSON.stringify(item) === JSON.stringify(selectedData)
        ? obj
        : item
    );
    setFilterValueSettings(updatedData);
  };

  /**
   * Get Query and calls UseEffect
   * @param {*} value 
   */
  const handleNewQuery = (value) => {
    setNewQuery(value);
  }

  /**
   * Get node informationen for a single node based on a provided uid
   * @param {*} oneUid 
   * @returns 
   */

  const addNodeWithUid = async (oneUid) => {
    //Connect to Neo4j Server
    const driver = neo4j.driver("neo4j://localhost:7687", neo4j.auth.basic("neo4j", "workwork"));
    const session = driver.session();
    //Query to get for a list of nodes all there target nodes and relationships
    var source = "MATCH (n)\nWHERE n.uid = '" + oneUid + "'\nWITH COLLECT(n) AS source\nUNWIND source as node \nWITH COLLECT(DISTINCT node) AS nodes";
    var apoc = "\nCALL apoc.export.json.data(nodes, null, null, {stream: true})\nYIELD data\nRETURN data"
    var query = source + apoc;

    // get query
    const result = await session.run(query);

    //close session and connection
    session.close();
    driver.close();

    // return json
    const jsonData = result.records[0].get("data");
    const jsonArray = jsonData.split('\n').map(JSON.parse);
    return jsonArray;
  };
  /**
   * Loads all necessary node data from the database.
   * @returns 
   */
  const getAllNodeData = async (seed) => {
    //Connect to Neo4j Server
    const driver = neo4j.driver("neo4j://localhost:7687", neo4j.auth.basic("neo4j", "workwork"));
    const session = driver.session();
    var source
    var apoc = "\nCALL apoc.export.json.data(nodes, null, null, {stream: true})\nYIELD data\nRETURN data"
    var query
    var jsonArray4 = [];
    if (seed.length > 0) {
      const searchNodesString = "[" + seed.map(item => `'${item}'`).join(', ') + "]";
      source = "MATCH (n)\nWHERE n.uid IN " + searchNodesString + "\nWITH COLLECT(n) AS source\nUNWIND source as node \nWITH COLLECT(DISTINCT node) AS nodes";
      query = source + apoc;
      const resultSeed = await session.run(query);
      const jsonData4 = resultSeed.records[0].get("data");
      jsonArray4 = jsonData4.split('\n').map(JSON.parse);

    }

    //Query to get for a list of nodes all there target nodes and relationships
    source = "MATCH (n:Drug)\nWHERE n.project_id = 1 \nWITH COLLECT(n) AS source\nUNWIND source as node \nWITH COLLECT(DISTINCT node) AS nodes";
    query = source + apoc;
    const resultAllDrugs = await session.run(query);
    // get query
    source = "MATCH (n:Protein)\nWHERE n.project_id = 1 \nWITH COLLECT(n) AS source\nUNWIND source as node \nWITH COLLECT(DISTINCT node) AS nodes";
    query = source + apoc;
    const resultAllProteins = await session.run(query);
    // get query
    source = "MATCH (n:Cell_Line)\nWHERE n.project_id = 1 \nWITH COLLECT(n) AS source\nUNWIND source as node \nWITH COLLECT(DISTINCT node) AS nodes";
    query = source + apoc;
    const resultAllCell_Line = await session.run(query);
    //source = "MATCH (n)\nWHERE n.uid IN " + searchNodesString + "\nWITH COLLECT(n) AS source\nUNWIND source as node \nWITH COLLECT(DISTINCT node) AS nodes";
    //query = source + apoc;
    //const resultSeed = await session.run(query);
    //close session and connection
    session.close();
    driver.close();

    // return json
    const jsonData1 = resultAllDrugs.records[0].get("data");
    const jsonArray1 = jsonData1.split('\n').map(JSON.parse);
    const jsonData2 = resultAllProteins.records[0].get("data");
    const jsonArray2 = jsonData2.split('\n').map(JSON.parse);
    const jsonData3 = resultAllCell_Line.records[0].get("data");
    const jsonArray3 = jsonData3.split('\n').map(JSON.parse);
    const allReturnData = [jsonArray1, jsonArray2, jsonArray3, jsonArray4]
    return allReturnData;
  };


  /**
   * This function get all initial node and edge types and set the variables
   */

  const initialGetAllNodeAndEdgeTypes = async () => {
    axios.get("http://localhost:8000/getAllInformation/")
      .then((response) => {
        var response_data = response.data;
        const nodeTypesFiltered = response_data[1];
        const relationshipTypesFiltered = response_data[0];
        setGraphInformation(response_data[2]);


        const formattedRelationshipTypes = relationshipTypesFiltered.map(item => ({ name: item['RelationshipType'], show: true, sourceTarget: item['NodeLabel'] }));
        const formattedNodesTypes = nodeTypesFiltered.map(item => ({ name: item, show: true }));
        setFilterSettingsNodes(formattedNodesTypes);
        setFilterSettingsEdges(formattedRelationshipTypes);
        setAllInformation(response_data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

  /**
   * This function adds the property small to all nodes and edges of a list
   */
  const addSmallProperty = (non_small_list, is_seed) => {
    for (let i = 0; i < non_small_list.length; i++) {
      non_small_list[i].properties.small = is_seed;
    }
    return non_small_list;
  };

  /**
   * Handle changed filter data from selectmenu
   * @param {*} newFilterData 
   */
  const handleNewFilter = (newFilterData) => {
    setFilterSettingsAttributes(newFilterData);
  };

  /**
   * Handle what nodes and association should be shown in the graph
   */
  const setShownNodesAndAssociationUI = () => {
    var shownNodeList = filterSettingsNodes;
    var shownAssociationList = [];
    for (let i = 0; i < filterSettingsEdges.length; i++) {
      const filterSettingsEdgesElement = filterSettingsEdges[i];
      const name = filterSettingsEdgesElement.name;
      const showFilter = filterSettingsEdgesElement.show;
      const sourceTarget = filterSettingsEdgesElement.sourceTarget;

      // Check if sourceTarget already exists in shownAssociationList
      const existingAssociation = shownAssociationList.find(item => item[0] === sourceTarget);

      if (existingAssociation) {
        // SourceTarget already exists, add name to its array
        existingAssociation[1].push({ name: name, show: showFilter });
      } else {
        // SourceTarget does not exist, create a new element
        shownAssociationList.push([sourceTarget, [{ name: name, show: showFilter }]]);
      }
    }

    var localItem = items;
    for (let i = 0; i < shownNodeList.length; i++) {
      localItem[0].children.push({ label: shownNodeList[i].name, key: "0" + i, checked: shownNodeList[i].show });
    }
    for (let i = 0; i < shownAssociationList.length; i++) {
      var nameString = shownAssociationList[i][0];
      localItem[1].children.push({ type: 'group', label: nameString, children: [] });
      for (let j = 0; j < shownAssociationList[i][1].length; j++) {
        localItem[1].children[localItem[1].children.length - 1].children.push({ label: shownAssociationList[i][1][j].name, key: "4" + i + j, checked: shownAssociationList[i][1][j].show });
      }
    }
    setItem(localItem);

  };


  // Function to handle checkbox changes
  const handleCheckboxChange = (menuItemKey, menuItemLabel, childKey, childLabel) => {
    console.log("591", menuItemKey, menuItemLabel, childKey, childLabel);
    const updatedItems = [...item]; // Create a copy of the items array
    if (typeof menuItemKey !== 'undefined') {
      updatedItems.forEach((menuItem) => {
        if (menuItem.key === menuItemKey) {
          menuItem.children = menuItem.children.map((child) => ({
            ...child,
            checked: child.key === childKey ? !child.checked : child.checked,
          }));
        }
      });
    } else {
      updatedItems.forEach((menuItem) => {
        if (menuItem.label === "Shown Relationships") {
          // If you have another level of children, update the value within that level
          menuItem.children = menuItem.children.map((child) => {
            child.children = child.children.map((nestedChild) => {
              if (nestedChild.key === childKey) {
                return { ...nestedChild, checked: !nestedChild.checked };
              } else {
                return nestedChild;
              }
            });
            return child;
          });
        }
      });
    }

    //Change shown nodes
    if (menuItemLabel === "Shown Nodes") {
      setFilterSettingsNodes(prevFilterSettings => prevFilterSettings.map(item => {
        if (item.name === childLabel) {
          return {
            ...item,
            show: !item.show,
          };
        }
        return item;
      }));
    } else {
      setFilterSettingsEdges(prevFilterSettings => prevFilterSettings.map(item => {
        if (item.name === childLabel) {
          return {
            ...item,
            show: !item.show,
          };
        }
        return item;
      }));
    }

    if (menuItemLabel === "Other Settings") {
      const changeShowLabel = !showLabels;
      if (changeShowLabel) {
        cy.style()
          .selector('node')
          .style({
            label: 'data(name)',
          }).update();
      } else {
        cy.style()
          .selector('node')
          .style({
            label: '',
          }).update();
      }
      setShowLabels(changeShowLabel);

    }
    setItem(updatedItems);
  };

  /**
   * Change the color coding
   * @param {*} childLabel //Color Coding e.g. Default
   * @param {*} parentLabel //Group that should be color coded e.g. General, Drug etc.
   */
  const handleColorCodingChange = (childLabel, parentLabel) => {
    //delete existing styles
    cy.style().clear();
    let node_att;
    let number_of_groups;
    let group_labels;
    var groupSettings = [{ name: 'Louvain Communities', node_att_name: 'drug_protein_community_louvain_label', number_of_groups: 9 },
    { name: 'ATC-Codes', node_att_name: 'ATC_number', number_of_groups: 9, group_labels: ['Many', 'C', 'L', 'A', 'S', 'J', 'D', 'P', 'R'] },
    { name: "Drug Types", node_att_name: 'drug_type_number', number_of_groups: 3, group_labels: ['Small molecule', 'Protein', 'Antibody'] },
    { name: "Known Cancer Drugs and Drug Repurposing Candidates", node_att_name: 'drug_status', number_of_groups: 2, group_labels: ['Anti-Cancer drugs', 'Drug repurposing candidates'] },
    { name: "Drug Indication", node_att_name: 'indicator', number_of_groups: 19, group_labels: ['bladder cancer', 'breast cancer', 'cervical cancer', 'colorectal cancer', 'endometrial cancer', 'gastric cancer', 'head and neck cancer', 'hepatocellular cancer', 'kidney cancer', 'leukemia', 'lung cancer', 'lymphoma', 'ovarian cancer', 'pancreatic cancer', 'peritoneum cancer', 'prostate cancer', 'rectum cancer', 'sarcoma', 'skin cancer'] },
    { name: "Small Louvain Drug Communities", node_att_name: 'drug_drug_GDSC1_cosine_louvain_more_communities', number_of_groups: 18 },
    { name: "Small Louvain Drug-Protein Communities", node_att_name: 'drug_protein_GDSC1_louvain_global', number_of_groups: 20 },
    { name: "Large Louvain Drug Communities", node_att_name: 'drug_drug_GDSC1_cosine_louvain', number_of_groups: 6 },
    { name: "Large Louvain Drug-Protein Communities", node_att_name: 'drug_protein_GDSC1_louvain_local', number_of_groups: 10 },
    { name: "Small Louvain Drug Communities", node_att_name: 'drug_drug_GDSC2_cosine_louvain_more_communities', number_of_groups: 19 },
    { name: "Small Louvain Drug-Protein Communities", node_att_name: 'drug_protein_GDSC2_louvain_global', number_of_groups: 16 },
    { name: "Large Louvain Drug Communities", node_att_name: 'drug_drug_GDSC2_cosine_louvain', number_of_groups: 8 },
    { name: "Large Louvain Drug-Protein Communities", node_att_name: 'drug_protein_GDSC2_louvain_local', number_of_groups: 10 }
    ];


    //https://mokole.com/palette.html
    var colorPallet = ['#ff00ff', '#7f0000', '#006400', '#9acd32', '#00008b', '#ff0000', '#ff8c00', '#ffd700', '#40e0d0', '#00ff00', '#ba55d3', '#00fa9a', '#0000ff', '#f08080', '#696969', '#1e90ff', '#dda0dd', '#ff1493', '#87cefa', '#d4af37', '#ffe4c4'];
    var foundGroup = groupSettings.find(group => group.name === childLabel);
    console.log("foundGroup", foundGroup, parentLabel, childLabel)
    /**if (parentLabel === "General") {
      foundGroup
    } else {
      for (let o = 0; o < groupSettings.length; o++) {
        if (groupSettings[o].name === childLabel && groupSettings[o].node_att_name.includes(parentLabel)) {
          foundGroup = groupSettings[o];
          break;
        }
      }
    }**/

    if (foundGroup) {
      node_att = foundGroup.node_att_name;
      number_of_groups = foundGroup.number_of_groups;
      group_labels = foundGroup.group_labels;
    }
    //highlight existing seed nodes

    var addLabelCondition = "";
    if (parentLabel !== 'Default') {
      addLabelCondition = '[label=' + parentLabel + ']';
    }
    if (childLabel === 'Default') {
      console.log("719 Drug");
      var new_legend = [false];
      setShowLegend(new_legend);
      cy.style()
        .selector('node')
        .style({
          label: 'data(name)',
          'border-width': '4px',
          'border-color': 'gray',
          'background-image': './unknown.png',
          'background-fit': 'cover',
        })
        .selector('node[label="Protein"][project_id_0=0]')
        .style({
          label: 'data(name)',
          'border-width': '4px',
          'border-color': 'gray',
          'background-image': './protein-highlight.png',
          'background-fit': 'cover',
        })
        .selector('node[label="Protein"][project_id=1]')
        .style({
          label: 'data(name)',
          'border-width': '4px',
          'border-color': 'gray',
          'background-image': './protein.png',
          'background-fit': 'cover',
        })
        .selector('node[label="Cell_Line"]')
        .style({
          label: 'data(name)',
          'border-width': '4px',
          'border-color': 'gray',
          'background-image': './cellline.png',
          'background-fit': 'cover',
          shape: 'hexagon',
        })
        .selector('node[label="Drug"]')
        .style({
          label: 'data(name)',
          'border-width': '4px',
          'border-color': 'gray',
          'background-image': './drug.png',
          'background-fit': 'cover',
          shape: 'rectangle',
        }).selector("edge")
        .style({
          "curve-style": "bezier",
          width: 4
        });
    }

    // Communities based on numbers
    if (node_att) {
      console.log("719 numbers");
      var new_legend = [];
      var criteria = '';
      cy.style()
        .selector('node')
        .style({
          label: 'data(name)',
          'border-width': '4px',
          'border-color': 'gray',
        })
        .selector('node[label="Protein"][project_id_0=0]')
        .style({
          label: 'data(name)',
          'border-width': '4px',
          'border-color': 'gray',
        })
        .selector('node[label="Protein"][project_id=1]')
        .style({
          label: 'data(name)',
          'border-width': '4px',
          'border-color': 'gray',
        })
        .selector('node[label="Cell_Line"]')
        .style({
          label: 'data(name)',
          'border-width': '4px',
          'border-color': 'gray',
          shape: 'hexagon',
        })
        .selector('node[label="Drug"]')
        .style({
          label: 'data(name)',
          'border-width': '4px',
          'border-color': 'gray',
          shape: 'rectangle',
        }).selector("edge")
        .style({
          "curve-style": "bezier",
          width: 4
        });

      if (node_att === "indicator") {
        console.log("719 indicator");
        cy.style()
        .selector('node')
        .style({
          'background-image': './unknown.png',
          'background-fit': 'cover',
        })
        .selector('node[label="Protein"]')
        .style({
          'background-image': './transparent_protein.png',
          'background-fit': 'cover',
        })
        .selector('node[label="Cell_Line"]')
        .style({
          'background-image': './cellline.png',
          'background-fit': 'cover',
        })
        .selector('node[label="Drug"]')
        .style({
          'background-image': './transparent_drug.png',
          'background-fit': 'cover',
        });
        new_legend.push({ name: "unknown", color: '#219ebc', show: true, value: 100, att: node_att, level: 100 });
        cy.style()
          .selector('node')
          .style({
            label: 'data(name)',
            'border-width': '4px',
            'border-color': 'gray',
            'background-color': '#219ebc',
          });
        new_legend.push({ name: "drug indication exist", color: '#ffb703', show: true, value: 30, att: node_att, level: 100 });
        criteria = 'node[' + node_att + ']';
        cy.style()
          .selector(criteria)
          .style({
            label: 'data(name)',
            'border-width': '4px',
            'border-color': 'gray',
            'background-color': '#ffb703',
          });
        for (let i = 0; i < number_of_groups; i++) {
          new_legend.push({ name: group_labels[i], color: 'grey', show: true, value: i, att: node_att, level: 100 });
        }

      } else {
        console.log("719 not-indicator");
        cy.style()
          .selector('node')
          .style({
            label: 'data(name)',
            'border-width': '4px',
            'border-color': 'gray',
            'background-color': '#ffe4c4',
          }).selector('node')
          .style({
            'background-image': './unknown.png',
            'background-fit': 'cover',
          })
          .selector('node[label="Protein"]')
          .style({
            'background-image': './transparent_protein.png',
            'background-fit': 'cover',
          })
          .selector('node[label="Cell_Line"]')
          .style({
            'background-image': './cellline.png',
            'background-fit': 'cover',
          })
          .selector('node[label="Drug"]')
          .style({
            'background-image': './transparent_drug.png',
            'background-fit': 'cover',
          });
        new_legend.push({ name: "unknown", color: colorPallet[20], show: true, value: 100, att: node_att });
        for (let i = 0; i < number_of_groups; i++) {
          if (group_labels) {
            new_legend.push({ name: group_labels[i], color: colorPallet[i], show: true, value: i, att: node_att });
          } else {
            new_legend.push({ name: "Community " + i.toString(), color: colorPallet[i], show: true, value: i, att: node_att });
          }
          criteria = 'node[' + node_att + '=' + i + ']';
          cy.style()
            .selector(criteria)
            .style({
              label: 'data(name)',
              'border-width': '4px',
              'border-color': 'gray',
              'background-color': colorPallet[i],
            });
        }
      }
      setShowLegend(new_legend);
    }
    if (!showLocalView) {
      cy.style()
        .selector('node[small="true"]')
        .style({
          'border-width': '4px',
          'border-color': 'blue',
          'width': '40px',
          'height': '40px',
        });
      cy.style()
        .selector('edge[small]')
        .style({
          'line-color': 'blue',
          width: 4,
        });
    }
    if (showLabels) {
      cy.style()
        .selector('node')
        .style({
          label: 'data(name)',
        });
    } else {
      cy.style()
        .selector('node')
        .style({
          label: '',
        });
    }
    setCy(cy);
  };

  /**
   * Reload the graph component
   */
  const handleReset = () => {
    const arr = location.state.arr;
    navigate('/Graph', { state: { arr } });
  };

  const handleReRender = () => {
    cy.layout({ name: selectedLayout }).run();
  };

  /**
   * Export the shown graph to a graphml file
   * @returns 
   */
  const graphToGraphML = () => {
    const visibleNodes = cy.nodes().filter(':visible');
    const visibleEdges = cy.edges().filter(':visible');

    // Create a new Cytoscape instance to store the filtered graph
    const filteredCy = cytoscape(); // You may need to import cytoscape.js library

    // Add the visible nodes and edges to the filtered graph
    filteredCy.add(visibleNodes);
    filteredCy.add(visibleEdges);
    // Create a new GraphML XML document
    const xml = xmlbuilder.create('graphml');
    xml.att('xmlns', 'http://graphml.graphdrawing.org/xmlns');

    // Create a key for node positions
    xml.ele('key', { id: 'd0', for: 'node', attr: 'x', type: 'int' });
    xml.ele('key', { id: 'd1', for: 'node', attr: 'y', type: 'int' });


    //add attributes
    var node_attributes = [];
    filteredCy.nodes().forEach((node) => {
      for (const key in node.data()) {
        if (key !== 'x' && key !== 'y' && !node_attributes.includes(key) && key !== "project_id" && key !== "uid") {
          var get_type = typeof (node.data(key))
          xml.ele('key', { id: key, for: 'node', 'attr.name': key, 'attr.type': get_type });
          node_attributes.push(key);
        }
      }
    });

    // Add edges
    var edge_attributes = [];
    filteredCy.edges().forEach((edge) => {
      for (const key in edge.data()) {
        if (key !== 'source' && key !== 'target' && !edge_attributes.includes(key) && key !== "project_id" && key !== "uid") {
          var get_type = typeof (edge.data(key))
          xml.ele('key', { id: key, for: 'edge', 'attr.name': key, 'attr.type': get_type });
          edge_attributes.push(key);
        }
      }
    });



    // Create a graph element
    const graph = xml.ele('graph', { id: 'G', edgedefault: 'directed' });

    // Add nodes with positions and attributes
    filteredCy.nodes().forEach((node) => {
      const nodeElement = graph.ele('node', { id: node.id() });
      nodeElement.ele('data', { key: 'd0' }, node.position('x'));
      nodeElement.ele('data', { key: 'd1' }, node.position('y'));
      // Add other node attributes as needed
      for (const key in node.data()) {
        var data_value2 = node.data(key);
        var data_value = "";
        if (data_value2 !== undefined) {

          data_value = data_value2.toString();
        }

        if (data_value === "-") {
          data_value = "";
        }

        if (key !== 'x' && key !== 'y' && key !== "project_id" && key !== "uid") {
          nodeElement.ele('data', { key }, data_value);
        }
      }
    });
    // Add edges
    filteredCy.edges().forEach((edge) => {
      const edgeElement = graph.ele('edge', { id: edge.id(), source: edge.source().id(), target: edge.target().id() });

      // Add other edge attributes as needed
      for (const key in edge.data()) {
        if (key !== 'source' && key !== 'target' && key !== "project_id" && key !== "uid") {
          edgeElement.ele('data', { key }, edge.data(key));
        }
      }
    });

    // Generate the GraphML XML content
    return xml.end({ pretty: true });
  };

  /**
   * Handles the export of the graph data to pictures or file formats
   * @param {*} type 
   */
  const handleExportData = (type) => {
    // Replace this example JSON data with your own data
    if (type === "json") {
      // Get visible nodes and edges
      const visibleNodes = cy.nodes().filter(':visible');
      const visibleEdges = cy.edges().filter(':visible');

      // Create a new Cytoscape instance to store the filtered graph
      const filteredCy = cytoscape(); // You may need to import cytoscape.js library

      // Add the visible nodes and edges to the filtered graph
      filteredCy.add(visibleNodes);
      filteredCy.add(visibleEdges);

      // Convert the filtered graph to a JSON object
      const filteredData = filteredCy.json();
      const jsonData = JSON.stringify(filteredData, null, 2);
      handleDownload(jsonData, 'data.json', 'application/json');
    }
    if (type === "graphml") {
      const graphMLContent = graphToGraphML();
      handleDownload(graphMLContent, 'data.graphml', 'text/xml');

    }
    if (type === "png") {
      var text = cy.png({ 'output': 'blob' });
      var name = "cytoscape.png";
      var type = "image/png";
      const a = document.createElement('a');
      var file = new Blob([text], { type: type });
      a.href = URL.createObjectURL(file);
      a.download = name;
      a.click();
    }
    if (type === "jpg") {
      var text = cy.png({ 'output': 'blob' });
      var name = "cytoscape.jpg";
      var type = "image/jpg";
      const a = document.createElement('a');
      var file = new Blob([text], { type: type });
      a.href = URL.createObjectURL(file);
      a.download = name;
      a.click();
    }
    if (type === "svg") {
      var text = cy.svg({ 'output': 'blob' });
      var name = "cytoscape.svg";
      var type = "image/svg+xml";
      const a = document.createElement('a');
      var file = new Blob([text], { type: type });
      a.href = URL.createObjectURL(file);
      a.download = name;
      a.click();
    }
  };

  /**
   * Handle changes on the cytoscape graph from other components
   * @param {*} newCy 
   */
  const handleCyChange = (newCy) => {
    setCy(newCy);
  };
  /**
   * Set selected element info
   * @param {*} newSelectedElementInfo 
   */
  const handlesetSelectedElementInfo = (newSelectedElementInfo) => {
    setSelectedElementInfo(newSelectedElementInfo);
  };

  /**
   * Set selected node
   * @param {*} newSelectedNodes 
   */
  const handleSelectedNodes = (newSelectedNodes) => {
    setSelectedNodesState(newSelectedNodes);
  }

  /**
   * Hide or show legend
   * @param {*} newLegend 
   */
  const handleShowLegend = (newLegend) => {
    setShowLegend(newLegend);
  };

  /**
   * add or show the node with a specific uid in the graph
   * @param {*} value 
   */
  const handleUid = (value) => {
    if (cy) {
      var isNodeInGraph = false;
      var selectedNodeId = null;
      for (const node of cy.nodes()) {
        if (value === node.data('uid')) {
          isNodeInGraph = true;
          selectedNodeId = node.id();
          break;
        }
      }
      if (isNodeInGraph) {
        const targetNode = cy.$(`#${selectedNodeId}`);
        const nodePosition = targetNode.position();

        // Get the dimensions of the viewport
        const viewportWidth = cy.width();
        const viewportHeight = cy.height();

        // Calculate the position to center the node in the viewport
        const centerX = viewportWidth / 2 - nodePosition.x;
        const centerY = viewportHeight / 2 - nodePosition.y;
        const fitAnimation = {
          eles: targetNode,
          padding: 50,
          position: {
            x: centerX,
            y: centerY,
          },
          duration: 500,
        };

        cy.animation({ zoom: 2, duration: 500 }).play().promise().then(() => cy.animation({ fit: fitAnimation }).play().promise());
        setCy(cy);

      } else {
        const addData = async () => {
          const allData = await addNodeWithUid(value)
          //save all node data
          const allData2 = addSmallProperty(allData, true);
          const data2 = await convertJson(allData2, true);
          cy.add(data2);
          if (cy._private.renderer) {
            if (showLocalView) {
              cy.layout({ name: selectedLayout }).run();
            } else {
              var node = cy.$(`#${selectedNodeId}`);
              const drugsPerRow = 20;
              var otherdrugs = c_otherdrugs;
              var otherproteins = c_otherproteins;
              var othercelllines = c_othercelllines;
              var other = c_other;
              var upScaleFactor = 50;
              var get_x = 0;
              var get_y = 0;
              if (node.data('label') === 'Drug') {
                node.position({
                  x: ((otherdrugs % drugsPerRow) * upScaleFactor * 2) + 200,
                  y: 0 - (Math.floor(otherdrugs / drugsPerRow) * upScaleFactor * 2)
                });
                get_x = ((otherdrugs % drugsPerRow) * upScaleFactor * 2) + 200;
                get_y = 0 - (Math.floor(otherdrugs / drugsPerRow) * upScaleFactor * 2);
                otherdrugs = otherdrugs + 1;
              } else if (node.data('label') === 'Protein') {
                node.position({
                  x: 0 - (Math.floor(otherproteins / drugsPerRow) * upScaleFactor * 2),
                  y: ((otherproteins % drugsPerRow) * upScaleFactor * 2) + 200
                });
                get_x = 0 - (Math.floor(otherproteins / drugsPerRow) * upScaleFactor * 2);
                get_y = ((otherproteins % drugsPerRow) * upScaleFactor * 2) + 200;
                otherproteins = otherproteins + 1;
              } else if (node.data('label') === 'Cell_Line') {
                node.position({
                  x: (Math.floor(othercelllines / drugsPerRow) * upScaleFactor * 2) + 200 + (+1000 + (drugsPerRow * upScaleFactor * 2)),
                  y: 0 - ((othercelllines % drugsPerRow) * upScaleFactor * 2)
                });
                get_x = (Math.floor(othercelllines / drugsPerRow) * upScaleFactor * 2) + 200 + (+1000 + (drugsPerRow * upScaleFactor * 2));
                get_y = 0 - ((othercelllines % drugsPerRow) * upScaleFactor * 2)
                othercelllines = othercelllines + 1;
              } else {
                node.position({
                  x: 0 - (Math.floor(other / drugsPerRow) * upScaleFactor * 2),
                  y: ((other % drugsPerRow) * upScaleFactor * 2) + 200 + (+1000 + (drugsPerRow * upScaleFactor * 2))
                });
                get_x = 0 - (Math.floor(other / drugsPerRow) * upScaleFactor * 2);
                get_y = ((other % drugsPerRow) * upScaleFactor * 2) + 200 + (+1000 + (drugsPerRow * upScaleFactor * 2));
                other = other + 1;
              }
              setc_other(other);
              setc_othercelllines(othercelllines);
              setc_otherdrugs(otherdrugs);
              setc_otherproteins(otherproteins);

              // Get the dimensions of the viewport
              const viewportWidth = cy.width();
              const viewportHeight = cy.height();

              // Calculate the position to center the node in the viewport
              const centerX = viewportWidth / 2 - get_x;
              const centerY = viewportHeight / 2 - get_y;
              const fitAnimation = {
                eles: node,
                padding: 50,
                position: {
                  x: centerX,
                  y: centerY,
                },
                duration: 500,
              };

              cy.animation({ zoom: 2, duration: 500 }).play().promise().then(() => cy.animation({ fit: fitAnimation }).play().promise());
            }

          }
        };
        cy.ready(() => {
          addData();
        });
        setCy(cy);

      }
    }
  }

  /**
   * Write specific terms correctly with blanks
   * @param {*} not_correct_text 
   * @returns 
   */

  const handleBetterText = (not_correct_text) => {
    not_correct_text = not_correct_text.replace(/_/g, " ");
    var correct_text = not_correct_text;
    switch (not_correct_text) {
      case "Cell_Line":
        correct_text = "Cell Line"
        break;
      case "Cell_Line-Protein":
        correct_text = "Cell Line-Protein"
        break;
      case "Drug-Cell_Line":
        correct_text = "Drug-Cell Line"
        break;
      case "Drug-Cell_Line":
        correct_text = "Drug-Cell Line"
        break;

      default:
        correct_text = not_correct_text;
    }
    return correct_text;
  };
  /**
   * Extract allClusterData without little graph data
   */
  const getAllClusterData = (neededClusterData, intern_name, smallTrueData) => {
    const uids = smallTrueData.map(item => item.properties.uid);
    const allDatafromSources = [getAllDrug, getAllProtein, getAllCell_Line];
    var getAllNecessaryClusterData = [];
    var intern_name_x = intern_name + "_x"
    var intern_name_y = intern_name + "_y"
    var min_x = 1000.0;
    var min_y = 1000.0;
    for (let i = 0; i < 3; i++) {
      if (neededClusterData[i]) {
        for (const dataClusterElement of allDatafromSources[i]) {
          if (!uids.includes(dataClusterElement.properties.uid) && dataClusterElement.properties.hasOwnProperty(intern_name)) {
            getAllNecessaryClusterData.push(dataClusterElement);
            if (parseFloat(dataClusterElement.properties[intern_name_x]) < min_x) {
              min_x = parseFloat(dataClusterElement.properties[intern_name_x]);
            }
            if (parseFloat(dataClusterElement.properties[intern_name_y]) < min_y) {
              min_y = parseFloat(dataClusterElement.properties[intern_name_y]);
            }
          }
        }
      }
    }

    return {
      getAllNecessaryClusterData: getAllNecessaryClusterData,
      min_x: min_x,
      min_y: min_y
    };
  };

  /**
   * show association or highest similarity edges in the cluster graph
   */
  useEffect(() => {
    if (selectNewNode) {
      if (newCluster.length > 0) {
        for (const newC2 of newCluster) {
          for (let i = 0; i < newC2.entities.length; i++) {
            if (newC2.entities[i] === selectNewNode.label) {
              var create_query = "";
              if (newC2.rel_name === "ASSOCIATION") {
                create_query = "MATCH (p)-[r:" + newC2.rel_name + "]-(q)\n WHERE p.uid = '" + selectNewNode.uid + "' AND (r.fdr < 0.01 or r.nc_fdr < 0.01) AND (abs(r.beta) > 0.1 OR abs(r.nc_beta) > 0.1)\n WITH r, p, q \n ORDER BY ABS(r.beta) DESC \n LIMIT 10 \n CALL apoc.export.json.data([p,q], [r], null, {stream: true}) \n YIELD data \n RETURN data ";
              } else {
                create_query = "MATCH (p)-[r:" + newC2.rel_name + "]-(q)\n WHERE r.dataset='" + newC2.rel_dataset + "' AND p.uid = '" + selectNewNode.uid + "'\n WITH r, p, q \n ORDER BY r.value DESC \n LIMIT 10 \n CALL apoc.export.json.data([p,q], [r], null, {stream: true}) \n YIELD data \n RETURN data ";
              }
              setActiveClusterConnections(newC2.rel_name);
              setNewQuery(create_query);
              break;
            }
          }
        }
      }
    }
  }, [selectNewNode]);

  /**
   * deselect a node in the graph
   */
  useEffect(() => {
    if (selectNewNode) {
      if (newCluster.length > 0 && !showLocalView) {
        var localcopy = [...neo4jJson];
        cy.edges().forEach(edge => {
          if (edge.target().id() === deselectNewNode[0].id || edge.source().id() === deselectNewNode[0].id) {
            var delete_edge = true;
            if (delete_edge) {

              localcopy = localcopy.filter((element) => element.id !== edge.id());
              edge.remove();
            }

          }

        });
        setNeo4jJson(localcopy);
      }

    }
  }, [deselectNewNode]);


  /**
   * INITIALIZE THE GRAPH
   */
  useEffect(() => {
    const getSeed = location.state.arr;
    const clearSelectedElementInfo = (event) => {
      const target = event.target;
      if (target === cy) {
        setSelectedElementInfo([]); // Clear the info when background is clicked
      }
    };

    const cy = cytoscape({
      container: containerRef.current,
      //layout: { name: "cose" },
      style: [
        {
          selector: 'node',
          style: {
            label: "data(name)",
            'border-width': '4px', // Set the border width to 2 pixels
            'border-color': 'gray',
            'background-image': './unknown.png',
            'background-fit': 'cover',
          },
        },
        {
          selector: 'node[label="Protein"]',
          style: {
            label: "data(name)",
            'border-width': '4px', // Set the border width to 2 pixels
            'border-color': 'gray',
            'background-image': './protein.png',
            'background-fit': 'cover',
          },
        },
        {
          selector: 'node[label="Protein"][project_id_0=0][project_id!=1]',
          style: {
            label: "data(name)",
            'border-width': '4px', // Set the border width to 2 pixels
            'border-color': 'gray',
            'background-image': './protein-highlight.png',
            'background-fit': 'cover',
          },
        },

        {
          selector: 'node[label="Cell_Line"]',
          style: {
            label: "data(name)",
            'border-width': '4px', // Set the border width to 2 pixels
            'border-color': 'gray',
            'background-image': './cellline.png',
            'background-fit': 'cover',
            'shape': 'hexagon',
          },
        },
        {
          selector: 'node[label="Drug"]',
          style: {
            label: "data(name)",
            'border-width': '4px', // Set the border width to 2 pixels
            'border-color': 'gray',
            'background-image': './drug.png',
            'background-fit': 'cover',
            'shape': 'rectangle',
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


    cy.on('boxselect', 'node', (event) => {
      const node = event.target;
      const nodeData = {
        id: node.id(),
        name: node.data('name'),
        label: node.data('label'),
        uid: node.data('uid'),
        biogrid: node.data('project_id_0'),
        pancan: node.data('project_id'),
      };
      var updatedSelectedNodes = [];
      cy.nodes().forEach(node2 => {
        const borderColor = node2.style('border-color');
        if (borderColor === 'rgb(255,255,0)') {
          updatedSelectedNodes.push({
            id: node2.id(),
            uid: node2.data('uid'),
            name: node2.data('name'),
            label: node2.data('label'),
            biogrid: node2.data('project_id_0'),
            pancan: node2.data('project_id'),
          })
        }

      });

      const existingNodeIndex = updatedSelectedNodes.findIndex((selectedNode) => selectedNode.id === nodeData.id);

      if (existingNodeIndex === -1)  {
        updatedSelectedNodes.push(nodeData); // Add the new node
        node.style({
          'border-color': 'yellow',
        });
        setSelectNewNode(nodeData);
      }
      setSelectedNodesState(updatedSelectedNodes);
    });

    cy.on('dblclick', 'node', (event) => {
      const node = event.target;
      const nodeData = {
        id: node.id(),
        name: node.data('name'),
        label: node.data('label'),
        uid: node.data('uid'),
        biogrid: node.data('project_id_0'),
        pancan: node.data('project_id'),
      };
      var updatedSelectedNodes = [];
      cy.nodes().forEach(node2 => {
        const borderColor = node2.style('border-color');
        if (borderColor === 'rgb(255,255,0)') {
          updatedSelectedNodes.push({
            id: node2.id(),
            uid: node2.data('uid'),
            name: node2.data('name'),
            label: node2.data('label'),
            biogrid: node2.data('project_id_0'),
            pancan: node2.data('project_id'),
          })
        }

      });

      const existingNodeIndex = updatedSelectedNodes.findIndex((selectedNode) => selectedNode.id === nodeData.id);

      if (existingNodeIndex !== -1) {
        updatedSelectedNodes.splice(existingNodeIndex, 1); // Remove the existing node
        node.style({
          'border-color': 'gray',
        });
        setDeselectNewNode([nodeData, updatedSelectedNodes]);
      } else {
        updatedSelectedNodes.push(nodeData); // Add the new node
        node.style({
          'border-color': 'yellow',
        });
        setSelectNewNode(nodeData);
      }
      setSelectedNodesState(updatedSelectedNodes);
    });
    cy.on('tap', 'node', (event) => {
      const node = event.target;
      const nodeData = node.data();
      const dataEntries = Object.entries(nodeData);
      const dataS = dataEntries.map(([name, value]) => ({
        Name: name,
        Value: String(value),
      }));
      //var targets = ['ENTREZGENE_ACC', 'GENECARDS', 'ENSG', 'UNIPROTSWISSPROT_ACC'];
      //var targetsName = ['Entrez', 'Symbol', 'Ensembl', 'UniProtKB'];
      //var targetsLinks = ['https://www.ncbi.nlm.nih.gov/gene/', 'https://www.genecards.org/cgi-bin/carddisp.pl?gene=', 'https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=', 'https://www.uniprot.org/uniprotkb/'];


      var targets = ['GENECARDS','UNIPROTSWISSPROT_ACC'];
      var targetsName = ['Symbol', 'UniProtKB'];
      var targetsLinks = ['https://www.genecards.org/cgi-bin/carddisp.pl?gene=', 'https://www.uniprot.org/uniprotkb/'];
      var is_protein = false;
      var is_name = "";

      for (const element of dataS) {
        if (element.Name === "label" && element.Value === "Protein") {
          is_protein = true;
        }
        if (element.Name === "name") {
          is_name = element.Value;
        }
      }

      if (is_protein) {
        const axiosRequests = targets.map(targetGen => {
          const data = {
            organism: 'hsapiens',
            target: targetGen,
            query: [is_name]
          };

          return axios.post('https://biit.cs.ut.ee/gprofiler/api/convert/convert/', data, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
        });

        Promise.all(axiosRequests)
          .then(responses => {
            responses.forEach((response, index) => {
              const result = response.data.result[0].converted;
              if (result !== 'none') {
                dataS.push({ "Name": targetsName[index], "Value": "", "Link": targetsLinks[index] + result, "LinkText": result });
              }
            });
            setSelectedElementInfo(dataS);
          })
          .catch(error => {
            console.error('Error:', error);
          });
      } else {
        setSelectedElementInfo(dataS);
      }

    });

    cy.on('tap', 'edge', (event) => {
      const edge = event.target;
      const edgeId = edge.id();
      const edgeData = edge.data();
      const dataEntries = Object.entries(edgeData);
      const dataS = dataEntries.map(([name, value]) => ({
        Name: name,
        Value: String(value),
      }));
      setSelectedElementInfo(dataS);
    });
    cy.on('tap', clearSelectedElementInfo);
    var contextMenu = cy.contextMenus(optionsLocal);
    //create initial graph
    const drawGraph = async () => {

      await initialGetAllNodeAndEdgeTypes();

      //setShownNodesAndAssociationUI();
      // Fetch and add graph data
      const allData = await getAllNodeData(getSeed);
      //save all node data
      setNeo4jJson(allData[3]);
      setAllDrug(allData[0]);
      setAllProtein(allData[1]);
      setAllCell_Line(allData[2]);
      if (getSeed.length > 0) {
        const data3 = addSmallProperty(allData[3], true);
        const data2 = await convertJson(data3, true);
        cy.add(data2);
      }
      if (cy._private.renderer) {
        cy.layout({ name: selectedLayout }).run();
      }
    };
    cy.ready(() => {
      drawGraph();
    });
    setCy(cy);
  }, [location.state.arr]);

  useEffect(() => {

  }, [setCy, selectedNodesState]);

  /**
   * when neo4json is changes update what node should be shown or not
   */
  useEffect(() => {
    if (neo4jJson !== null) {
      //analyseData(neo4jJson);
      setShownNodesAndAssociationUI();
    }
  }, [neo4jJson, showLocalView]);


  /**
   * UPDATE based on Node, Edge or Advanced Filter Settings
   */
  /**useEffect(() => {
    if (cy !== null) {
      console.log("1660 1");
      var new_max_phase = 0
      if (showLegend && showLegend[0].att === "indicator") {
        new_max_phase = 0;
        if (showLegend[0].limit === 67) {
          new_max_phase = 1;
        }
        if (showLegend[0].limit === 33) {
          new_max_phase = 2;
        }
        if (showLegend[0].limit === 0) {
          new_max_phase = 3;
        }
      }
      console.log("1660 2");
      cy.nodes().forEach(node => {
        console.log("1660 3");
        const nodeType = node.data('label');
        const foundObject = filterSettingsNodes.find(item => item.name === nodeType);
        var valuesIsFine = true;

        if (showLegend !== null && showLegend.length > 1) {
          if (showLegend[0].att != "indicator") {
            if (node.data(showLegend[0].att) !== undefined && node.data(showLegend[0].att != null)) {
              if (showLegend[showLegend.findIndex((element) => element.value === node.data(showLegend[0].att))].show) {
                valuesIsFine = true;
              } else {
                valuesIsFine = false;
              }

            } else {
              if (showLegend[0].show) {
                valuesIsFine = true;
              } else {
                valuesIsFine = false;
              }
            }
          } else {
            if (node.data(showLegend[0].att) !== undefined && node.data(showLegend[0].att != null)) {
              console.log("719 problem2");
              const arr_max_phase = JSON.parse(node.data(showLegend[0].att));
              node.style('background-image', './transparent_drug.png');
              node.style('background-fit', 'cover');
              if (arr_max_phase[new_max_phase].length > 0) {
                node.style('background-color', '#ffb703');
                if (showLegend[1].show) {
                  valuesIsFine = true;
                } else {
                  valuesIsFine = false;
                }
              } else {
                node.style('background-color', '#219ebc');
                if (showLegend[0].show) {
                  valuesIsFine = true;
                } else {
                  valuesIsFine = false;
                }
              }
              for (var m = 2; m < showLegend.length; m++) {
                if (!showLegend[m].show) {
                  if (arr_max_phase[new_max_phase].includes(showLegend[m].value)) {
                    node.style('background-color', '#fb8500');
                    break;
                  }
                }
              }
            } else {
              if (showLegend[0].show) {
                valuesIsFine = true;
              } else {
                valuesIsFine = false;
              }
            }
          }
        }


        if (filterSettingsAttributes.findIndex((element) => element.type === nodeType) > -1) {

          const filterValues = filterSettingsAttributes[filterSettingsAttributes.findIndex((element) => element.type === nodeType)];
          for (let i = 0; i < filterValues.attributes.length; i++) {
            const filterValue = filterValues.attributes[i];
            const getNodeValue = node.data(filterValue.name);
            if (filterValue.type === 'num') {
              if (getNodeValue < filterValue.list[0] || getNodeValue > filterValue.list[1]) {
                valuesIsFine = false;
              }
            } else {
              if (filterValue.list.length > 0) {
                if (!filterValue.list.includes(getNodeValue)) {
                  valuesIsFine = false;
                }

              }
            }
          }
        }
        if (foundObject.show && valuesIsFine) {
          // Hide the node
          node.show();
        } else {
          // Show the node
          node.hide();
        }
      });
      cy.edges().forEach(edge => {
        const edgeType = edge.data('label');
        var foundObject = { show: true };
        if (!showLocalView && edgeType === activeClusterConnections) {
          foundObject = { show: true };
        } else {
          foundObject = filterSettingsEdges.find(item => item.name === edgeType);
        }
        var valuesIsFine = true;
        if (filterSettingsAttributes.findIndex((element) => element.type === edgeType) > -1) {
          const filterValues = filterSettingsAttributes[filterSettingsAttributes.findIndex((element) => element.type === edgeType)];
          for (let i = 0; i < filterValues.attributes.length; i++) {
            const filterValue = filterValues.attributes[i];
            const getNodeValue = edge.data(filterValue.name);
            if (filterValue.type === 'num') {
              if (getNodeValue < filterValue.list[0] || getNodeValue > filterValue.list[1]) {
                valuesIsFine = false;
              }
            } else {
              if (filterValue.list.length > 0) {
                if (!filterValue.list.includes(getNodeValue)) {
                  valuesIsFine = false;
                }

              }
            }
          }
        }
        if (foundObject.show && valuesIsFine) {
          // Show the edge
          edge.show();
        } else {
          // Hide the edge
          edge.hide();
        }
      });

      if (cy._private.renderer && showLocalView) {
        cy.layout({ name: selectedLayout }).run();
      }
      setCy(cy);
    }
  }, [filterSettingsNodes, filterSettingsEdges, filterSettingsAttributes, updateGraph, visibleModal]);//showlegend**/




  useEffect(() => {
    if (cy !== null) {
      var new_max_phase = 0
      if (showLegend && showLegend[0].att === "indicator") {
        cy.style().clear();

        // Define new styles
        cy.style()
        .selector('node')
        .style({
          label: 'data(name)',
          'border-width': '4px',
          'border-color': 'gray',
        })
        .selector('node[label="Protein"][project_id_0=0]')
        .style({
          label: 'data(name)',
          'border-width': '4px',
          'border-color': 'gray',
        })
        .selector('node[label="Protein"][project_id=1]')
        .style({
          label: 'data(name)',
          'border-width': '4px',
          'border-color': 'gray',
        })
        .selector('node[label="Cell_Line"]')
        .style({
          label: 'data(name)',
          'border-width': '4px',
          'border-color': 'gray',
          shape: 'hexagon',
        })
        .selector('node[label="Drug"]')
        .style({
          label: 'data(name)',
          'border-width': '4px',
          'border-color': 'gray',
          shape: 'rectangle',
        }).selector("edge")
        .style({
          "curve-style": "bezier",
          width: 4
        });
        cy.style().selector('node')
        .style({
          'background-image': './unknown.png',
          'background-fit': 'cover',
        })
        .selector('node[label="Protein"]')
        .style({
          'background-image': './transparent_protein.png',
          'background-fit': 'cover',
        })
        .selector('node[label="Cell_Line"]')
        .style({
          'background-image': './cellline.png',
          'background-fit': 'cover',
        })
        .selector('node[label="Drug"]')
        .style({
          'background-image': './transparent_drug.png',
          'background-fit': 'cover',
        }).selector('node')
            .style({
                label: 'data(name)',
                'border-width': '4px',
                'border-color': 'gray',
                'background-color': '#219ebc',
            })
            .selector('node[indie="yellow"]')
            .style({
                label: 'data(name)',
                'border-width': '4px',
                'border-color': 'gray',
                'background-color': '#ffb703',
            })
            
            .selector('node[indie="orange"]')
            .style({
                label: 'data(name)',
                'border-width': '4px',
                'border-color': 'gray',
                'background-color': '#fb8500',
            }).selector("edge")
            .style({
              "curve-style": "bezier",
              width: 4
            });
        new_max_phase = 0;
        if (showLegend[0].limit === 67) {
          new_max_phase = 1;
        }
        if (showLegend[0].limit === 33) {
          new_max_phase = 2;
        }
        if (showLegend[0].limit === 0) {
          new_max_phase = 3;
        }
      }

      cy.nodes().forEach(node => {
        const nodeType = node.data('label');
        const foundObject = filterSettingsNodes.find(item => item.name === nodeType);
        var valuesIsFine = true;

        if (showLegend !== null && showLegend.length > 1) {
          if (showLegend[0].att != "indicator") {
            if (node.data(showLegend[0].att) !== undefined && node.data(showLegend[0].att != null)) {
              if (showLegend[showLegend.findIndex((element) => element.value === node.data(showLegend[0].att))].show) {
                valuesIsFine = true;
              } else {
                valuesIsFine = false;
              }

            } else {
              if (showLegend[0].show) {
                valuesIsFine = true;
              } else {
                valuesIsFine = false;
              }
            }
          } else {
            if (node.data(showLegend[0].att) !== undefined && node.data(showLegend[0].att != null)) {
              const arr_max_phase = JSON.parse(node.data(showLegend[0].att));
              //node.style('background-image', './transparent_drug.png');
              //node.style('background-fit', 'cover');
              if (arr_max_phase[new_max_phase].length > 0) {
                //node.style('background-color', '#ffb703');
                node.data('indie', 'yellow');
                if (showLegend[1].show) {
                  valuesIsFine = true;
                } else {
                  valuesIsFine = false;
                }
              } else {
                //node.style('background-color', '#219ebc');
                node.data('indie', 'blue');
                if (showLegend[0].show) {
                  valuesIsFine = true;
                } else {
                  valuesIsFine = false;
                }
              }
              for (var m = 2; m < showLegend.length; m++) {
                if (!showLegend[m].show) {
                  if (arr_max_phase[new_max_phase].includes(showLegend[m].value)) {
                    node.data('indie', 'orange');
                    //node.style('background-color', '#fb8500');
                    break;
                  }
                }
              }
            } else {
              if (showLegend[0].show) {
                valuesIsFine = true;
              } else {
                valuesIsFine = false;
              }
            }
          }
        }


        if (filterSettingsAttributes.findIndex((element) => element.type === nodeType) > -1) {

          const filterValues = filterSettingsAttributes[filterSettingsAttributes.findIndex((element) => element.type === nodeType)];
          for (let i = 0; i < filterValues.attributes.length; i++) {
            const filterValue = filterValues.attributes[i];
            const getNodeValue = node.data(filterValue.name);
            if (filterValue.type === 'num') {
              if (getNodeValue < filterValue.list[0] || getNodeValue > filterValue.list[1]) {
                valuesIsFine = false;
              }
            } else {
              if (filterValue.list.length > 0) {
                if (!filterValue.list.includes(getNodeValue)) {
                  valuesIsFine = false;
                }

              }
            }
          }
        }
        if (foundObject.show && valuesIsFine) {
          // Hide the node
          node.show();
        } else {
          // Show the node
          node.hide();
        }
      });
      cy.edges().forEach(edge => {
        const edgeType = edge.data('label');
        var foundObject = { show: true };
        if (!showLocalView && edgeType === activeClusterConnections) {
          foundObject = { show: true };
        } else {
          foundObject = filterSettingsEdges.find(item => item.name === edgeType);
        }
        var valuesIsFine = true;
        if (filterSettingsAttributes.findIndex((element) => element.type === edgeType) > -1) {
          const filterValues = filterSettingsAttributes[filterSettingsAttributes.findIndex((element) => element.type === edgeType)];
          for (let i = 0; i < filterValues.attributes.length; i++) {
            const filterValue = filterValues.attributes[i];
            const getNodeValue = edge.data(filterValue.name);
            if (filterValue.type === 'num') {
              if (getNodeValue < filterValue.list[0] || getNodeValue > filterValue.list[1]) {
                valuesIsFine = false;
              }
            } else {
              if (filterValue.list.length > 0) {
                if (!filterValue.list.includes(getNodeValue)) {
                  valuesIsFine = false;
                }

              }
            }
          }
        }
        if (foundObject.show && valuesIsFine) {
          // Show the edge
          edge.show();
        } else {
          // Hide the edge
          edge.hide();
        }
      });
    }
  }, [filterSettingsNodes, filterSettingsEdges, filterSettingsAttributes, updateGraph, visibleModal, showLegend]);
  /**
   * Run Neo4j Query and add data
   */
  useEffect(() => {
    if (cy !== null) {
      const newGraph = async () => {
        const driver = neo4j.driver("neo4j://localhost:7687", neo4j.auth.basic("neo4j", "workwork"));
        const session = driver.session();
        var run_query;
        var has_score = false;
        if (Array.isArray(newQuery)) {
          run_query = newQuery[0];
          has_score = true;
        } else {
          run_query = newQuery;
        }
        const result = await session.run(run_query);
        session.close();
        driver.close();
        var jsonData = "";
        for (let i = 0; i < result.records.length; i++) {
          if (i > 0) {
            jsonData = jsonData + "\n";
          }
          jsonData = jsonData + result.records[i].get("data");

        }
        var all_data;
        if (jsonData !== "") {
          const jsonArray = jsonData.split('\n').map(JSON.parse);
          if (showLocalView) {
            const jsonArray2 = addSmallProperty(jsonArray, true);
          }
          all_data = [...neo4jJson, ...jsonArray].reduce((acc, item) => {
            if (!acc.idMap.has(item.id)) {
              acc.idMap.set(item.id, true);
              acc.result.push(item);
            }
            return acc;
          }, { idMap: new Map(), result: [] }).result;
        } else {
          all_data = [...neo4jJson];
        }
        setNeo4jJson(all_data);
        const data2 = await convertJson(all_data, true);

        cy.add(data2);
        if (cy._private.renderer && showLocalView) {
          cy.layout({ name: selectedLayout }).run();
        } else if (cy._private.renderer && !showLocalView) {
          var clusterLabel = [];
          if (newCluster.length > 0) {
            for (const newC2 of newCluster) {
              for (let i = 0; i < newC2.entities.length; i++) {
                clusterLabel.push(newC2.entities[i]);
              }
            }
            var otherproteins = 0;
            var otherproteins = 0;
            var upScaleFactor = 50;//50;//100;
            var maxSizeOfCluster = 30;
            cy.nodes().forEach((node) => {
              if (!clusterLabel.includes(node.data('label'))) {
                otherproteins = otherproteins + 1;
                node.position({
                  x: -(upScaleFactor * maxSizeOfCluster),
                  y: otherproteins * upScaleFactor
                });
              }
            });
          }
        }
        const nodes = cy.nodes();
        nodes.forEach(node => {
          const uidValue = node.data('uid');
          if (has_score) {
            if (newQuery[1].includes(uidValue)) {
              node.data('highlight', 'true');
              const foundScore = newQuery[2].find(subArray => subArray[0] === uidValue);
              node.data('score', foundScore[1]);
            } else {
              node.data('highlight', 'false');
              node.removeData('score');
            }
          }
        });
      };
      if (newQuery) {
        cy.ready(() => {
          newGraph();
        });
      }


      setCy(cy);
      setUpdateGraph(!updateGraph);
    }
  }, [newQuery]);

  /**
   * Is used to add or remove shown clusters
   */
  useEffect(() => {
    if (cy !== null) {
      const newGraph = async () => {

        //delete all nodes and edges
        cy.nodes().remove();
        cy.edges().remove();

        //all existing data points
        const all_existing_data = [...neo4jJson];
        var smallTrueData = [];
        //remove not pinned nodes

        for (let i = 0; i < all_existing_data.length; i++) {
          if (all_existing_data[i].properties.small) {
            smallTrueData.push(all_existing_data[i])
          }
        }
        const seedData = await convertJson(smallTrueData, true);
        cy.add(seedData);
        var getNecessaryData = [false, false, false];
        var intern_name = ""
        for (const newC2 of newCluster) {
          for (let i = 0; i < newC2.entitie_arr.length; i++) {
            if (newC2.entitie_arr[i]) {
              getNecessaryData[i] = true;
              intern_name = newC2.name_intern;
            }
          }
        }
        //add cluster data that doesnt include seedData
        const g_result = getAllClusterData(getNecessaryData, intern_name, smallTrueData);
        const clusterJson = g_result.getAllNecessaryClusterData;
        const min_x = g_result.min_x;
        const min_y = g_result.min_y;
        const clusterData = await convertJson(clusterJson, false);
        cy.add(clusterData);

        const all_data = [...smallTrueData, ...clusterJson].reduce((acc, item) => {
          if (!acc.idMap.has(item.id)) {
            acc.idMap.set(item.id, true);
            acc.result.push(item);
          }
          return acc;
        }, { idMap: new Map(), result: [] }).result;
        setNeo4jJson(all_data);

        const drugsPerRow = 20;
        var otherdrugs = 0;
        var otherproteins = 0;
        var othercelllines = 0;
        var other = 0;
        var upScaleFactor = 50;//50;//100;
        if (intern_name === "drug_drug_GDSC1_cosine_isomap_global" || intern_name === "drug_drug_GDSC2_cosine_isomap_global") {
          upScaleFactor = upScaleFactor + 30;
        }
        if (intern_name === "drug_protein_GDSC1_isomap_local" || intern_name === "drug_protein_GDSC2_isomap_local" || intern_name === 'drug_protein_GDSC1_umap_global' || intern_name === 'drug_protein_GDSC2_umap_global' || intern_name === 'drug_protein_GDSC1_umap_local' || intern_name === 'drug_protein_GDSC2_umap_local') {
          upScaleFactor = upScaleFactor + 50;
        }
        if (intern_name === "drug_protein_GDSC1_isomap_global" || intern_name === "drug_protein_GDSC2_isomap_global") {
          upScaleFactor = upScaleFactor + 50;
        }
        if (intern_name === "drug_drug_GDSC1_cosine_umap" || intern_name === "drug_drug_GDSC2_cosine_umap") {
          upScaleFactor = upScaleFactor + 30;
        }

        var maxSizeOfCluster = 50;

        cy.nodes().forEach((node) => {
          var newX = 0;
          var newY = 0;

          for (const newC of newCluster) {
            if (newC.name_intern in node.data()) {
              const newCX = newC.name_intern + "_x";
              const newCY = newC.name_intern + "_y";
              var new_extra_x = 0;
              var new_extra_y = 0;
              if (newC.name_intern === "drug_protein_GDSC1_louvain_global") {
                new_extra_x = (node.data(newC.name_intern) % 5) * 10;
                new_extra_y = Math.floor(node.data(newC.name_intern) / 5) * 10;
              }
              if (newC.name_intern === "drug_protein_GDSC1_louvain_local") {
                new_extra_x = (node.data(newC.name_intern) % 4) * 20;
                new_extra_y = Math.floor(node.data(newC.name_intern) / 4) * 20;
              }
              if (newC.name_intern === "drug_protein_GDSC2_louvain_global") {
                new_extra_x = (node.data(newC.name_intern) % 4) * 14;
                new_extra_y = Math.floor(node.data(newC.name_intern) / 4) * 14;
              }
              if (newC.name_intern === "drug_protein_GDSC2_louvain_local") {
                new_extra_x = (node.data(newC.name_intern) % 4) * 20;
                new_extra_y = Math.floor(node.data(newC.name_intern) / 4) * 20;
              }
              newX = node.data(newCX) - min_x + 5 + new_extra_x;
              newY = node.data(newCY) - min_y + 5 + new_extra_y;
              break;
            }
          }
          if (newX === 0 && newY === 0) {
            if (node.data('label') === 'Drug') {
              node.position({
                x: ((otherdrugs % drugsPerRow) * upScaleFactor * 2) + 200,
                y: 0 - (Math.floor(otherdrugs / drugsPerRow) * upScaleFactor * 2)
              });
              otherdrugs = otherdrugs + 1;
            } else if (node.data('label') === 'Protein') {

              node.position({
                x: 0 - (Math.floor(otherproteins / drugsPerRow) * upScaleFactor * 2),
                y: ((otherproteins % drugsPerRow) * upScaleFactor * 2) + 200
              });
              otherproteins = otherproteins + 1;
            } else if (node.data('label') === 'Cell_Line') {
              node.position({
                x: (Math.floor(othercelllines / drugsPerRow) * upScaleFactor * 2) + 200 + (+1000 + (drugsPerRow * upScaleFactor * 2)),
                y: 0 - ((othercelllines % drugsPerRow) * upScaleFactor * 2)
              });
              othercelllines = othercelllines + 1;
            } else {
              node.position({
                x: 0 - (Math.floor(other / drugsPerRow) * upScaleFactor * 2),
                y: ((other % drugsPerRow) * upScaleFactor * 2) + 200 + (+1000 + (drugsPerRow * upScaleFactor * 2))
              });
              other = other + 1;
            }

          } else {
            node.position({
              x: newX * upScaleFactor,
              y: newY * upScaleFactor
            });
          }

          if (node.data('small')) {
            node.style({
              'border-width': '4px', // Set the border width to 2 pixels
              'border-color': 'red',
              'width': '40px',          // Double the width (adjust the size as needed)
              'height': '40px',         // Double the height (adjust the size as needed)
            });
          }
        });
        cy.edges().forEach((edge) => {
          edge.style({
            "curve-style": "bezier",
            'line-color': 'red', // Set the edge color to red
            width: 4,     // Set the edge width to 4 pixels (adjust as needed)
          });
        });
        setc_other(other);
        setc_othercelllines(othercelllines);
        setc_otherdrugs(otherdrugs);
        setc_otherproteins(otherproteins);

      };
      cy.ready(() => {
        newGraph();
      });

      setCy(cy);
      //setUpdateGraph(!updateGraph);
    }
  }, [newCluster]);

  /**
   * SWITCH BACK TO LOCAL VIEW
   */
  useEffect(() => {
    if (cy !== null) {
      const newGraph = async () => {
        //delete all nodes and edges
        var delete_id = [];
        cy.nodes().forEach((node) => {
          if (!node.data('small')) {
            delete_id.push(node.id());
            const target_id = cy.$(`#${node.id()}`);
            cy.remove(target_id);
          } else {
            node.style({
              'border-width': '4px', // Set the border width to 2 pixels
              'border-color': 'grey',
              'width': '20px', 
              'height': '20px',
            });
          }

        });
        cy.edges().forEach((edge) => {
          if (!edge.data('small')) {
            delete_id.push(edge.id());
            const target_id = cy.$(`#${edge.id()}`);
            cy.remove(target_id);
          } else {
            edge.style({
              "curve-style": "bezier",
              'line-color': 'grey', // Set the edge color to red
              'width': '1px', 
            });
          }
        });
        //add Seed data
        if (cy._private.renderer) {
          cy.layout({ name: selectedLayout }).run();
        }
      };
      cy.ready(() => {
        newGraph();
      });

      setCy(cy);
      setUpdateGraph(!updateGraph);
    }
  }, [showLocalView]);




  return (
    <Layout className="layout">
      <NavigationBar getUid={handleUid} isGraph={true} />
      <Content
        style={{
          marginTop: '30px',
        }}
      >
        <div>
          <Menu mode="horizontal">
            {item.map((menuItem) => (
              <React.Fragment key={menuItem.key}>
                {menuItem.children ? (
                  <Menu.SubMenu title={menuItem.label} key={menuItem.key}>
                    {menuItem.children.map((child) => (
                      <React.Fragment key={child.key}>
                        {child.type === "group" ? (
                          <Menu.SubMenu title={handleBetterText(child.label)} key={child.key}>
                            {child.children.map((groupChild) => (
                              <>
                                {groupChild.checked !== undefined ? (
                                  <Menu.Item key={groupChild.key}>
                                    <Checkbox
                                      checked={groupChild.checked}
                                      onChange={() =>
                                        handleCheckboxChange(child.key, child.label, groupChild.key, groupChild.label)
                                      }
                                    >
                                      {handleBetterText(groupChild.label)}
                                    </Checkbox></Menu.Item>
                                ) : (
                                  <Menu.Item key={groupChild.key} onClick={() => handleColorCodingChange(groupChild.label, child.label)}>
                                    <span >
                                      {groupChild.label}
                                    </span>
                                  </Menu.Item>
                                )}
                              </>
                            ))}
                          </Menu.SubMenu>
                        ) : (
                          <>
                            {child.checked !== undefined ? (
                              <Menu.Item key={child.key}>
                                <Checkbox
                                  checked={child.checked}
                                  onChange={() =>
                                    handleCheckboxChange(menuItem.key, menuItem.label, child.key, child.label)
                                  }
                                >
                                  {handleBetterText(child.label)}
                                </Checkbox>
                              </Menu.Item>
                            ) : (
                              <Menu.Item key={child.key} onClick={() => handleColorCodingChange(child.label, menuItem.label)}>
                                <span >
                                  {child.label}
                                </span>
                              </Menu.Item>
                            )}
                          </>
                        )}
                      </React.Fragment>
                    ))}
                  </Menu.SubMenu>
                ) : (
                  <Menu.Item key={menuItem.key}>
                    <span onClick={() => handleColorCodingChange(menuItem.key)}>
                      {menuItem.label}
                    </span>
                  </Menu.Item>
                )}
              </React.Fragment>
            ))}

            {/*
            <Menu.Item key="reset2" style={{ float: 'right' }}>
              <Switch
                style={{ backgroundColor: 'blue' }}
                checkedChildren="Local View"
                unCheckedChildren="Global View"
                onChange={handleGraphViewSwitchChange}
              />
            </Menu.Item>
            */}
            <SubMenu title="Export Data" icon={<DownloadOutlined />}>
              <Menu.Item key="json" icon={<FileExcelOutlined />} onClick={() => handleExportData('json')}>
                Export as JSON
              </Menu.Item>
              <Menu.Item key="graphml" icon={<FileExcelOutlined />} onClick={() => handleExportData('graphml')}>
                Export as GraphML
              </Menu.Item>
            </SubMenu>
            <SubMenu title="Save Picture" icon={<PictureOutlined />}>
              <Menu.Item key="png" icon={<FileImageOutlined />} onClick={() => handleExportData('png')}>
                Save as PNG
              </Menu.Item>
              <Menu.Item key="jpg" icon={<FileImageOutlined />} onClick={() => handleExportData('jpg')}>
                Save as JPG
              </Menu.Item>
              <Menu.Item key="svg" icon={<FileImageOutlined />} onClick={() => handleExportData('svg')}>
                Save as SVG
              </Menu.Item>
            </SubMenu>
            <SubMenu title="Change Layout" icon={<LayoutOutlined />}>
              {showLocalView ? (
                <>
                {layoutNames.map((layout) => (
                  <Menu.Item key={layout} onClick={() => handleLayoutChange(layout)}>
                  {layout}
                </Menu.Item>
                
                ))}
                <Menu.Item key={2212323322}>
                    <Checkbox
                      checked={showLabels}
                      onChange={() => handleCheckboxChange("dvalues", "Other Settings", "5001", "Show Node Names")}
                    >
                      Show Node Names
                    </Checkbox>
                </Menu.Item></>
              ) : (
                <Menu.Item key={100100101}>
                  <Tooltip title="Remove Grouping to get more layout options">
                    <p style={{ fontSize: '14px' }}>no options</p>
                  </Tooltip>
                </Menu.Item>
              )}
            </SubMenu>
            <Menu.Item key="re-render">
              <span onClick={handleReRender}>Rerender</span>
            </Menu.Item>
            <Menu.Item key="reset">
              <span onClick={handleReset}>Reset</span>
            </Menu.Item>
          </Menu>
        </div>
        {activeTab === '1' && (
        <Legend showLegend={showLegend} setShowLegend={handleShowLegend} />
      )}
        <CustomModalContent
          title={titleModal}
          selectedData={selectedData}
          visible={visibleModal}
          onCancel={() => setVisibleModal(false)}
          onSliderChange={handleSliderChange}
        />
        <div style={{ display: 'flex' }}>
          {showAnalysisTools ? (
            <div style={{ flex: 1 }}>
              <div style={{ width: "430px" }}>
                <Tooltip title="Minimize information and analysis tools">
                  <Button style={{ left: "400px", width: "20px", transition: "none", backgroundColor: "transparent", borderColor: "transparent" }} onClick={handleShowAnalysisTools}>
                    X
                  </Button></Tooltip>
              </div>
              <SelectMenu selectedNodes={selectedNodesState} cy={cy} setCy={handleCyChange} setSelectedNodes={handleSelectedNodes} nodeTypes={filterSettingsNodes} selectedElementInfo={selectedElementInfo} setQuery={handleNewQuery} setNewFilter={handleNewFilter} setAllInfo={graphInformation} applyCluster={handleClusterChange} applyRemoveCluster={handleSwitchToLocal} allInformation={allInformation} getUid={handleUid} />
            </div>
          ) : (
            <Tooltip title="Show information and analysis tools" placement="right">
              <Button icon={<ExperimentOutlined style={{ color: 'white' }} />} style={{ position: "absolute", left: "-4px", top: "200px", width: "30px", backgroundColor: "blue", zIndex: "9999" }} onClick={handleShowAnalysisTools} />

            </Tooltip>
          )

          }

          <Tabs style={{ flex: 3, width: '100%', height: '80vh' }} defaultActiveKey="1"
          onChange={handleTabChange}
          >
          
            <TabPane tab="Graph" key="1">

              <div ref={containerRef} style={{ flex: 3, width: '100%', height: '80vh' }}></div>
            </TabPane>
            <TabPane tab="Table" key="2">
              <div style={{ flex: 3, width: '100%', height: '80vh' }}>
                <GraphTable cy={cy} updateGraph={updateGraph} setSelectedElementInfo={handlesetSelectedElementInfo} selectedNodes={selectedNodesState}  allInformation={allInformation} />
              </div>
            </TabPane>

          </Tabs>
        </div>
      </Content>
    </Layout>
  );
};

export default CreateGraph;
