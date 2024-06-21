import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';

/**
 * show content of selected Data
 * @param {*} param0 
 * @returns 
 */

const CustomModalContent = ({ title, selectedData, visible, onCancel, onSliderChange }) => {
  const [defaultValues, setDefaultValues] = useState(null);

  useEffect(() => {

    setDefaultValues(selectedData);
  }, [selectedData]);


  const handleModalClose = () => {
    onSliderChange(defaultValues);
  };

  return (
    <Modal
      title={title}
      visible={visible}
      onCancel={() => {
        handleModalClose();
        onCancel();
      }}
      footer={null}
    >
      {defaultValues ? (
        defaultValues.properties.map((property) =>
          property.min !== property.max ? (
            <div key={property.name}>
              <p>{property.name}</p>
              <p>{property.changedMin}</p>
              <p>{property.changedMax}</p>
              <p>{typeof (property.min)}</p>
              <p>{property.max}</p>
            </div>
          ) : (
            null
          )
        )
      ) : (
        <p>No data found for the selected item.</p>
      )}
    </Modal>

  );
};

export default CustomModalContent;
