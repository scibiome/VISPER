
import React, { useRef, useEffect, useState } from 'react';
import { Table, Button, Dropdown, Menu, Collapse, Modal, Select, Row, Col, Slider, InputNumber, Tooltip, Tag, Anchor, MenuProps, Layout } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import NavigationBar from "../NavigationBar/NavigationBar";
import Biomarker from "../Overview/biomarkers";
import Plot from 'react-plotly.js';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import axios from "axios";
const { Link } = Anchor;
const { Header, Content, Footer } = Layout;


/**
 * Create ProCan plots website
 * @returns 
 */
const Scatterplot = () => {
  const history = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupName, setGroupName] = useState(null);
  const [groupUIDs, setGroupUIDs] = useState(null);
  const [elementName, setElementName] = useState(null);
  const [elementUID, setElementUID] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const items = [
    {
      key: 'Introduction',
      title: 'Introduction',
    },
    {
      key: 'View Network Graph',
      title: 'View Network Graph',
    },
    {
      key: 'Cell Lines',
      title: 'Cell Lines',
    },
    {
      key: 'Drugs',
      title: 'Drugs',
    },
    {
      key: 'Number of cell type-enriched proteins',
      title: 'Cell type-enriched proteins',
    },
    {
      key: 'Biomarkers',
      title: 'Biomarkerss',
    },

  ];

  const [selectedElements, setSelectedElements] = useState([]);
  const [collapsed, setCollapsed] = useState(true);

  /**
   * Switch with selected nodes to the graph
   */
  const goToGraph = () => {
    var uids_list = []
    console.log(selectedElements);
    console.log('Button clicked, navigating to the graph.');
    for (const se of selectedElements) {
      if (typeof se[1] === 'string') {
        uids_list.push(se[1]);
      } else if (Array.isArray(se[1])) {
        uids_list.push(...se[1]);
      }
    }
    console.log(uids_list);
    const arr = [...new Set(uids_list)];
    console.log("uniqueUids", JSON.stringify(arr));
    if (arr.length > 0) {
      history('/Graph', { state: { arr } });
    }
  };
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  const handleMenuClick = (key) => {
    const el = document.getElementById(key);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setCollapsed(true);
  };

  /**
   * Delete items from selected list
   * @param {*} deletedElement 
   */
  const handleDelete = (deletedElement) => {
    if (!isDeleting) {
      setIsDeleting(true);
      setTimeout(() => {
        const updatedList = selectedElements.filter((el) => el !== deletedElement);
        setSelectedElements(updatedList);
        setIsDeleting(false);
      }, 10000);
    }
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleAddElement = () => {
    const selectedElements2 = [...selectedElements];
    selectedElements2.push([elementName, elementUID]);
    setSelectedElements(selectedElements2);
    setIsModalOpen(false);
  };
  const handleAddGroup = () => {
    const selectedElements2 = [...selectedElements];
    console.log(114, groupName, groupUIDs);
    selectedElements2.push([groupName, groupUIDs]);
    setSelectedElements(selectedElements2);
    setIsModalOpen(false);
  };
  const handleElementName = (newElement) => {
    setElementName(newElement);
    setIsModalOpen(true);
    setGroupName(null);
  }
  const handleElementUid = (newUid) => {
    setElementUID(newUid);
  }


  const chartRef = useRef();
  const chartRef2 = useRef();
  const chartRef3 = useRef();

  useEffect(() => {
      drawChartDrug();
      drawChartProtein();
      drawChartCellline();
  }, []);

  /**
   * Create drug by target pathway bar chart
   */
  const drawChartDrug = async () => {
    var data = [];

    var data2 = null;
    try {
      const response = await axios.get('http://localhost:8000/getDrugPathway/');
      const drugPathwayData = response.data;
      data2 = drugPathwayData;
    } catch (error) {
      console.error('Error fetching cell line drug data:', error);
      return null;
    }
    for (let i = 0; i < data2.length; i++) {
      const sorted_names = data2[i].drugNames.slice().sort((a, b) => {
        if (a[2] === b[2]) {
          return b[0].localeCompare(a[0]);
        } else {
          return a[2] - b[2];
        }
      });
      data2[i].drugNames = sorted_names;
      /**for (let j = 0; j < data2[i].drugNames.length; j++) {
        var x_position = ((j % 4) * 1.7) + (6 * i) * 1.7;
        var y_position = Math.floor(j / 4) * 3;
        var get_text = sorted_names[j][0];
        var space_pos = get_text.indexOf(' ');
        var not_space_pos = get_text.indexOf(';');
        var text_len = get_text.length;
        if (text_len > 12) {
          if (not_space_pos !== -1) {
            get_text = get_text.replace(';', '\n');
          } else if (space_pos !== -1) {
            get_text = get_text.replace(' ', '\n');
          } else {
            let middleIndex = Math.floor(get_text.length / 2);
            get_text = get_text.slice(0, middleIndex) + "- \n" + get_text.slice(middleIndex);

          }
          get_text.replace(' ', '\n');
        }
        data.push({ x: x_position, y: y_position, text: sorted_names[j][0], pathway: data2[i].pathway, uid: sorted_names[j][1], old: sorted_names[j][2], text2: get_text });
      }**/

      for (let j = 0; j < data2[i].drugNames.length; j++) {
        var x_position = ((j % 4)) + (6 * i);
        var y_position = Math.floor(j / 4) * 3;
        var get_text = sorted_names[j][0];
        var space_pos = get_text.indexOf(' ');
        var not_space_pos = get_text.indexOf(';');
        var text_len = get_text.length;
        if (text_len > 12) {
          if (not_space_pos !== -1) {
            get_text = get_text.replace(';', '\n');
          } else if (space_pos !== -1) {
            get_text = get_text.replace(' ', '\n');
          } else {
            let middleIndex = Math.floor(get_text.length / 2);
            get_text = get_text.slice(0, middleIndex) + "- \n" + get_text.slice(middleIndex);

          }
          get_text.replace(' ', '\n');
        }
        data.push({ x: x_position, y: y_position, text: sorted_names[j][0], pathway: data2[i].pathway, uid: sorted_names[j][1], old: sorted_names[j][2], text2: get_text });
      }
    }
    console.log(data);

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 1900 - margin.left - margin.right;//1700
    const height = 500 - margin.top - margin.bottom;//600
    d3.select(chartRef.current).selectAll('*').remove();

    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('margin-left', '0px');

    svg
      .append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', '#F5F5F5');

    const chart = svg
      .append('g')
      .attr('transform', 'translate(7 ,-100)scale(0.7,0.7)');

    const x = d3.scaleLinear().domain([0, 100]).range([0, width]);
    const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    const circles = chart
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.x))
      .attr('cy', d => y(d.y))
      .attr('r', 3)
      .attr('fill', d => (d.old ? 'orange' : 'steelblue'))
      .attr('class', 'node')
      .attr('drugNames', d => d.text)
      .attr('pathway', d => d.pathway)
      .attr('uid', d => d.uid)
      .on("click", handleClick);

    function handleClick(d) {
      const drugNames = d3.select(this).attr('drugNames');
      const pathway = d3.select(this).attr('pathway');
      const uid = d3.select(this).attr('uid');
      var all_uids = [];
      for (let i = 0; i < data2.length; i++) {
        if (data2[i].pathway === pathway) {
          for (let j = 0; j < data2[i].drugNames.length; j++) {
            all_uids.push(data2[i].drugNames[j][1]);
          }
          break;
        }
      }
      console.log("all_uids", all_uids);
      setIsModalOpen(true);
      setGroupName(pathway);
      setElementName(drugNames);
      setElementUID(uid);
      setGroupUIDs(all_uids);
    }

    const nodeLabels = chart
      .selectAll('.node-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'node-label')
      .attr('x', function (d) {
        return d.text.length > 16 ? x(d.x) - 10 : x(d.x) - 5;
      })
      .attr('y', d => y(d.y) + 5)
      .text(d => d.text)
      .attr('fill', 'black')
      .style('font-size', '2px')
      .style('letter-spacing', '-0.2px')
      .style('display', 'none');
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    for (let i = 0; i < data2.length; i++) {
      var x_text_name = data2[i].pathway;
      var count_name = data2[i].count;
      var x_text = (i * 110);// - ((33- x_text_name.length)*2);
      var y_text = 470; //- ((33- x_text_name.length)*5);


      var x_count = (i * 110) + 10;//(i * 68) + 10;
      var y_count = 440 - (Math.ceil(count_name / 4)) * 13;//345 - (Math.ceil(count_name / 4)) * 10;

      chart
        .append('text')
        .attr('x', x_text)
        .attr('y', y_text)
        .attr('transform', 'rotate(65,' + x_text.toString() + ',' + y_text.toString() + ')')
        .text(x_text_name)
        .attr('fill', 'black')
        .style('font-size', '18px');
      chart
        .append('text')
        .attr('x', x_count)
        .attr('y', y_count)
        .text(count_name)
        .attr('fill', 'black')
        .style('font-size', '16px');
    }


    const zoomHandler = d3
      .zoom()
      .scaleExtent([0.5, 10])
      .on('zoom', zoomed);

    svg.call(zoomHandler);

    function zoomed(event) {
      const { transform } = event;
      const currentZoomLevel = transform.k;

      chart.attr('transform', transform);

      // Show/hide node names based on the zoom level
      chart.selectAll('.node-label').style('display', () => {
        return currentZoomLevel >= 2 ? 'block' : 'none';
      });
    }
  };

  /**
   * Create a cell type-enriched proteins bar plot
   */
  const drawChartProtein = async () => {
    var data = [];

    var proteinData = null;
    try {
      const response = await axios.get('http://localhost:8000/getProteintissue/');
      const proteinTissueData = response.data;
      proteinData = proteinTissueData;
    } catch (error) {
      console.error('Error fetching cell line tissue data:', error);
      return null;
    }
    for (let i = 0; i < proteinData.length; i++) {
      const sorted_names = proteinData[i].names.slice().sort((a, b) => {
        return a[0].localeCompare(b[0]);
      });
      for (let j = 0; j < proteinData[i].names.length; j++) {
        var x_position = ((j % 4)) + (6 * i);
        var y_position = Math.floor(j / 4) * 2;
        data.push({ x: x_position, y: y_position, text: sorted_names[j][0], pathway: proteinData[i].category_name, uid: sorted_names[j][1] });
      }
    }

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 1200 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    d3.select(chartRef2.current).selectAll('*').remove();

    const svg = d3
      .select(chartRef2.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('margin-left', '0px');

    svg
      .append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', '#F5F5F5');

    const chart = svg
      .append('g')
      .attr('transform', 'translate(7 ,-50)scale(.7,.7)');

    const x = d3.scaleLinear().domain([0, 100]).range([0, width]);
    const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    const circles = chart
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.x))
      .attr('cy', d => y(d.y))
      .attr('r', 3)
      .attr('fill', 'steelblue')
      .attr('class', 'node')
      .attr('drugNames', d => d.text) // Add drugNames attribute
      .attr('pathway', d => d.pathway)
      .attr('uid', d => d.uid)
      .on("click", handleClick);

    function handleClick(d) {
      const drugNames = d3.select(this).attr('drugNames');
      const pathway = d3.select(this).attr('pathway');
      const uid = d3.select(this).attr('uid');
      var all_uids = [];
      console.log("lol2",proteinData.length);
      for (let i = 0; i < proteinData.length; i++) {
        if (proteinData[i].category_name === pathway) {
          console.log("hi",proteinData[i]);
          for (let j = 0; j < proteinData[i].names.length; j++) {
            console.log("hi",proteinData[i].names[j]);
            all_uids.push(proteinData[i].names[j][1]);
          }
          break;
        }
      }
      console.log("all_uids2", all_uids);
      setIsModalOpen(true);
      setGroupName(pathway);
      setElementName(drugNames);
      setElementUID(uid);
      console.log(uid, "uid");
      setGroupUIDs(all_uids);
    }

    const nodeLabels = chart
      .selectAll('.node-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'node-label')
      .attr('x', d => x(d.x) - 5)
      .attr('y', d => y(d.y) + 5)
      .text(d => d.text.split(';')[1].split('_')[0])
      .attr('fill', 'black')
      .style('font-size', '2px')
      .style('letter-spacing', '-0.2px')
      .style('display', 'none');
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    for (let i = 0; i < proteinData.length; i++) {
      var x_text_name = proteinData[i].category_name;
      var count_name = proteinData[i].count;
      var x_text = (i * 68);// * 2;// - ((33- x_text_name.length)*2);
      var y_text = 560; //- ((33- x_text_name.length)*5);


      var x_count = (i * 68)+ 10;
      var y_count = 545 - (Math.ceil(count_name / 4)) * 11;//* 2;

      chart
        .append('text')
        .attr('x', x_text)
        .attr('y', y_text)
        .attr('transform', 'rotate(65,' + x_text.toString() + ',' + y_text.toString() + ')')
        .text(x_text_name)
        .attr('fill', 'black')
        .style('font-size', '17px');
      chart
        .append('text')
        .attr('x', x_count)
        .attr('y', y_count)
        .text(count_name)
        .attr('fill', 'black')
        .style('font-size', '12px');
    }


    const zoomHandler = d3
      .zoom()
      .scaleExtent([0.5, 10])
      .on('zoom', zoomed);

    svg.call(zoomHandler);

    function zoomed(event) {
      const { transform } = event;
      const currentZoomLevel = transform.k;

      chart.attr('transform', transform);

      // Show/hide node names based on the zoom level
      chart.selectAll('.node-label').style('display', () => {
        return currentZoomLevel >= 2 ? 'block' : 'none';
      });
    }
  };


  /**
   * Create cell line - tissue type bar chart
   */
  const drawChartCellline = async () => {
    var data = [];
    var data4 = null;
    try {
      const response = await axios.get('http://localhost:8000/getCelllinetissue/');
      const tissueData = response.data;
      data4 = tissueData;
    } catch (error) {
      console.error('Error fetching cell line tissue data:', error);
      return null;
    }

    for (let i = 0; i < data4.length; i++) {
      const sorted_names = data4[i].names.slice().sort((a, b) => {
        return a[0].localeCompare(b[0]);
      });
      for (let j = 0; j < data4[i].names.length; j++) {
        var x_position = ((j % 4)) + (6 * i);
        var y_position = Math.floor(j / 4) * 3;
        data.push({ x: x_position, y: y_position, text: sorted_names[j][0], pathway: data4[i].category_name, uid: sorted_names[j][1] });
      }
    }

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 1200 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom + 200;
    d3.select(chartRef3.current).selectAll('*').remove();

    const svg = d3
      .select(chartRef3.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('margin-left', '0px');

    svg
      .append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', '#F5F5F5');

    const chart = svg
      .append('g')
      .attr('transform', 'translate(7,150)scale(.59,.539)');

    const x = d3.scaleLinear().domain([0, 100]).range([0, width]);
    const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    const circles = chart
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.x))
      .attr('cy', d => y(d.y))
      .attr('r', 3)
      .attr('fill', 'steelblue')
      .attr('class', 'node')
      .attr('drugNames', d => d.text)
      .attr('pathway', d => d.pathway)
      .attr('uid', d => d.uid)
      .on("click", handleClick);

    function handleClick(d) {
      const drugNames = d3.select(this).attr('drugNames');
      const pathway = d3.select(this).attr('pathway');
      const uid = d3.select(this).attr('uid');
      var all_uids = [];
      for (let i = 0; i < data4.length; i++) {
        if (data4[i].category_name === pathway) {
          for (let j = 0; j < data4[i].names.length; j++) {
            all_uids.push(data4[i].names[j][1]);
          }
          break;
        }
      }
      setIsModalOpen(true);
      setGroupName(pathway);
      setElementName(drugNames);
      setElementUID(uid);
      setGroupUIDs(all_uids);
    }

    const nodeLabels = chart
      .selectAll('.node-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'node-label')
      .attr('x', d => x(d.x) - 5)
      .attr('y', d => y(d.y) + 5)
      .text(d => d.text)
      .attr('fill', 'black')
      .style('font-size', '2px')
      .style('letter-spacing', '-0.2px')
      .style('display', 'none');
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    for (let i = 0; i < data4.length; i++) {
      var x_text_name = data4[i].category_name;
      var count_name = data4[i].count;
      var x_text = (i * 68);// - ((33- x_text_name.length)*2);
      var y_text = 360 + 200; //- ((33- x_text_name.length)*5);


      var x_count = (i * 68) + 10;
      var y_count = (345 + 200) - (Math.ceil(count_name / 4)) * 17;

      chart
        .append('text')
        .attr('x', x_text)
        .attr('y', y_text)
        .attr('transform', 'rotate(65,' + x_text.toString() + ',' + y_text.toString() + ')')
        .text(x_text_name)
        .attr('fill', 'black')
        .style('font-size', '12px');
      chart
        .append('text')
        .attr('x', x_count)
        .attr('y', y_count)
        .text(count_name)
        .attr('fill', 'black')
        .style('font-size', '12px');
    }


    const zoomHandler = d3
      .zoom()
      .scaleExtent([0.5, 10])
      .on('zoom', zoomed);

    svg.call(zoomHandler);

    function zoomed(event) {
      const { transform } = event;
      const currentZoomLevel = transform.k;

      chart.attr('transform', transform);

      chart.selectAll('.node-label').style('display', () => {
        return currentZoomLevel >= 2 ? 'block' : 'none';
      });
    }
  };
  return (
    <Layout className="layout">
      <NavigationBar />
      <Content
        style={{
          marginTop: '50px',
        }}
      >
        <div className="scatterplot-container">
          <div style={{ width: 256 }}>
            <Button type="primary" onClick={toggleCollapsed} style={{ marginBottom: 16, backgroundColor: 'blue', position: 'fixed', top: '80px', left: '-5px', zIndex: 999, }}>
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </Button>
            {!collapsed && (
              <Menu
                defaultSelectedKeys={['1']}
                defaultOpenKeys={['sub1']}
                mode="inline"
                theme="dark"
                style={{ position: 'fixed', overflowY: 'auto', width: '250px', top: '120px', zIndex: 9999 }}
              >
                {items.map((item) => (
                  <Menu.Item key={item.key} onClick={() => handleMenuClick(item.key)} style={{ width: '250px' }}>
                    {item.title}
                  </Menu.Item>
                ))}
              </Menu>
            )}
          </div>
          <div style={{ margin: '0 50px' }}>
            <div>
              <h1 id="Introduction" style={{ textAlign: "left", marginTop: "10px", fontWeight: "bold", fontSize: "30px" }}>Introduction</h1>
              <p>In the study <a href="https://pubmed.ncbi.nlm.nih.gov/35839778/">Pan-cancer proteomic map of 949 human cell lines</a> by Gonçalves et al., an extensive dataset was created and a multitude of interesting results were determined. This dataset, partially accessible through this website, includes both the proteomic map of 949 human cell lines and the drug response results of 625 medications applied to these cell lines, as well as protein-drug associations determined based on these results. In the following sections, we will delve into some of the characteristics and findings of this dataset.<br /><br />  Note:<br /> It is possible to select each individual entity or a group of entities in the following graphs and display these entities in the network graph.</p>
              <h1 id="View Network Graph" style={{ textAlign: "left", marginTop: "50px", fontWeight: "bold", fontSize: "30px" }}>Change view to the network graph</h1>
              <p> Switch to the network view with the following elements:</p>
              {selectedElements.map((element, index) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => handleDelete(element)}
                  style={{ margin: '4px' }}
                >
                  {element[0]}
                </Tag>
              ))}
              <div>
                <Button type="primary" style={{ backgroundColor: 'blue' }} onClick={goToGraph}>
                  Go to the Graph
                </Button>
              </div>

            </div>
            <h1 id="dataset" style={{ textAlign: "left", marginTop: "50px", fontWeight: "bold", fontSize: "30px" }}>Characteristics of the dataset</h1>
            <h1 id="Cell Lines" style={{ textAlign: "left", marginTop: "20px", fontWeight: "bold" }}>Cell Lines</h1>
            <p> 949 cancer cell lines, originating from 28 different tissue types, were analyzed using mass spectrometry to determine the quantity of 8,498 proteins for each cell line.</p>
            <div ref={chartRef3}></div>

            <h1 id="Drugs" style={{ textAlign: "left", marginTop: "20px", fontWeight: "bold" }}>Drugs</h1>
            <p> In the context of the study 625 different anti-cancer drugs were screened across 947 of the 949 cancer cell lines. This included drugs approved by the Food and Drug Administration, as well as those in clinical development and investigational compounds. The authors found that this represents a 48% increase in the number of drugs investigated compared to previous studies from <a href="https://www.cell.com/cell/fulltext/S0092-8674(16)30746-2">Iorio et al. </a>, <a href="https://pubmed.ncbi.nlm.nih.gov/31097696/">Picco et al.</a>, and <a href="https://pubmed.ncbi.nlm.nih.gov/32627965/">Gonçalves et al.</a> . Overall, this resulted in a dataset comprising drugs targeting 24 different pathways of their canonical targets. In the plot, drugs are arranged according to their pathways of their canonical targets, with orange-colored drugs only present in the GDSC2 dataset.</p>
            <div ref={chartRef}></div>

            <h1 id="Number of cell type-enriched proteins" style={{ textAlign: "left", marginTop: "20px", fontWeight: "bold" }}>Number of cell type-enriched proteins</h1>
            <p> In the study, proteins were considered enriched in specific cell types if they were quantified in at least 50% of cell lines from no more than two tissue types, and in 35% or less of cell lines from all other tissues, with only tissues represented by at least 10 cell lines being considered. The graph shows that cell lines derived from hematopoietic and lymphoid tissues, peripheral nervous system, and skin cell types have the highest levels of these proteins. Additionally, the researchers observed that cell type-enriched proteins had a higher correlation between the transcriptome and proteome than other proteins, suggesting that these represent cell type-specific processes that are more highly conserved between transcription and translation. Consequently, the authors found that the data indicate a general alignment of the proteomic data with cell lineage, revealing patterns of protein expression consistent with certain cancer cell types of origin.</p>
            <div ref={chartRef2}></div>


            <div>
              <h1 id="Biomarkers" style={{ textAlign: "left", marginTop: "20px", fontWeight: "bold" }}>Biomarkers for cancer vulnerabilities</h1>
              <p style={{ width: "1100px" }}>
                The graph below shows drug-protein associations ((FDR  &lt;1% or  Nc_FDR  &lt;1%) and ABS(Beta &gt; 0.1 or Nc_Beta &gt; 0.1)) between protein measurements and drug responses - this graph uses the same axis labels and layout as Figure 4A from the paper of the ProCan team. Each association is represented using the linear regression effect size (beta) and its statistical significance (log ratio test). The coloring is based on the distance between the drug target and associated protein, calculated by the ProCan Team using a PPI network assembled from STRING. "T" indicates that the associated protein is a canonical target of the drug. Numbers represent the minimum number of protein-protein interactions separating the drug targets from the associated proteins. The symbol "-" denotes associations for which no path was found.</p>
              <Biomarker getElementName={handleElementName} getElementUid={handleElementUid} />
            </div>
          </div>

          <Modal
            title="Add Entities"
            onCancel={handleCancel}
            open={isModalOpen}
            footer={null}
          >
            <div>
              <p> Add Entities to the search list</p>
              <Button onClick={handleAddElement}>Add {elementName}</Button>
              {groupName && (
                <Button onClick={handleAddGroup}>Add all group members of {groupName}</Button>
              )}
            </div>
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default Scatterplot;