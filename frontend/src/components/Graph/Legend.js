import React, { useState, useEffect } from 'react';
import { Button, Badge, Popover, Slider, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { FaMapSigns } from 'react-icons/fa';
//import procan_protein from './procan_protein_screenshot.png'
/**
 * Create legend and legend content
 * @param {*} param0 
 * @returns 
 */

const LegendComponent = ({ showLegend, setShowLegend }) => {
  const [isLegendOpen, setLegendOpen] = useState(false);

  const marks = {
    0: '4.0',
    33: '3.0+',
    67: '2.0+',
    100: '1.0+',
  };
  /**
   * show or hide legend
   */
  const toggleLegend = () => {
    setLegendOpen(!isLegendOpen);
  };

  useEffect(() => {
    setShowLegend(showLegend);
  }, []);

  /**
   * show or hide specific nodes in the graph
   * @param {*} index 
   */
  const toggleLegendItem = (index) => {
    const updatedData = [...showLegend];
    updatedData[index].show = !updatedData[index].show;
    setShowLegend(updatedData);
  };

  /**
   * close legend
   */
  const closeLegend = () => {
    setLegendOpen(false);
  };

  /**
   * hanlde slider change in legend
   * @param {*} value 
   */
  const handleSliderChange = (value) => {
    const updatedData = [...showLegend];
    updatedData[0].limit = value;
    setShowLegend(updatedData);
  }
  const photosWithDescriptions = [
    { photo: './procan_protein_screenshot.png', description: 'ProCan Protein', info: 'Proteins present in the ProCan dataset' },
    { photo: './biogrid_protein_screenshot.png', description: 'BioGRID Protein', info: 'Proteins present in the BioGRID dataset but absent from the ProCan dataset' },
    { photo: './drug_screenshot.png', description: 'Drug' },
    { photo: './cellline_screenshot.png', description: 'Cell Line' },
    // Add more photos and descriptions as needed
  ];

  /**
   * Content that is shown when the legend is opened
   */
  const legendContent = (
    <div style={{ maxHeight: '500px', overflowY: 'auto',width: '250px' }}>
      <Button
        type="link"
        style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 1 }}
        onClick={closeLegend}
      >
        Close
      </Button>
      {showLegend && showLegend[0] === false ? (
        <div>
        {photosWithDescriptions.map((item, index) => (
          <div
            key={index}
            style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}
          >
            <img
              src={item.photo}
              alt={`Photo ${index + 1}`}
              style={{ width: '30px', marginRight: '8px' }}
            />
            <span>{item.description}</span>
            {item.info && (
              <Tooltip title={item.info}>
                <InfoCircleOutlined style={{ color: '#1890ff' }} />
              </Tooltip>
            )}
          </div>
        ))}
      </div>
      ) : showLegend && showLegend[0] && (showLegend[0].att !== "indicator" ?
        showLegend.map((item, index) => (
          <div
            key={index}
            style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}
            onClick={() => toggleLegendItem(index)}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: item.show ? item.color : 'grey',
                marginRight: '8px',
                cursor: 'pointer',
              }}
            />
            <span>{item.name}</span>
          </div>
        )) : (
          <div>
          <p style={{ fontSize: 'smaller' }}>
            Max phase of the drug indication
          </p>
          <Slider
          style = {{width: '140px', left: '10px'}}
          tipFormatter={null}
          marks={marks}
          step={null}
          defaultValue={100}
          onChangeComplete={handleSliderChange}

        />
        {showLegend.map((item, index) => (
          (index > 1 ? (
           <div
           key={index}
           style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}
           onClick={() => toggleLegendItem(index)}
         >
           <div
             style={{
               width: '20px',
               height: '20px',
               backgroundColor: item.show ? 'grey' : '#fb8500',
               marginRight: '8px',
               cursor: 'pointer',
             }}
           />
           <span>{item.name}</span>
         </div>
         ):
         <div
         key={index}
         style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}
         onClick={() => toggleLegendItem(index)}
       >
         <div
           style={{
             width: '20px',
             height: '20px',
             backgroundColor: item.show ? item.color : true,
             marginRight: '8px',
             cursor: 'pointer',
           }}
         />
         <span>{item.name}</span>
       </div>         
         
         
         )
          ))}
        </div>
        ))
      }
    </div>
  );

  return showLegend !== null ? (
    <div >
      <div style={{ position: 'absolute', top: '170px', right: '20px', zIndex: 9999 }}>
        <Badge count={showLegend.filter(item => item.show).length}>
          <Button
            type="primary"
            shape="circle"
            style={{ backgroundColor: '#4096FF' }}
            icon={<span onClick={toggleLegend} style={{ cursor: 'pointer' }}><FaMapSigns style={{ color: 'black' }} /></span>}
          />
        </Badge>
      </div>
      <Popover
        title="Legend"
        content={legendContent}
        trigger="click"
        visible={isLegendOpen}
        onVisibleChange={() => { }}
        placement="topRight"
      >
        <div style={{ position: 'fixed', top: '170px', right: '20px', zIndex: 2 }}>
          <Button type="primary" onClick={toggleLegend} shape="circle" icon={<span style={{ cursor: 'pointer' }}><FaMapSigns style={{ color: 'black' }} /></span>} />
        </div>
      </Popover>
    </div>
  ) : null;
};

export default LegendComponent;
