import { useNavigate } from 'react-router-dom';
import SearchBar from '../SearchBar/SearchBar';
import DetailGraph from '../DetailGraph';
import { Layout, Menu, Dropdown, Checkbox, Tooltip } from 'antd';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from "axios";
import './NavigationBar.css';
import {
  LockOutlined,
  DatabaseOutlined,
  UnorderedListOutlined,
  BarChartOutlined,
  DotChartOutlined,
  SettingOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Header } = Layout;

/**
 * Show navigation bar at the top of each site
 * @param {*} param0 
 * @returns 
 */
function StartPage({ getUid, isGraph }) {
  const navigate = useNavigate();
  const [showMain, setShowMain] = useState(0);
  const [uidValue, setUidValue] = useState('');
  const [projectName, setProjectName] = useState([
    { name: 'project', checked: true },
    { name: 'project1', checked: false },
  ]);

  /**
   * Open graph component without any nodes
   */
  const handleGraphWithoutNode = () => {
    const arr = [];
    navigate('/Graph', { state: { arr } });
  };

  /**
   * Open graph component with a node
   */
  useEffect(() => {
    if (uidValue !== "change") {
      if (typeof getUid === 'function') {
        getUid(uidValue);
      } else {
        if (uidValue != '') {
          const arr = [uidValue];
          navigate('/Graph', { state: { arr } });
        }
      }
    }
  }, [uidValue]);

  /**
   * Get projects names
   */
  useEffect(() => {
    axios.get("http://localhost:8000/datasets/")
      .then((response) => {
        var getProjectNames = [];
        var response_data = response.data.data;
        for (let i = 0; i < response_data.length; i++) {
          getProjectNames.push({ name: response_data[i][0], project_id: response_data[i][1], checked: response_data[i][2] });
        }
        setProjectName(getProjectNames);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  // Function to handle the checkbox change
  const handleCheckboxChange = (name) => {
    const updatedProjects = projectName.map((project) =>
      project.name === name ? { ...project, checked: !project.checked } : project
    );
    setProjectName(updatedProjects);
  };

  /**
   * Set what projects should be searches for a search term
   */
  const advancedSearchMenu = (
    <div style={{ background: 'white', padding: '10px', marginTop: '20px', borderRadius: '8px', width: '170px', marginLeft: '-15px' }}>
      {projectName.map((project) => (
        <div key={project.name} style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Checkbox
              onChange={() => handleCheckboxChange(project.name)}
              checked={project.checked}
            >
              {project.name}
            </Checkbox>
          </div>
        </div>
      ))}
    </div>
  );
  return (
    <Header className="header" style={{ position: 'fixed', top: 0, left: 0, width: '100%', padding: '0 0px', zIndex: 999 }}>
      <Menu theme="dark" mode="horizontal" >
        <Menu.Item key="home" style={{ left: 0 }}>
          <Link to="/">
            <img src="./spider.png" alt="Home" style={{ width: '45px', height: '45px', marginTop: '10px' }} />
          </Link>
        </Menu.Item>
        <Menu.Item key="search" style={{ display: 'flex', alignItems: 'center' }} disabled>
          <div className="logo" style={{ color: 'black' }}>
            <SearchBar
              setShowMain={setShowMain}
              setUidValue={setUidValue}
              projectName={projectName}
              isGraph={isGraph}
            />
          </div>
        </Menu.Item>
        <Menu.Item key="advanced-search" className="advanced-search-menu-item">
          <Dropdown overlay={advancedSearchMenu} >
            <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
              <SettingOutlined /> Database
            </a>
          </Dropdown>
        </Menu.Item>
        <Menu.Item key="overview" onClick={() => navigate('/Overview')}>
          <BarChartOutlined /> ProCan Plots
        </Menu.Item>        
        <Menu.Item key="upload" onClick={() => navigate('/Login')}>
          <LockOutlined /> Upload
        </Menu.Item>
        <Menu.Item key="FAQ" onClick={() => navigate('/FAQ')}>
          <FileTextOutlined /> FAQ
        </Menu.Item>
      </Menu>
    </Header>
  );
}

export default StartPage;
