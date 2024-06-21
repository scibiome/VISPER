import React, { useState, useEffect } from 'react';
import { Table, Button, Dropdown, Menu, Collapse, Modal, Select, Row, Col, Slider, InputNumber, Tooltip, Checkbox } from 'antd';
import { DeleteOutlined, GlobalOutlined, RadarChartOutlined, CaretUpOutlined, CaretDownOutlined, EnvironmentOutlined } from '@ant-design/icons';
import axios from "axios";
import neo4j from "neo4j-driver";

const { Option, OptGroup } = Select;
/**
 * Represents the select menu on the left side of the graph
 * @param {*} param0 
 * @returns 
 */

const Panel = ({ selectedNodes, cy, setCy, setSelectedNodes, nodeTypes, selectedElementInfo, setQuery, setNewFilter, setAllInfo, applyCluster, applyRemoveCluster, allInformation, getUid }) => {
  const [updateTimeout, setUpdateTimeout] = useState(null);
  const [uniqueEntities, setUniqueEntities] = useState([]);
  const [initialSetInfo, setInitialSetInfo] = useState(true);
  const [isButtonDisabled, setButtonDisabled] = useState(true);
  const [isButtonDisabledAnalysis, setButtonDisabledAnalysis] = useState(true);
  const [isButtonDisabledShortestPath, setButtonDisabledShortestPath] = useState(true);
  const [isButtonDisabledFindPanCanProtein, setButtonDisabledFindPanCanProtein] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalShortestPath, setIsModalShortestPath] = useState(false);
  const [isModalFindTargetsOpen, setIsModalFindTargetsOpen] = useState(false);
  const [allEntities, setAllEntities] = useState(["Protein", "Cell_Line", "Drug"]);
  const [allEntitiesConnections, setAllEntitiesConnections] = useState([["Protein", "Protein", ["PPI"]], ["Drug", "Protein", ["ASSOCIATION"]], ["Cell_Line", "Protein", ["HAS_PROTEIN_6692", "HAS_PROTEIN_8498"]], ["Drug", "Cell_Line", ["TESTED_ON"]]])
  const [selectedEntity1, setSelectedEntity1] = useState(null);
  const [selectedEntity2, setSelectedEntity2] = useState(null);
  const [selectedEntity3, setSelectedEntity3] = useState(null);
  const [selectedEntity4, setSelectedEntity4] = useState(null);
  const [connectionOptions, setConnectionOptions] = useState([]);
  const [highestValue, setHighestValue] = useState(false);
  const [lowestValue, setLowestValue] = useState(false);
  const [resultSize, setResultSize] = useState(20);
  const [hubPenality, sethubPenality] = useState(0);
  const [maximumDegree, setMaximumDegree] = useState(0);
  const [orderAttribute, setOrderAttribute] = useState("");
  const [selectedDrugTargetAlgorithmus, setSelectedDrugTargetAlgorithmus] = useState('Betweenness centrality');

  const [graphInformation, setGraphInformation] = useState({ 'nodes': [{ 'name': 'Cell_Line', 'attributes': [{ 'name': 'tissue', 'type': 'list', 'values': ['Haematopoietic and Lymphoid', 'Lung', 'Stomach', 'Breast', 'Bone', 'Ovary', 'Skin', 'Head and Neck', 'Endometrium', 'Adrenal Gland', 'Central Nervous System', 'Pancreas', 'Prostate', 'Peripheral Nervous System', 'Large Intestine', 'Cervix', 'Kidney', 'Liver', 'Soft Tissue', 'Biliary Tract', 'Bladder', 'Esophagus', 'Testis', 'Thyroid', 'Vulva', 'Uterus', 'Small Intestine', 'Placenta'], 'valuesChange': ['Haematopoietic and Lymphoid', 'Lung', 'Stomach', 'Breast', 'Bone', 'Ovary', 'Skin', 'Head and Neck', 'Endometrium', 'Adrenal Gland', 'Central Nervous System', 'Pancreas', 'Prostate', 'Peripheral Nervous System', 'Large Intestine', 'Cervix', 'Kidney', 'Liver', 'Soft Tissue', 'Biliary Tract', 'Bladder', 'Esophagus', 'Testis', 'Thyroid', 'Vulva', 'Uterus', 'Small Intestine', 'Placenta'] }, { 'name': 'growth_properties', 'type': 'list', 'values': ['Suspension', 'Adherent', 'Unknown', 'Semi-Adherent'], 'valuesChange': ['Suspension', 'Adherent', 'Unknown', 'Semi-Adherent'] }, { 'name': 'cancer_type', 'type': 'list', 'values': ["B-Cell Non-Hodgkin's Lymphoma", 'Plasma Cell Myeloma', 'Acute Myeloid Leukemia', 'Other Solid Carcinomas', 'Gastric Carcinoma', 'T-Lymphoblastic Leukemia', 'Breast Carcinoma', "Ewing's Sarcoma", 'Ovarian Carcinoma', 'Melanoma', 'Head and Neck Carcinoma', 'Endometrial Carcinoma', 'Glioblastoma', 'Small Cell Lung Carcinoma', 'Pancreatic Carcinoma', 'Mesothelioma', 'B-Lymphoblastic Leukemia', 'Prostate Carcinoma', 'Neuroblastoma', 'Non-Small Cell Lung Carcinoma', 'Chronic Myelogenous Leukemia', "Burkitt's Lymphoma", 'Colorectal Carcinoma', 'Cervical Carcinoma', 'Oral Cavity Carcinoma', 'Kidney Carcinoma', 'Hepatocellular Carcinoma', 'Non-Cancerous', 'Biliary Tract Carcinoma', 'Glioma', 'Squamous Cell Lung Carcinoma', 'Bladder Carcinoma', 'Esophageal Squamous Cell Carcinoma', "Hodgkin's Lymphoma", 'Rhabdomyosarcoma', 'Thyroid Gland Carcinoma', "T-Cell Non-Hodgkin's Lymphoma", 'Esophageal Carcinoma', 'Other Blood Carcinomas', 'Osteosarcoma', 'Chondrosarcoma'], 'valuesChange': ["B-Cell Non-Hodgkin's Lymphoma", 'Plasma Cell Myeloma', 'Acute Myeloid Leukemia', 'Other Solid Carcinomas', 'Gastric Carcinoma', 'T-Lymphoblastic Leukemia', 'Breast Carcinoma', "Ewing's Sarcoma", 'Ovarian Carcinoma', 'Melanoma', 'Head and Neck Carcinoma', 'Endometrial Carcinoma', 'Glioblastoma', 'Small Cell Lung Carcinoma', 'Pancreatic Carcinoma', 'Mesothelioma', 'B-Lymphoblastic Leukemia', 'Prostate Carcinoma', 'Neuroblastoma', 'Non-Small Cell Lung Carcinoma', 'Chronic Myelogenous Leukemia', "Burkitt's Lymphoma", 'Colorectal Carcinoma', 'Cervical Carcinoma', 'Oral Cavity Carcinoma', 'Kidney Carcinoma', 'Hepatocellular Carcinoma', 'Non-Cancerous', 'Biliary Tract Carcinoma', 'Glioma', 'Squamous Cell Lung Carcinoma', 'Bladder Carcinoma', 'Esophageal Squamous Cell Carcinoma', "Hodgkin's Lymphoma", 'Rhabdomyosarcoma', 'Thyroid Gland Carcinoma', "T-Cell Non-Hodgkin's Lymphoma", 'Esophageal Carcinoma', 'Other Blood Carcinomas', 'Osteosarcoma', 'Chondrosarcoma'] }, { 'name': 'sample_treatment', 'type': 'list', 'values': ['Unknown', 'None', 'Chemotherapy;Radiotherapy', 'Chemotherapy', 'Radioiodine Therapy', 'Steroid', 'Radiotherapy'], 'valuesChange': ['Unknown', 'None', 'Chemotherapy;Radiotherapy', 'Chemotherapy', 'Radioiodine Therapy', 'Steroid', 'Radiotherapy'] }, { 'name': 'Cancer_type', 'type': 'list', 'values': ["B-Cell Non-Hodgkin's Lymphoma", 'Plasma Cell Myeloma', 'Acute Myeloid Leukemia', 'Carcinoid Tumour', 'Gastric Carcinoma', 'T-Lymphoblastic Leukemia', 'Breast Carcinoma', "Ewing's Sarcoma", 'Ovarian Carcinoma', 'Melanoma', 'Head and Neck Carcinoma', 'Endometrial Carcinoma', 'Other Solid Carcinomas', 'Glioblastoma', 'Small Cell Lung Carcinoma', 'Pancreatic Carcinoma', 'Mesothelioma', 'B-Lymphoblastic Leukemia', 'Prostate Carcinoma', 'Neuroblastoma', 'Non-Small Cell Lung Carcinoma', 'Chronic Myelogenous Leukemia', "Burkitt's Lymphoma", 'Colorectal Carcinoma', 'Cervical Carcinoma', 'Kidney Carcinoma', 'Hepatocellular Carcinoma', 'T-Lymphoblastic Lymphoma', 'Leiomyosarcoma', 'Non-Cancerous', 'Biliary Tract Carcinoma', 'Glioma', 'Bladder Carcinoma', 'Esophageal Carcinoma', "Hodgkin's Lymphoma", 'Other Blood Cancers', 'Other Sarcomas', 'Rhabdomyosarcoma', 'Thyroid Gland Carcinoma', "T-Cell Non-Hodgkin's Lymphoma", 'Vulvar carcinoma', 'Hairy Cell Leukemia', 'Osteosarcoma', 'Chondrosarcoma', 'Uncertain'], 'valuesChange': ["B-Cell Non-Hodgkin's Lymphoma", 'Plasma Cell Myeloma', 'Acute Myeloid Leukemia', 'Carcinoid Tumour', 'Gastric Carcinoma', 'T-Lymphoblastic Leukemia', 'Breast Carcinoma', "Ewing's Sarcoma", 'Ovarian Carcinoma', 'Melanoma', 'Head and Neck Carcinoma', 'Endometrial Carcinoma', 'Other Solid Carcinomas', 'Glioblastoma', 'Small Cell Lung Carcinoma', 'Pancreatic Carcinoma', 'Mesothelioma', 'B-Lymphoblastic Leukemia', 'Prostate Carcinoma', 'Neuroblastoma', 'Non-Small Cell Lung Carcinoma', 'Chronic Myelogenous Leukemia', "Burkitt's Lymphoma", 'Colorectal Carcinoma', 'Cervical Carcinoma', 'Kidney Carcinoma', 'Hepatocellular Carcinoma', 'T-Lymphoblastic Lymphoma', 'Leiomyosarcoma', 'Non-Cancerous', 'Biliary Tract Carcinoma', 'Glioma', 'Bladder Carcinoma', 'Esophageal Carcinoma', "Hodgkin's Lymphoma", 'Other Blood Cancers', 'Other Sarcomas', 'Rhabdomyosarcoma', 'Thyroid Gland Carcinoma', "T-Cell Non-Hodgkin's Lymphoma", 'Vulvar carcinoma', 'Hairy Cell Leukemia', 'Osteosarcoma', 'Chondrosarcoma', 'Uncertain'] }, { 'name': 'Tissue_type', 'type': 'list', 'values': ['Haematopoietic and Lymphoid', 'Lung', 'Stomach', 'Breast', 'Bone', 'Ovary', 'Skin', 'Head and Neck', 'Endometrium', 'Adrenal Gland', 'Central Nervous System', 'Pancreas', 'Prostate', 'Peripheral Nervous System', 'Other tissue', 'Large Intestine', 'Cervix', 'Kidney', 'Liver', 'Soft Tissue', 'Biliary Tract', 'Bladder', 'Esophagus', 'Testis', 'Thyroid', 'Vulva', 'Small Intestine', 'Placenta'], 'valuesChange': ['Haematopoietic and Lymphoid', 'Lung', 'Stomach', 'Breast', 'Bone', 'Ovary', 'Skin', 'Head and Neck', 'Endometrium', 'Adrenal Gland', 'Central Nervous System', 'Pancreas', 'Prostate', 'Peripheral Nervous System', 'Other tissue', 'Large Intestine', 'Cervix', 'Kidney', 'Liver', 'Soft Tissue', 'Biliary Tract', 'Bladder', 'Esophagus', 'Testis', 'Thyroid', 'Vulva', 'Small Intestine', 'Placenta'] }, { 'name': 'msi_status', 'type': 'list', 'values': ['MSS', 'MSI'], 'valuesChange': ['MSS', 'MSI'] }, { 'name': 'sample_treatment_details', 'type': 'list', 'values': ['adriamycin and taxol', '5 years with Busulfan (1979-1984)', 'transcatheter arterial embolization with lipoidol plus doxorubicin', 'Cisplatin', 'treated by transcatheter arterial embolization with lipoidol plus a combination of doxorubicin and mitomycin C', 'Three courses of CAP; cyclophosphamide, adriamycin and cisplatin. Three courses of etoposide and cisplatin.', 'Six courses of CAP; cyclophosphamide, adriamycin and cis-platinum.', '5-FU', 'Cyclophosphamide', 'yclophosphamide, hydroxydaunomycin, vincristine, and prednisone (CHOP chemotherapy)', '7 year chlorambucil', '5-FU + Doxorubicin + Mitomycin C', '5 fluorouracil, doxorubicin and mitomycin C', 'Five courses of CAP; cyclophosphamide, adriamycin and cis-platinum.', '3 cycles of chemotherapy treatment with eroposide, colchicine, methotrexate and vincristine', 'The patient had received sequential treatment with cisplatin and cyclophosphamide, cisplatin and etoposide and subsequently tamoxifen', 'chlorambucil.', 'cytoxan, bleomycin and adriamycin', 'cisplatin, 5-fluorouracil and chlorambucil treatment.', 'The patient was treated with RTG, methotrexate, adriamycin, vincristine, cytoxan, and aramycin C', 'The patient was treated with cytoxan, vincristine, methotrexate and radiation therapy'], 'valuesChange': ['adriamycin and taxol', '5 years with Busulfan (1979-1984)', 'transcatheter arterial embolization with lipoidol plus doxorubicin', 'Cisplatin', 'treated by transcatheter arterial embolization with lipoidol plus a combination of doxorubicin and mitomycin C', 'Three courses of CAP; cyclophosphamide, adriamycin and cisplatin. Three courses of etoposide and cisplatin.', 'Six courses of CAP; cyclophosphamide, adriamycin and cis-platinum.', '5-FU', 'Cyclophosphamide', 'yclophosphamide, hydroxydaunomycin, vincristine, and prednisone (CHOP chemotherapy)', '7 year chlorambucil', '5-FU + Doxorubicin + Mitomycin C', '5 fluorouracil, doxorubicin and mitomycin C', 'Five courses of CAP; cyclophosphamide, adriamycin and cis-platinum.', '3 cycles of chemotherapy treatment with eroposide, colchicine, methotrexate and vincristine', 'The patient had received sequential treatment with cisplatin and cyclophosphamide, cisplatin and etoposide and subsequently tamoxifen', 'chlorambucil.', 'cytoxan, bleomycin and adriamycin', 'cisplatin, 5-fluorouracil and chlorambucil treatment.', 'The patient was treated with RTG, methotrexate, adriamycin, vincristine, cytoxan, and aramycin C', 'The patient was treated with cytoxan, vincristine, methotrexate and radiation therapy'] }, { 'name': 'COSMIC_ID', 'type': 'num', 'min': 683667.0, 'max': 1789883.0, 'minChange': 683667.0, 'maxChange': 1789883.0 }, { 'name': 'master_cell_id', 'type': 'num', 'min': 1.0, 'max': 2266.0, 'minChange': 1.0, 'maxChange': 2266.0 }, { 'name': 'cell_line_name', 'type': 'num', 'min': 697.0, 'max': 5637.0, 'minChange': 697.0, 'maxChange': 5637.0 }, { 'name': 'model_name', 'type': 'num', 'min': 697.0, 'max': 5637.0, 'minChange': 697.0, 'maxChange': 5637.0 }, { 'name': 'name', 'type': 'num', 'min': 697.0, 'max': 5637.0, 'minChange': 697.0, 'maxChange': 5637.0 }] }, { 'name': 'Protein', 'attributes': [] }, { 'name': 'Drug', 'attributes': [{ 'name': 'target_pathway', 'type': 'list', 'values': ['p53 pathway', 'Chromatin other', 'EGFR signaling', 'Protein stability and degradation', 'Other, kinases', 'RTK signaling', 'WNT signaling', 'Mitosis', 'PI3K/MTOR signaling', 'Other', 'Apoptosis regulation', 'Chromatin histone methylation', 'DNA replication', 'Metabolism', 'Cell cycle', 'Genome integrity', 'ERK MAPK signaling', 'IGF1R signaling', 'Cytoskeleton', 'Chromatin histone acetylation', 'JNK and p38 signaling', 'ABL signaling', 'Hormone-related', 'Unclassified'], 'valuesChange': ['p53 pathway', 'Chromatin other', 'EGFR signaling', 'Protein stability and degradation', 'Other, kinases', 'RTK signaling', 'WNT signaling', 'Mitosis', 'PI3K/MTOR signaling', 'Other', 'Apoptosis regulation', 'Chromatin histone methylation', 'DNA replication', 'Metabolism', 'Cell cycle', 'Genome integrity', 'ERK MAPK signaling', 'IGF1R signaling', 'Cytoskeleton', 'Chromatin histone acetylation', 'JNK and p38 signaling', 'ABL signaling', 'Hormone-related', 'Unclassified'] }, { 'name': 'drug_owner', 'type': 'list', 'values': ['GDSC', 'AZ', 'MGH', 'AZ_GDSC', 'Nathanael.Gray', 'SGC', 'Mike.Olson', 'Ed.Tate', 'baylor.college.of.medicine.peggy.goodell'], 'valuesChange': ['GDSC', 'AZ', 'MGH', 'AZ_GDSC', 'Nathanael.Gray', 'SGC', 'Mike.Olson', 'Ed.Tate', 'baylor.college.of.medicine.peggy.goodell'] }, { 'name': 'webrelease', 'type': 'list', 'values': ['Y', 'N'], 'valuesChange': ['Y', 'N'] }, { 'name': 'PUBCHEM', 'type': 'num', 'min': 1018.0, 'max': 126689157.0, 'minChange': 1018.0, 'maxChange': 126689157.0 }, { 'name': 'drug_id', 'type': 'num', 'min': 17.0, 'max': 2510.0, 'minChange': 17.0, 'maxChange': 2510.0 }] }], 'relationships': [{ 'name': 'HAS_PROTEIN_6692', 'n1': 'Cell_Line', 'n2': 'Protein', 'attributes': [{ 'name': 'Protein_Intensity', 'type': 'num', 'min': -4.058114592328761, 'max': 15.503639324498378, 'minChange': -4.058114592328761, 'maxChange': 15.503639324498378 }] }, { 'name': 'HAS_PROTEIN_8498', 'n1': 'Cell_Line', 'n2': 'Protein', 'attributes': [{ 'name': 'Protein_Intensity', 'type': 'num', 'min': -5.444587739880729, 'max': 15.652689341072046, 'minChange': -5.444587739880729, 'maxChange': 15.652689341072046 }] }, { 'name': 'TESTED_ON', 'n1': 'Drug', 'n2': 'Cell_Line', 'attributes': [{ 'name': 'dataset', 'type': 'list', 'values': ['GDSC1', 'GDSC2'], 'valuesChange': ['GDSC1', 'GDSC2'] }, { 'name': 'AUC', 'type': 'num', 'min': 0.0055058589737584365, 'max': 0.9999639441639192, 'minChange': 0.0055058589737584365, 'maxChange': 0.9999639441639192 }, { 'name': 'ln_IC50', 'type': 'num', 'min': -10.579286628308195, 'max': 12.359001840287563, 'minChange': -10.579286628308195, 'maxChange': 12.359001840287563 }, { 'name': 'num_replicates', 'type': 'num', 'min': 1.0, 'max': 181.0, 'minChange': 1.0, 'maxChange': 181.0 }, { 'name': 'max_screening_conc', 'type': 'num', 'min': 0.001, 'max': 4000.0, 'minChange': 0.001, 'maxChange': 4000.0 }, { 'name': 'RMSE', 'type': 'num', 'min': 0.001485906910673817, 'max': 0.2999572668734664, 'minChange': 0.001485906910673817, 'maxChange': 0.2999572668734664 }] }, { 'name': 'ASSOCIATION', 'n1': 'Drug', 'n2': 'Protein', 'attributes': [{ 'name': 'GDSC', 'type': 'list', 'values': ['GDSC2', 'GDSC1'], 'valuesChange': ['GDSC2', 'GDSC1'] }, { 'name': 'skew', 'type': 'num', 'min': -4.106193002139706, 'max': 1.9878671232784333, 'minChange': -4.106193002139706, 'maxChange': 1.9878671232784333 }, { 'name': 'r2', 'type': 'num', 'min': 0.1013839670288539, 'max': 0.7734339936656506, 'minChange': 0.1013839670288539, 'maxChange': 0.7734339936656506 }, { 'name': 'ppi', 'type': 'num', 'min': 1.0, 'max': 4.0, 'minChange': 1.0, 'maxChange': 4.0 }, { 'name': 'drug_id', 'type': 'num', 'min': 1.0, 'max': 2510.0, 'minChange': 1.0, 'maxChange': 2510.0 }, { 'name': 'nc_pval', 'type': 'num', 'min': 7.84946148385623e-43, 'max': 1.0, 'minChange': 7.84946148385623e-43, 'maxChange': 1.0 }, { 'name': 'nc_fdr', 'type': 'num', 'min': 4.341537146720881e-39, 'max': 1.0, 'minChange': 4.341537146720881e-39, 'maxChange': 1.0 }, { 'name': 'nc_beta', 'type': 'num', 'min': -2.19763946136419, 'max': 2.185802362170413, 'minChange': -2.19763946136419, 'maxChange': 2.185802362170413 }, { 'name': 'nc_lr', 'type': 'num', 'min': -7.503331289626658e-12, 'max': 188.20184113361572, 'minChange': -7.503331289626658e-12, 'maxChange': 188.20184113361572 }, { 'name': 'pval', 'type': 'num', 'min': 1.0023245614279191e-15, 'max': 0.9999987968766584, 'minChange': 1.0023245614279191e-15, 'maxChange': 0.9999987968766584 }, { 'name': 'fdr', 'type': 'num', 'min': 5.548868772064962e-12, 'max': 0.9999987968766584, 'minChange': 5.548868772064962e-12, 'maxChange': 0.9999987968766584 }, { 'name': 'lr', 'type': 'num', 'min': 2.273736754432321e-12, 'max': 64.42588874796547, 'minChange': 2.273736754432321e-12, 'maxChange': 64.42588874796547 }, { 'name': 'covs', 'type': 'num', 'min': 19.0, 'max': 22.0, 'minChange': 19.0, 'maxChange': 22.0 }, { 'name': 'n', 'type': 'num', 'min': 61.0, 'max': 916.0, 'minChange': 61.0, 'maxChange': 916.0 }, { 'name': 'beta', 'type': 'num', 'min': -1.9500100915153256, 'max': 2.57257140936904, 'minChange': -1.9500100915153256, 'maxChange': 2.57257140936904 }] }] });
  const [globalGraphInformation, setGlobalGraphInformation] = useState(null);
  const [localGraphInformation, setLocalGraphInformation] = useState(null);
  const [filterGraphInformation, setFilterGraphInformation] = useState([]);
  const [filterInfo, setFilterInfo] = useState({ 'nodes': [{ 'name': 'Cell_Line', 'attributes': [{ 'name': 'tissue', 'type': 'list', 'values': ['Haematopoietic and Lymphoid', 'Lung', 'Stomach', 'Breast', 'Bone', 'Ovary', 'Skin', 'Head and Neck', 'Endometrium', 'Adrenal Gland', 'Central Nervous System', 'Pancreas', 'Prostate', 'Peripheral Nervous System', 'Large Intestine', 'Cervix', 'Kidney', 'Liver', 'Soft Tissue', 'Biliary Tract', 'Bladder', 'Esophagus', 'Testis', 'Thyroid', 'Vulva', 'Uterus', 'Small Intestine', 'Placenta'], 'valuesChange': ['Haematopoietic and Lymphoid', 'Lung', 'Stomach', 'Breast', 'Bone', 'Ovary', 'Skin', 'Head and Neck', 'Endometrium', 'Adrenal Gland', 'Central Nervous System', 'Pancreas', 'Prostate', 'Peripheral Nervous System', 'Large Intestine', 'Cervix', 'Kidney', 'Liver', 'Soft Tissue', 'Biliary Tract', 'Bladder', 'Esophagus', 'Testis', 'Thyroid', 'Vulva', 'Uterus', 'Small Intestine', 'Placenta'] }, { 'name': 'growth_properties', 'type': 'list', 'values': ['Suspension', 'Adherent', 'Unknown', 'Semi-Adherent'], 'valuesChange': ['Suspension', 'Adherent', 'Unknown', 'Semi-Adherent'] }, { 'name': 'cancer_type', 'type': 'list', 'values': ["B-Cell Non-Hodgkin's Lymphoma", 'Plasma Cell Myeloma', 'Acute Myeloid Leukemia', 'Other Solid Carcinomas', 'Gastric Carcinoma', 'T-Lymphoblastic Leukemia', 'Breast Carcinoma', "Ewing's Sarcoma", 'Ovarian Carcinoma', 'Melanoma', 'Head and Neck Carcinoma', 'Endometrial Carcinoma', 'Glioblastoma', 'Small Cell Lung Carcinoma', 'Pancreatic Carcinoma', 'Mesothelioma', 'B-Lymphoblastic Leukemia', 'Prostate Carcinoma', 'Neuroblastoma', 'Non-Small Cell Lung Carcinoma', 'Chronic Myelogenous Leukemia', "Burkitt's Lymphoma", 'Colorectal Carcinoma', 'Cervical Carcinoma', 'Oral Cavity Carcinoma', 'Kidney Carcinoma', 'Hepatocellular Carcinoma', 'Non-Cancerous', 'Biliary Tract Carcinoma', 'Glioma', 'Squamous Cell Lung Carcinoma', 'Bladder Carcinoma', 'Esophageal Squamous Cell Carcinoma', "Hodgkin's Lymphoma", 'Rhabdomyosarcoma', 'Thyroid Gland Carcinoma', "T-Cell Non-Hodgkin's Lymphoma", 'Esophageal Carcinoma', 'Other Blood Carcinomas', 'Osteosarcoma', 'Chondrosarcoma'], 'valuesChange': ["B-Cell Non-Hodgkin's Lymphoma", 'Plasma Cell Myeloma', 'Acute Myeloid Leukemia', 'Other Solid Carcinomas', 'Gastric Carcinoma', 'T-Lymphoblastic Leukemia', 'Breast Carcinoma', "Ewing's Sarcoma", 'Ovarian Carcinoma', 'Melanoma', 'Head and Neck Carcinoma', 'Endometrial Carcinoma', 'Glioblastoma', 'Small Cell Lung Carcinoma', 'Pancreatic Carcinoma', 'Mesothelioma', 'B-Lymphoblastic Leukemia', 'Prostate Carcinoma', 'Neuroblastoma', 'Non-Small Cell Lung Carcinoma', 'Chronic Myelogenous Leukemia', "Burkitt's Lymphoma", 'Colorectal Carcinoma', 'Cervical Carcinoma', 'Oral Cavity Carcinoma', 'Kidney Carcinoma', 'Hepatocellular Carcinoma', 'Non-Cancerous', 'Biliary Tract Carcinoma', 'Glioma', 'Squamous Cell Lung Carcinoma', 'Bladder Carcinoma', 'Esophageal Squamous Cell Carcinoma', "Hodgkin's Lymphoma", 'Rhabdomyosarcoma', 'Thyroid Gland Carcinoma', "T-Cell Non-Hodgkin's Lymphoma", 'Esophageal Carcinoma', 'Other Blood Carcinomas', 'Osteosarcoma', 'Chondrosarcoma'] }, { 'name': 'sample_treatment', 'type': 'list', 'values': ['Unknown', 'None', 'Chemotherapy;Radiotherapy', 'Chemotherapy', 'Radioiodine Therapy', 'Steroid', 'Radiotherapy'], 'valuesChange': ['Unknown', 'None', 'Chemotherapy;Radiotherapy', 'Chemotherapy', 'Radioiodine Therapy', 'Steroid', 'Radiotherapy'] }, { 'name': 'Cancer_type', 'type': 'list', 'values': ["B-Cell Non-Hodgkin's Lymphoma", 'Plasma Cell Myeloma', 'Acute Myeloid Leukemia', 'Carcinoid Tumour', 'Gastric Carcinoma', 'T-Lymphoblastic Leukemia', 'Breast Carcinoma', "Ewing's Sarcoma", 'Ovarian Carcinoma', 'Melanoma', 'Head and Neck Carcinoma', 'Endometrial Carcinoma', 'Other Solid Carcinomas', 'Glioblastoma', 'Small Cell Lung Carcinoma', 'Pancreatic Carcinoma', 'Mesothelioma', 'B-Lymphoblastic Leukemia', 'Prostate Carcinoma', 'Neuroblastoma', 'Non-Small Cell Lung Carcinoma', 'Chronic Myelogenous Leukemia', "Burkitt's Lymphoma", 'Colorectal Carcinoma', 'Cervical Carcinoma', 'Kidney Carcinoma', 'Hepatocellular Carcinoma', 'T-Lymphoblastic Lymphoma', 'Leiomyosarcoma', 'Non-Cancerous', 'Biliary Tract Carcinoma', 'Glioma', 'Bladder Carcinoma', 'Esophageal Carcinoma', "Hodgkin's Lymphoma", 'Other Blood Cancers', 'Other Sarcomas', 'Rhabdomyosarcoma', 'Thyroid Gland Carcinoma', "T-Cell Non-Hodgkin's Lymphoma", 'Vulvar carcinoma', 'Hairy Cell Leukemia', 'Osteosarcoma', 'Chondrosarcoma', 'Uncertain'], 'valuesChange': ["B-Cell Non-Hodgkin's Lymphoma", 'Plasma Cell Myeloma', 'Acute Myeloid Leukemia', 'Carcinoid Tumour', 'Gastric Carcinoma', 'T-Lymphoblastic Leukemia', 'Breast Carcinoma', "Ewing's Sarcoma", 'Ovarian Carcinoma', 'Melanoma', 'Head and Neck Carcinoma', 'Endometrial Carcinoma', 'Other Solid Carcinomas', 'Glioblastoma', 'Small Cell Lung Carcinoma', 'Pancreatic Carcinoma', 'Mesothelioma', 'B-Lymphoblastic Leukemia', 'Prostate Carcinoma', 'Neuroblastoma', 'Non-Small Cell Lung Carcinoma', 'Chronic Myelogenous Leukemia', "Burkitt's Lymphoma", 'Colorectal Carcinoma', 'Cervical Carcinoma', 'Kidney Carcinoma', 'Hepatocellular Carcinoma', 'T-Lymphoblastic Lymphoma', 'Leiomyosarcoma', 'Non-Cancerous', 'Biliary Tract Carcinoma', 'Glioma', 'Bladder Carcinoma', 'Esophageal Carcinoma', "Hodgkin's Lymphoma", 'Other Blood Cancers', 'Other Sarcomas', 'Rhabdomyosarcoma', 'Thyroid Gland Carcinoma', "T-Cell Non-Hodgkin's Lymphoma", 'Vulvar carcinoma', 'Hairy Cell Leukemia', 'Osteosarcoma', 'Chondrosarcoma', 'Uncertain'] }, { 'name': 'Tissue_type', 'type': 'list', 'values': ['Haematopoietic and Lymphoid', 'Lung', 'Stomach', 'Breast', 'Bone', 'Ovary', 'Skin', 'Head and Neck', 'Endometrium', 'Adrenal Gland', 'Central Nervous System', 'Pancreas', 'Prostate', 'Peripheral Nervous System', 'Other tissue', 'Large Intestine', 'Cervix', 'Kidney', 'Liver', 'Soft Tissue', 'Biliary Tract', 'Bladder', 'Esophagus', 'Testis', 'Thyroid', 'Vulva', 'Small Intestine', 'Placenta'], 'valuesChange': ['Haematopoietic and Lymphoid', 'Lung', 'Stomach', 'Breast', 'Bone', 'Ovary', 'Skin', 'Head and Neck', 'Endometrium', 'Adrenal Gland', 'Central Nervous System', 'Pancreas', 'Prostate', 'Peripheral Nervous System', 'Other tissue', 'Large Intestine', 'Cervix', 'Kidney', 'Liver', 'Soft Tissue', 'Biliary Tract', 'Bladder', 'Esophagus', 'Testis', 'Thyroid', 'Vulva', 'Small Intestine', 'Placenta'] }, { 'name': 'msi_status', 'type': 'list', 'values': ['MSS', 'MSI'], 'valuesChange': ['MSS', 'MSI'] }, { 'name': 'sample_treatment_details', 'type': 'list', 'values': ['adriamycin and taxol', '5 years with Busulfan (1979-1984)', 'transcatheter arterial embolization with lipoidol plus doxorubicin', 'Cisplatin', 'treated by transcatheter arterial embolization with lipoidol plus a combination of doxorubicin and mitomycin C', 'Three courses of CAP; cyclophosphamide, adriamycin and cisplatin. Three courses of etoposide and cisplatin.', 'Six courses of CAP; cyclophosphamide, adriamycin and cis-platinum.', '5-FU', 'Cyclophosphamide', 'yclophosphamide, hydroxydaunomycin, vincristine, and prednisone (CHOP chemotherapy)', '7 year chlorambucil', '5-FU + Doxorubicin + Mitomycin C', '5 fluorouracil, doxorubicin and mitomycin C', 'Five courses of CAP; cyclophosphamide, adriamycin and cis-platinum.', '3 cycles of chemotherapy treatment with eroposide, colchicine, methotrexate and vincristine', 'The patient had received sequential treatment with cisplatin and cyclophosphamide, cisplatin and etoposide and subsequently tamoxifen', 'chlorambucil.', 'cytoxan, bleomycin and adriamycin', 'cisplatin, 5-fluorouracil and chlorambucil treatment.', 'The patient was treated with RTG, methotrexate, adriamycin, vincristine, cytoxan, and aramycin C', 'The patient was treated with cytoxan, vincristine, methotrexate and radiation therapy'], 'valuesChange': ['adriamycin and taxol', '5 years with Busulfan (1979-1984)', 'transcatheter arterial embolization with lipoidol plus doxorubicin', 'Cisplatin', 'treated by transcatheter arterial embolization with lipoidol plus a combination of doxorubicin and mitomycin C', 'Three courses of CAP; cyclophosphamide, adriamycin and cisplatin. Three courses of etoposide and cisplatin.', 'Six courses of CAP; cyclophosphamide, adriamycin and cis-platinum.', '5-FU', 'Cyclophosphamide', 'yclophosphamide, hydroxydaunomycin, vincristine, and prednisone (CHOP chemotherapy)', '7 year chlorambucil', '5-FU + Doxorubicin + Mitomycin C', '5 fluorouracil, doxorubicin and mitomycin C', 'Five courses of CAP; cyclophosphamide, adriamycin and cis-platinum.', '3 cycles of chemotherapy treatment with eroposide, colchicine, methotrexate and vincristine', 'The patient had received sequential treatment with cisplatin and cyclophosphamide, cisplatin and etoposide and subsequently tamoxifen', 'chlorambucil.', 'cytoxan, bleomycin and adriamycin', 'cisplatin, 5-fluorouracil and chlorambucil treatment.', 'The patient was treated with RTG, methotrexate, adriamycin, vincristine, cytoxan, and aramycin C', 'The patient was treated with cytoxan, vincristine, methotrexate and radiation therapy'] }, { 'name': 'COSMIC_ID', 'type': 'num', 'min': 683667.0, 'max': 1789883.0, 'minChange': 683667.0, 'maxChange': 1789883.0 }, { 'name': 'master_cell_id', 'type': 'num', 'min': 1.0, 'max': 2266.0, 'minChange': 1.0, 'maxChange': 2266.0 }, { 'name': 'cell_line_name', 'type': 'num', 'min': 697.0, 'max': 5637.0, 'minChange': 697.0, 'maxChange': 5637.0 }, { 'name': 'model_name', 'type': 'num', 'min': 697.0, 'max': 5637.0, 'minChange': 697.0, 'maxChange': 5637.0 }, { 'name': 'name', 'type': 'num', 'min': 697.0, 'max': 5637.0, 'minChange': 697.0, 'maxChange': 5637.0 }] }, { 'name': 'Protein', 'attributes': [] }, { 'name': 'Drug', 'attributes': [{ 'name': 'target_pathway', 'type': 'list', 'values': ['p53 pathway', 'Chromatin other', 'EGFR signaling', 'Protein stability and degradation', 'Other, kinases', 'RTK signaling', 'WNT signaling', 'Mitosis', 'PI3K/MTOR signaling', 'Other', 'Apoptosis regulation', 'Chromatin histone methylation', 'DNA replication', 'Metabolism', 'Cell cycle', 'Genome integrity', 'ERK MAPK signaling', 'IGF1R signaling', 'Cytoskeleton', 'Chromatin histone acetylation', 'JNK and p38 signaling', 'ABL signaling', 'Hormone-related', 'Unclassified'], 'valuesChange': ['p53 pathway', 'Chromatin other', 'EGFR signaling', 'Protein stability and degradation', 'Other, kinases', 'RTK signaling', 'WNT signaling', 'Mitosis', 'PI3K/MTOR signaling', 'Other', 'Apoptosis regulation', 'Chromatin histone methylation', 'DNA replication', 'Metabolism', 'Cell cycle', 'Genome integrity', 'ERK MAPK signaling', 'IGF1R signaling', 'Cytoskeleton', 'Chromatin histone acetylation', 'JNK and p38 signaling', 'ABL signaling', 'Hormone-related', 'Unclassified'] }, { 'name': 'drug_owner', 'type': 'list', 'values': ['GDSC', 'AZ', 'MGH', 'AZ_GDSC', 'Nathanael.Gray', 'SGC', 'Mike.Olson', 'Ed.Tate', 'baylor.college.of.medicine.peggy.goodell'], 'valuesChange': ['GDSC', 'AZ', 'MGH', 'AZ_GDSC', 'Nathanael.Gray', 'SGC', 'Mike.Olson', 'Ed.Tate', 'baylor.college.of.medicine.peggy.goodell'] }, { 'name': 'webrelease', 'type': 'list', 'values': ['Y', 'N'], 'valuesChange': ['Y', 'N'] }, { 'name': 'PUBCHEM', 'type': 'num', 'min': 1018.0, 'max': 126689157.0, 'minChange': 1018.0, 'maxChange': 126689157.0 }, { 'name': 'drug_id', 'type': 'num', 'min': 17.0, 'max': 2510.0, 'minChange': 17.0, 'maxChange': 2510.0 }] }], 'relationships': [{ 'name': 'HAS_PROTEIN_6692', 'n1': 'Cell_Line', 'n2': 'Protein', 'attributes': [{ 'name': 'Protein_Intensity', 'type': 'num', 'min': -4.058114592328761, 'max': 15.503639324498378, 'minChange': -4.058114592328761, 'maxChange': 15.503639324498378 }] }, { 'name': 'HAS_PROTEIN_8498', 'n1': 'Cell_Line', 'n2': 'Protein', 'attributes': [{ 'name': 'Protein_Intensity', 'type': 'num', 'min': -5.444587739880729, 'max': 15.652689341072046, 'minChange': -5.444587739880729, 'maxChange': 15.652689341072046 }] }, { 'name': 'TESTED_ON', 'n1': 'Drug', 'n2': 'Cell_Line', 'attributes': [{ 'name': 'dataset', 'type': 'list', 'values': ['GDSC1', 'GDSC2'], 'valuesChange': ['GDSC1', 'GDSC2'] }, { 'name': 'AUC', 'type': 'num', 'min': 0.0055058589737584365, 'max': 0.9999639441639192, 'minChange': 0.0055058589737584365, 'maxChange': 0.9999639441639192 }, { 'name': 'ln_IC50', 'type': 'num', 'min': -10.579286628308195, 'max': 12.359001840287563, 'minChange': -10.579286628308195, 'maxChange': 12.359001840287563 }, { 'name': 'num_replicates', 'type': 'num', 'min': 1.0, 'max': 181.0, 'minChange': 1.0, 'maxChange': 181.0 }, { 'name': 'max_screening_conc', 'type': 'num', 'min': 0.001, 'max': 4000.0, 'minChange': 0.001, 'maxChange': 4000.0 }, { 'name': 'RMSE', 'type': 'num', 'min': 0.001485906910673817, 'max': 0.2999572668734664, 'minChange': 0.001485906910673817, 'maxChange': 0.2999572668734664 }] }, { 'name': 'ASSOCIATION', 'n1': 'Drug', 'n2': 'Protein', 'attributes': [{ 'name': 'GDSC', 'type': 'list', 'values': ['GDSC2', 'GDSC1'], 'valuesChange': ['GDSC2', 'GDSC1'] }, { 'name': 'skew', 'type': 'num', 'min': -4.106193002139706, 'max': 1.9878671232784333, 'minChange': -4.106193002139706, 'maxChange': 1.9878671232784333 }, { 'name': 'r2', 'type': 'num', 'min': 0.1013839670288539, 'max': 0.7734339936656506, 'minChange': 0.1013839670288539, 'maxChange': 0.7734339936656506 }, { 'name': 'ppi', 'type': 'num', 'min': 1.0, 'max': 4.0, 'minChange': 1.0, 'maxChange': 4.0 }, { 'name': 'drug_id', 'type': 'num', 'min': 1.0, 'max': 2510.0, 'minChange': 1.0, 'maxChange': 2510.0 }, { 'name': 'nc_pval', 'type': 'num', 'min': 7.84946148385623e-43, 'max': 1.0, 'minChange': 7.84946148385623e-43, 'maxChange': 1.0 }, { 'name': 'nc_fdr', 'type': 'num', 'min': 4.341537146720881e-39, 'max': 1.0, 'minChange': 4.341537146720881e-39, 'maxChange': 1.0 }, { 'name': 'nc_beta', 'type': 'num', 'min': -2.19763946136419, 'max': 2.185802362170413, 'minChange': -2.19763946136419, 'maxChange': 2.185802362170413 }, { 'name': 'nc_lr', 'type': 'num', 'min': -7.503331289626658e-12, 'max': 188.20184113361572, 'minChange': -7.503331289626658e-12, 'maxChange': 188.20184113361572 }, { 'name': 'pval', 'type': 'num', 'min': 1.0023245614279191e-15, 'max': 0.9999987968766584, 'minChange': 1.0023245614279191e-15, 'maxChange': 0.9999987968766584 }, { 'name': 'fdr', 'type': 'num', 'min': 5.548868772064962e-12, 'max': 0.9999987968766584, 'minChange': 5.548868772064962e-12, 'maxChange': 0.9999987968766584 }, { 'name': 'lr', 'type': 'num', 'min': 2.273736754432321e-12, 'max': 64.42588874796547, 'minChange': 2.273736754432321e-12, 'maxChange': 64.42588874796547 }, { 'name': 'covs', 'type': 'num', 'min': 19.0, 'max': 22.0, 'minChange': 19.0, 'maxChange': 22.0 }, { 'name': 'n', 'type': 'num', 'min': 61.0, 'max': 916.0, 'minChange': 61.0, 'maxChange': 916.0 }, { 'name': 'beta', 'type': 'num', 'min': -1.9500100915153256, 'max': 2.57257140936904, 'minChange': -1.9500100915153256, 'maxChange': 2.57257140936904 }] }] });

  const drugTargetAlgorithms = ['Betweenness centrality', 'TrustRank', 'Harmonic Centrality', 'Degree Centrality'];
  const [usePanCanAssociationDefinition, setUsePanCanAssociationDefinition] = useState(true);
  const [groupingDataset, setGroupingDataset] = useState('GDSC1');
  const [groupingSimilarity, setGroupingSimilarity] = useState('Drug-Drug');
  const [groupingGroup, setGroupingGroup] = useState('tSNE');
  const [shortestPathAllowedConnections, setShortestPathAllowedConnections] = useState([]);
  const [isCheckedAbsolut, setIsCheckedAbsolut] = useState(false);


  const clusterNamesMatching = [['Drug-Drug GDSC1 Cosine tSNE global', 'GDSC1', 'Drug-Drug', 'tSNE'],
  ['Drug-Drug GDSC2 Cosine tSNE global', 'GDSC2', 'Drug-Drug', 'tSNE'],
  ['Drug-Drug GDSC1 Cosine Isomap', 'GDSC1', 'Drug-Drug', 'Isomap with few neighbours'],
  ['Drug-Drug GDSC2 Cosine Isomap', 'GDSC2', 'Drug-Drug', 'Isomap with few neighbours'],
  ['Drug-Drug GDSC1 Cosine Isomap global', 'GDSC1', 'Drug-Drug', 'Isomap with many neighbours'],
  ['Drug-Drug GDSC2 Cosine Isomap global', 'GDSC2', 'Drug-Drug', 'Isomap with many neighbours'],
  ['Drug-Drug GDSC1 Cosine Louvain', 'GDSC1', 'Drug-Drug', 'Louvain with large communities'],
  ['Drug-Drug GDSC2 Cosine Louvain', 'GDSC2', 'Drug-Drug', 'Louvain with large communities'],
  ['Drug-Drug GDSC1 Cosine Louvain more communities', 'GDSC1', 'Drug-Drug', 'Louvain with small communities'],
  ['Drug-Drug GDSC2 Cosine Louvain more communities', 'GDSC2', 'Drug-Drug', 'Louvain with small communities'],
  ['Drug-Drug GDSC1 Cosine Umap local', 'GDSC1', 'Drug-Drug', 'UMAP with few neighbours'],
  ['Drug-Drug GDSC2 Cosine Umap local', 'GDSC2', 'Drug-Drug', 'UMAP with few neighbours'],
  ['Drug-Drug GDSC1 Cosine Umap global', 'GDSC1', 'Drug-Drug', 'UMAP with many neighbours'],
  ['Drug-Drug GDSC2 Cosine Umap global', 'GDSC2', 'Drug-Drug', 'UMAP with many neighbours'],
  ['Drug-Drug GDSC1 Cosine Umap', 'GDSC1', 'Drug-Drug', 'UMAP with moderate number of neighbours'],
  ['Drug-Drug GDSC2 Cosine Umap', 'GDSC2', 'Drug-Drug', 'UMAP with moderate number of neighbours'],
  ['Drug-Protein GDSC1 tSNE local', 'GDSC1', 'Drug-Protein', 'tSNE with low Perplexity'],
  ['Drug-Protein GDSC2 tSNE local', 'GDSC2', 'Drug-Protein', 'tSNE with low Perplexity'],
  ['Drug-Protein GDSC1 tSNE global', 'GDSC1', 'Drug-Protein', 'tSNE with high Perplexity'],
  ['Drug-Protein GDSC2 tSNE global', 'GDSC2', 'Drug-Protein', 'tSNE with high Perplexity'],
  ['Drug-Protein GDSC1 Isomap local', 'GDSC1', 'Drug-Protein', 'Isomap with few neighbours'],
  ['Drug-Protein GDSC1 Isomap global', 'GDSC1', 'Drug-Protein', 'Isomap with many neighbours'],
  ['Drug-Protein GDSC2 Isomap local', 'GDSC2', 'Drug-Protein', 'Isomap with few neighbours'],
  ['Drug-Protein GDSC2 Isomap global', 'GDSC2', 'Drug-Protein', 'Isomap with many neighbours'],
  ['Drug-Protein GDSC1 Louvain global', 'GDSC1', 'Drug-Protein', 'Louvain with small communities'],
  ['Drug-Protein GDSC1 Louvain local', 'GDSC1', 'Drug-Protein', 'Louvain with large communities'],
  ['Drug-Protein GDSC2 Louvain global', 'GDSC2', 'Drug-Protein', 'Louvain with small communities'],
  ['Drug-Protein GDSC2 Louvain local', 'GDSC2', 'Drug-Protein', 'Louvain with large communities'],
  ['Drug-Protein GDSC1 Umap local', 'GDSC1', 'Drug-Protein', 'UMAP with few neighbours'],
  ['Drug-Protein GDSC2 Umap local', 'GDSC2', 'Drug-Protein', 'UMAP with few neighbours'],
  ['Drug-Protein GDSC1 Umap global', 'GDSC1', 'Drug-Protein', 'UMAP with many neighbours'],
  ['Drug-Protein GDSC2 Umap global', 'GDSC2', 'Drug-Protein', 'UMAP with many neighbours'],
  ['Drug-Protein GDSC1 Umap', 'GDSC1', 'Drug-Protein', 'UMAP with moderate number of neighbours'],
  ['Drug-Protein GDSC2 Umap', 'GDSC2', 'Drug-Protein', 'UMAP with moderate number of neighbours']

  ];
  const handleGroupingDatasetChange = (value) => {
    setGroupingDataset(value);
  };
  const handleGroupingSimilarityChange = (value) => {
    setGroupingSimilarity(value);
  };
  const handleGroupingGroupChange = (value) => {
    setGroupingGroup(value);
  };
  const handleApplyClustering = () => {
    for (let i = 0; i < clusterNamesMatching.length; i++) {
      if (clusterNamesMatching[i][1] === groupingDataset && clusterNamesMatching[i][2] === groupingSimilarity && clusterNamesMatching[i][3] === groupingGroup) {
        applyCluster(clusterNamesMatching[i][0]);
        break;
      }
    }
  };
  const handleRemoveClustering = () => {
    applyRemoveCluster(true);
  };

  useEffect(() => {
    // Update graphInformation with setAllInfo once it's available
    if (setAllInfo) {
      if (initialSetInfo) {
        setInitialSetInfo(false);
      }

    }
  }, [setAllInfo]);
  const showModal = () => {
    setIsModalOpen(true);
    setSelectedEntity1(null);
    setSelectedEntity2(null);
    setSelectedEntity3(null);
    setResultSize(20);
    setConnectionOptions([]);
  };
  const showModalShortestPath = () => {
    setIsModalShortestPath(true);
    var get_rel = [];
    for (let i = 0; i < allEntitiesConnections.length; i++) {
      get_rel.push(...allEntitiesConnections[i][2]);
    }
    setShortestPathAllowedConnections(get_rel);
  }
  const showModalFindTargets = () => {
    setIsModalFindTargetsOpen(true);
    setSelectedDrugTargetAlgorithmus('Betweenness centrality');
    setResultSize(20);
    sethubPenality(0);
  }
  const handleResultSize = (newValue) => {
    setResultSize(newValue);
  };
  const handleOrderAttribute = (newValue) => {
    setOrderAttribute(newValue);
  };
  const namesToRemove = ["uid", "uid_0", "uid (BioGRID)", "project id", "project id (BioGRID)", "small", "project_id_0", "project_id", "id", "drug protein community louvain y", "drug protein community louvain x", "communityId", "model type", "webrelease", "use in publications", "drug_type_number","drug type number", "target", "source", "SWISS PROT Accessions Interactor","entry name2", "indicator", "ATC", "ATC number","PanCan Synonymes"];
  //delete "_" from the column names
  const cleanUpInformation = (c) => {
    return c.filter(item => {
      // Replace underscores in the renam
      var isLink = false;
      if (item.Name === "CHEMBL") {
        item.LinkText = item.Value;
        item.Link = "https://www.ebi.ac.uk/chembl/compound_report_card/" + item.Value;
      }
      if (item.Name === "DrugBank") {
        item.LinkText = item.Value;
        item.Link = "https://go.drugbank.com/drugs/" + item.Value;
      }
      if (item.Name === "PUBCHEM") {
        item.LinkText = item.Value;
        item.Link = "https://pubchem.ncbi.nlm.nih.gov/compound/" + item.Value;
      }
      if (item.Name === "COSMIC ID") {
        item.LinkText = item.Value;
        item.Link = "https://cancer.sanger.ac.uk/cosmic/sample/overview?id=" + item.Value;
      }
      if (item.Name === "SIDM") {
        item.LinkText = item.Value;
        item.Link = "https://cellmodelpassports.sanger.ac.uk/passports/" + item.Value;
      }
      if (item.Name === "RRID") {
        item.LinkText = item.Value;
        item.Link = "https://www.cellosaurus.org/" + item.Value;
      }
      if (item.Name === "BROAD ID") {
        item.LinkText = item.Value;
        item.Link = "https://depmap.org/portal/cell_line/" + item.Value;
      }
      if (item.Name === "Publication Sources"){
        item.Value = item.Value.replace(/,/g, '\n');
        console.log("184 ", item.Value, typeof(item.Value));
      }
      if (item.Name === "name_0") {
        for (let i = 0; i < c.length; i++) {
          if (c[i].Name === "name") {
            if (c[i].Value === item.Value) {
              return false;
            }
            break;
          }

        }
      }
      if (item.Name === "SWISS_PROT_Accessions_Interactor_0" || item.Name === "SWISS PROT Accessions Interactor (BioGRID)") {
        console.log("91", item.Name);
        for (let i = 0; i < c.length; i++) {
          if (c[i].Name === "swiss") {
            if (c[i].Value === item.Value[0]) {
              return false;
            }
            break;
          }

        }
      }
      if (item.Name === "entry_name2" || item.Name === "entry name2") {
        console.log("91", item.Name);
        for (let i = 0; i < c.length; i++) {
          if (c[i].Name === "entry name") {
            if (c[i].Value === item.Value) {
              return false;
            }
            break;
          }

        }
      }
      if (item.Name === "Entrez Gene Interactor (BioGRID)") {
        console.log("91", item.Name);
        for (let i = 0; i < c.length; i++) {
          if (c[i].Name === "Entrez") {
            if (c[i].LinkText === item.Value) {
              return false;
            }
            break;
          }

        }
      }
      // Keep the item if its name is not in the namesToRemove array
      var isNameValid = !namesToRemove.includes(item.Name);
      if (isNameValid) {
        isNameValid = !(item.Name.includes('drug_protein') || item.Name.includes('drug_drug') || item.Name.includes('drug protein') || item.Name.includes('drug drug'));
      }
      //console.log("isNameValid", isNameValid, item.Name);
      item.Name = item.Name.replace(/_/g, ' ');
      item.Name = item.Name.replace(/ (\d+)$/, '');
      if (item.Name.slice(-2) === '_0') {
        // Remove the last character and append '(BioGRID)'
        item.Name = item.Name.slice(0, -1) + '(BioGRID)';
      }
      // Check if the item's value is neither empty nor "-"
      const isValueValid = item.Value !== "" &&
        item.Value !== "-" &&
        !(Array.isArray(item.Value) && item.Value.length === 1 && item.Value[0] === "-") &&
        !(Array.isArray(item.Value) && item.Value.length === 0);
      if ('LinkText' in item) {
        if (item.LinkText.length > 0) {
          isLink = true;
        }
      }

      // Keep the item only if both name and value are valid
      return isNameValid && (isValueValid || isLink);
    });
  };


  /**
   * Used to update Advanced Filter silder changes
   * @param {*} type 
   * @param {*} typeName 
   * @param {*} propertyName 
   * @param {*} value 
   */
  const handleSliderChangeFilter = (type, typeName, propertyName, value) => {
    var copyFilterGraphInformation = [...filterGraphInformation];
    const hasEntity = copyFilterGraphInformation.findIndex((c) => c.type === typeName);
    if (hasEntity !== -1) {
      const hasAttribute = copyFilterGraphInformation[hasEntity].attributes.findIndex((c) => c.name === propertyName);
      if (hasAttribute !== -1) {
        copyFilterGraphInformation[hasEntity].attributes[hasAttribute].list = value;
      } else {
        copyFilterGraphInformation[hasEntity].attributes.push({ name: propertyName, type: 'num', list: value });
      }
    } else {
      copyFilterGraphInformation.push({ type: typeName, attributes: [{ name: propertyName, type: 'num', list: value }] });
    }
    setFilterGraphInformation(copyFilterGraphInformation);

    if (type === "nodes") {
      const updatedNodes = filterInfo.nodes.map((node) => {
        if (node.name === typeName) {
          const updatedAttributes = node.attributes.map((attribute) => {
            if (attribute.name === propertyName) {
              return {
                ...attribute,
                minChange: value[0], // Update min value
                maxChange: value[1], // Update max value
              };
            }
            return attribute;
          });

          // Return the node with updated attributes
          return { ...node, attributes: updatedAttributes };
        }
        return node;
      });

      // Update the graphInformation state with the updated nodes
      setFilterInfo({
        ...filterInfo,
        nodes: updatedNodes,
      });
    } else {
      const updatedNodes = filterInfo.relationships.map((node) => {
        if (node.name === typeName) {
          const updatedAttributes = node.attributes.map((attribute) => {
            if (attribute.name === propertyName) {
              return {
                ...attribute,
                minChange: value[0], // Update min value
                maxChange: value[1], // Update max value
              };
            }
            return attribute;
          });

          // Return the node with updated attributes
          return { ...node, attributes: updatedAttributes };
        }
        return node;
      });

      // Update the graphInformation state with the updated nodes
      setFilterInfo({
        ...filterInfo,
        relationships: updatedNodes,
      });
    }
  };

  /**
   * update slider change values
   * @param {*} type 
   * @param {*} typeName 
   * @param {*} propertyName 
   * @param {*} value 
   */
  const handleSliderChange = (type, typeName, propertyName, value) => {
    if (type === "nodes") {
      const updatedNodes = graphInformation.nodes.map((node) => {
        if (node.name === typeName) {
          const updatedAttributes = node.attributes.map((attribute) => {
            if (attribute.name === propertyName) {
              return {
                ...attribute,
                minChange: value[0], // Update min value
                maxChange: value[1], // Update max value
              };
            }
            return attribute;
          });

          // Return the node with updated attributes
          return { ...node, attributes: updatedAttributes };
        }
        return node;
      });

      // Update the graphInformation state with the updated nodes
      setGraphInformation({
        ...graphInformation,
        nodes: updatedNodes,
      });
    } else {
      const updatedNodes = graphInformation.relationships.map((node) => {
        if (node.name === typeName) {
          const updatedAttributes = node.attributes.map((attribute) => {
            if (attribute.name === propertyName) {
              return {
                ...attribute,
                minChange: value[0], // Update min value
                maxChange: value[1], // Update max value
              };
            }
            return attribute;
          });

          // Return the node with updated attributes
          return { ...node, attributes: updatedAttributes };
        }
        return node;
      });

      // Update the graphInformation state with the updated nodes
      setGraphInformation({
        ...graphInformation,
        relationships: updatedNodes,
      });
    }
  };

  /**
   * Refresh the displayed graph after a certain amount of time has passed following the adjustment of new filter settings
   */
  useEffect(() => {
    // This effect will run whenever sliderValue changes
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }

    const newTimeout = setTimeout(() => {
      updateWebsite(); // Call your updater function here
    }, 500);

    // Update the timeout state
    setUpdateTimeout(newTimeout);
  }, [filterInfo]);

  /**
   * set what filter options should be shown based on the graph
   */
  useEffect(() => {
    if (allInformation) {
      console.log("422");
      var edge_info = [];
      for (let i = 0; i < allInformation[0].length; i++) {
        const start_node = allInformation[0][i].NodeLabel.split("-", 2)[0];
        const end_node = allInformation[0][i].NodeLabel.split("-", 2)[1];
        const connection_name = allInformation[0][i].RelationshipType;
        var already_exist = false;
        for (let j = 0; j < edge_info.length; j++) {
          if (start_node === edge_info[j][0] && end_node === edge_info[j][1]) {
            edge_info[j][2].push(connection_name);
            already_exist = true;
            break;
          }
        }
        if (!already_exist) {
          edge_info.push([start_node, end_node, [connection_name]]);
        }
      }
      setAllEntitiesConnections(edge_info);
      setAllEntities(allInformation[1]);
      var set_info_stuff = allInformation.slice(2)[0];

      for (let i = 0; i < set_info_stuff.relationships.length; i++) {
        const con_name = set_info_stuff.relationships[i].name;
        for (let j = 0; j < edge_info.length; j++) {
          for (let k = 0; k < edge_info[j][2].length; k++) {
            if (con_name === edge_info[j][2][k]) {
              set_info_stuff.relationships[i].n1 = edge_info[j][0];
              set_info_stuff.relationships[i].n2 = edge_info[j][1];
            }
          }
        }
      }
      setGraphInformation(set_info_stuff);
      setFilterInfo(set_info_stuff);
    }
  }, [allInformation]);



  const handleCheckboxChangeAbsolut = (e) => {
    setIsCheckedAbsolut(e.target.checked);
  };
  /**
   * handle changes for list filter items
   * @param {*} type 
   * @param {*} typeName 
   * @param {*} propertyName 
   * @param {*} value 
   */
  const handleSelectChange = (type, typeName, propertyName, value) => {
    if (type === "nodes") {
      const updatedNodes = graphInformation.nodes.map((node) => {
        if (node.name === typeName) {
          const updatedAttributes = node.attributes.map((attribute) => {
            if (attribute.name === propertyName) {
              return {
                ...attribute,
                valuesChange: value,
              };
            }
            return attribute;
          });

          // Return the node with updated attributes
          return { ...node, attributes: updatedAttributes };
        }
        return node;
      });

      // Update the graphInformation state with the updated nodes
      setGraphInformation({
        ...graphInformation,
        nodes: updatedNodes,
      });
    } else {
      const updatedNodes = graphInformation.relationships.map((node) => {
        if (node.name === typeName) {
          const updatedAttributes = node.attributes.map((attribute) => {
            if (attribute.name === propertyName) {
              return {
                ...attribute,
                valuesChange: value,
              };
            }
            return attribute;
          });

          // Return the node with updated attributes
          return { ...node, attributes: updatedAttributes };
        }
        return node;
      });

      // Update the graphInformation state with the updated nodes
      setGraphInformation({
        ...graphInformation,
        relationships: updatedNodes,
      });
    }
  };

  /**
   * handle changes for list filter items and ad new list properties
   * @param {*} type 
   * @param {*} typeName 
   * @param {*} propertyName 
   * @param {*} value 
   */
  const handleSelectChangeFilter = (type, typeName, propertyName, value) => {
    var copyFilterGraphInformation = [...filterGraphInformation];
    const hasEntity = copyFilterGraphInformation.findIndex((c) => c.type === typeName);
    if (hasEntity !== -1) {
      const hasAttribute = copyFilterGraphInformation[hasEntity].attributes.findIndex((c) => c.name === propertyName);
      if (hasAttribute !== -1) {
        copyFilterGraphInformation[hasEntity].attributes[hasAttribute].list = value;
      } else {
        copyFilterGraphInformation[hasEntity].attributes.push({ name: propertyName, type: 'list', list: value });
      }
    } else {
      copyFilterGraphInformation.push({ type: typeName, attributes: [{ name: propertyName, type: 'list', list: value }] });
    }
    setFilterGraphInformation(copyFilterGraphInformation);

    if (type === "nodes") {
      const updatedNodes = filterInfo.nodes.map((node) => {
        if (node.name === typeName) {
          const updatedAttributes = node.attributes.map((attribute) => {
            if (attribute.name === propertyName) {
              return {
                ...attribute,
                valuesChange: value,
              };
            }
            return attribute;
          });

          // Return the node with updated attributes
          return { ...node, attributes: updatedAttributes };
        }
        return node;
      });

      // Update the filterInfo state with the updated nodes
      setFilterInfo({
        ...filterInfo,
        nodes: updatedNodes,
      });
    } else {
      const updatedNodes = filterInfo.relationships.map((node) => {
        if (node.name === typeName) {
          const updatedAttributes = node.attributes.map((attribute) => {
            if (attribute.name === propertyName) {
              return {
                ...attribute,
                valuesChange: value,
              };
            }
            return attribute;
          });

          // Return the node with updated attributes
          return { ...node, attributes: updatedAttributes };
        }
        return node;
      });

      // Update the filterInfo state with the updated nodes
      setFilterInfo({
        ...filterInfo,
        relationships: updatedNodes,
      });
    }
  };


  /**
   * Check of a type of node is selected
   */
  const filteredTypes = allEntities.filter((type) =>
    selectedNodes.some((node) => node.label === type)
  );

  /**
   * Set connection options
   * @param {*} arr 
   * @param {*} str1 
   * @param {*} str2 
   */
  const findArray = (arr, str1, str2) => {
    setSelectedEntity3(null)
    var foundArray = true;
    for (let i = 0; i < arr.length; i++) {
      if (
        (arr[i][0] === str1 && arr[i][1] === str2) ||
        (arr[i][0] === str2 && arr[i][1] === str1)
      ) {
        foundArray = false;
        setConnectionOptions(arr[i][2]);
      }
    }
    if (foundArray) {
      setConnectionOptions([]);
    }
  };


  /**
   * Calculate betweeness centrality
   * @param {*} all_seed_uids 
   */
  const betweeness_centrality = async (all_seed_uids) => {
    const startTime = performance.now();
    var all_info = [];
    var all_direct = [];

    const driver = neo4j.driver("neo4j://localhost:7687", neo4j.auth.basic("neo4j", "workwork"));
    const session = driver.session();
    const globalSet = new Set();
    for (let i = 0; i < all_seed_uids.length; i++) {
      for (let j = i + 1; j < all_seed_uids.length; j++) {
        const source_uid = all_seed_uids[i];
        const target_uid = all_seed_uids[j];

        var match_short = "MATCH (p1:Protein { uid: '" + source_uid + "'}), (p2:Protein { uid: '" + target_uid + "' })\nMATCH path = allShortestPaths((p1)-[:PPI*]-(p2))";
        var degree_con = "";

        if (maximumDegree > 0) {
          degree_con = "\nWHERE ALL(node IN nodes(path)[1..-1] WHERE node.out_degree <= " + JSON.stringify(maximumDegree) + ") AND NOT (node.name CONTAINS  ',')";
        } else {
          degree_con = "\nWITH nodes(path) AS allNodes, relationships(path) AS pathRelationships\nWHERE ALL(node IN allNodes[1..-1] WHERE NOT (node.name CONTAINS ','))";
        }
        var returnValues = "\nWITH allNodes AS intermediateNodes, pathRelationships\nRETURN [node in intermediateNodes | node.uid] AS nodeUID, [rel in pathRelationships | rel.uid] AS relUID";

        var match_query = match_short + degree_con + returnValues;
        const result = await session.run(match_query);
        var numberOfShortestPaths = result.records.length;
        var all_nodes = [];

        result.records.forEach(record => {
          const nodeUID = record.get('nodeUID');
          const relUID = record.get('relUID');
          if (nodeUID.length > 0) {
            all_nodes = all_nodes.concat(nodeUID.slice(1, -1));
            all_info.push([nodeUID, relUID]);
          }

        });

        var get_direct_connection = "MATCH (p1:Protein { uid: '" + source_uid + "'})-[r:PPI]-(p2:Protein { uid: '" + target_uid + "' }) RETURN r.uid AS direct_uid LIMIT 1";
        const result_direct = await session.run(get_direct_connection);
        if (result_direct.records.length > 0) {
          const result_uid_direct = result_direct.records[0].get('direct_uid');
          all_direct.push(result_uid_direct);
        }

        if (all_nodes.length > 0) {
          const nodeUIDCount = all_nodes.reduce((acc, nodeUID) => {
            acc[nodeUID] = (acc[nodeUID] || 0) + 1;
            return acc;
          }, {});
          Object.entries(nodeUIDCount).forEach(([nodeUID, count]) => {
            const adjustedValue = count / numberOfShortestPaths;

            // Check if nodeUID exists in globalSet
            let found = false;
            globalSet.forEach(item => {
              if (item.nodeUID === nodeUID) {
                // Update the value for the existing nodeUID
                item.adjustedValue += adjustedValue;
                found = true;
              }
            });

            // If nodeUID doesn't exist, add it to the globalSet
            if (!found && !all_seed_uids.includes(nodeUID)) {
              globalSet.add({ nodeUID, adjustedValue });
            }
          });
        }


      }
    }
    const sortedArray = [...globalSet].sort((a, b) => b.adjustedValue - a.adjustedValue);
    var topNames = sortedArray.slice(0, resultSize).map(element => element.nodeUID);
    var topResults = sortedArray.slice(0, resultSize).map(element => Object.values(element));
    var topNamesValues = new Array(topNames.length).fill(1000);
    var relevant_rel = [];

    await session.close();
    await driver.close();
    for (let l = 1; l < 10; l++) {
      for (let k = 0; k < all_info.length; k++) {
        if (all_info[k][0].length >= ((l * 2) + 1)) {
          if (topNames.indexOf(all_info[k][0][l]) > -1) {
            if (topNamesValues[topNames.indexOf(all_info[k][0][l])] >= l) {
              topNamesValues[topNames.indexOf(all_info[k][0][l])] = l;
              relevant_rel.push(all_info[k][1][l - 1]);
            }
          }
          if (topNames.indexOf(all_info[k][0][all_info[k][0].length - l - 1]) > -1) {
            if (topNamesValues[topNames.indexOf(all_info[k][0][all_info[k][0].length - l - 1])] >= l) {
              topNamesValues[topNames.indexOf(all_info[k][0][all_info[k][0].length - l - 1])] = l;
              relevant_rel.push(all_info[k][1][all_info[k][1].length - l]);
            }
          }
        }
      }
    }
    var unique_relevant_rel = [...new Set(relevant_rel)];
    unique_relevant_rel = [...unique_relevant_rel, ...all_direct];

    const query_nodes_rel = "WITH " + JSON.stringify(unique_relevant_rel) + "AS relationshipUIDs" +
      "\nUNWIND relationshipUIDs AS relUid" +
      "\nMATCH (p1:Protein)-[r:PPI{uid: relUid}]-(p2:Protein)" +
      "\nWITH r, p1, p2" +
      "\nCALL apoc.export.json.data([p1,p2], [r], null, {stream: true})\nYIELD data\nRETURN data"

    setIsModalFindTargetsOpen(false);
    connect_new_nodes(topNames, all_seed_uids, topResults);
  };

  /**
   * after nodes are found with a alogorithm connect them with the seed proteins
   * @param {*} topUids 
   * @param {*} seedUids 
   * @param {*} topResults 
   */
  const connect_new_nodes = async (topUids, seedUids, topResults) => {
    const driver = neo4j.driver("neo4j://localhost:7687", neo4j.auth.basic("neo4j", "workwork"));
    const session = driver.session();
    var query = "MATCH (n1:Protein)"
      + "\nWHERE n1.uid IN " + JSON.stringify(topUids)
      + "\nMATCH (n2:Protein)"
      + "\nWHERE n2.uid IN " + JSON.stringify(seedUids)
      + "\nWITH n1, n2"
      + "\nMATCH path = shortestPath((n1)-[:PPI*]-(n2))"
      + "\nWITH nodes(path) AS allNodes, relationships(path) AS pathRelationships"
      + "\nWITH allNodes AS intermediateNodes, pathRelationships"
      + "\nRETURN [node in intermediateNodes | node.uid] AS nodeUID, [rel in pathRelationships | rel.uid] AS relUID";
    const result = await session.run(query);
    var all_info = [];
    var get_node_uids = [];
    var get_edge_uids = [];
    result.records.forEach(record => {
      const nodeUID = record.get('nodeUID');
      const relUID = record.get('relUID');
      all_info.push([nodeUID, relUID]);
    });
    for (let i = 0; i < topUids.length; i++) {
      const filteredData = all_info.filter((innerArray) => innerArray[0][0] === topUids[i]);
      const minLength = Math.min(...filteredData.map((arr) => arr[0].length));
      const shortestNodeArrays = filteredData.filter((arr) => arr[0].length === minLength);
      if (shortestNodeArrays.length > 0) {
        for (let j = 0; j < shortestNodeArrays.length; j++) {
          get_node_uids.push(...shortestNodeArrays[j][0]);
          get_edge_uids.push(...shortestNodeArrays[j][1]);
        }
      }
    }
    const uniqueNodeUids = [...new Set(get_node_uids)];
    const uniqueEdgeUids = [...new Set(get_edge_uids)];
    var query2 = "MATCH (p:Protein)"
      + "\nWHERE p.uid IN " + JSON.stringify(uniqueNodeUids)
      + "\nMATCH ()-[r:PPI]-()"
      + "\nWHERE r.uid IN " + JSON.stringify(uniqueEdgeUids)
      + "\nWITH p, r"
      + "\nMATCH (p1:Protein)-[r2:PPI]-(p2:Protein)"
      + "\nWHERE p1.uid IN " + JSON.stringify(seedUids) + " and p2.uid IN " + JSON.stringify(seedUids) + " and p1.uid <> p2.uid"
      + "\nWITH p, r, r2"
      + "\nCALL apoc.export.json.data([p], [r,r2], null, {stream: true})\nYIELD data\nRETURN data";
    setQuery([query2, topUids, topResults]);
  };

  /**
   * Find new nodes based on harmonic centrality
   * @param {*} all_seed_uids 
   */
  const harmonic_centrality = async (all_seed_uids) => {
    setIsModalFindTargetsOpen(false);
    const driver = neo4j.driver("neo4j://localhost:7687", neo4j.auth.basic("neo4j", "workwork"));
    const session = driver.session();
    const scoreMap = new Map();

    for (let i = 0; i < all_seed_uids.length; i++) {
      var query = "MATCH (p:Protein)"
        + "\nWHERE p.uid = '" + all_seed_uids[i].toString() + "'"
        + "\nCALL gds.allShortestPaths.delta.stream( 'graph', {"
        + "\nsourceNode: p,"
        + "\nnodeLabels: ['Protein'],"
        + "\nrelationshipTypes: ['PPI']"
        + "\n})"
        + "\nYIELD index, sourceNode, targetNode, totalCost"
        + "\nRETURN"
        + "\n index,"
        + "\n gds.util.asNode(sourceNode).uid AS sourceNodeName,"
        + "\ngds.util.asNode(targetNode).uid AS targetNodeName,"
        + "\ntotalCost"
      const result = await session.run(query);
      result.records.forEach(record => {
        const currentIndex = record.get('targetNodeName');
        const currentScore = 1 / record.get('totalCost');

        if (!all_seed_uids.includes(currentIndex)) {
          if (scoreMap.has(currentIndex)) {
            const existingScore = scoreMap.get(currentIndex);
            scoreMap.set(currentIndex, existingScore + currentScore);
          } else {
            scoreMap.set(currentIndex, currentScore);
          }
          if (currentIndex === "01b0676a-9564-4e3c-b920-ce0e9fbce649") {
            console.log("856", scoreMap.get(currentIndex), record.get('totalCost'));
          }
        }

      });


    }
    const scoreArray = Array.from(scoreMap);


    scoreArray.sort((a, b) => b[1] - a[1]);
    for (let i = 0; i < scoreArray.length; i++) {
      scoreArray[i][1] /= all_seed_uids.length;
      scoreArray[i][1] = Math.round(scoreArray[i][1] * 100) / 100;
    }


    const topResults = scoreArray.slice(0, resultSize);
    var all_uids = topResults.map(subarr => subarr[0]);
    all_uids = all_uids.filter(item => !all_seed_uids.includes(item));

    connect_new_nodes(all_uids, all_seed_uids, topResults);
  };

  /**
   * Find new nodes based on degree centrality
   * @param {*} all_seed_uids 
   */
  const degree_centrality = async (all_seed_uids) => {
    const driver = neo4j.driver("neo4j://localhost:7687", neo4j.auth.basic("neo4j", "workwork"));
    const session = driver.session();
    const scoreMap = new Map();


    //other method
    var query = "MATCH (p:Protein)-[:PPI]-(p2:Protein)"
      + "\nWHERE p.uid IN" + JSON.stringify(all_seed_uids) + " and NOT p2.uid IN " + JSON.stringify(all_seed_uids)
      + "\nWITH p2"
      + "\nMATCH (p2)-[:PPI]-(connected_proteins)"
      + "\nWITH p2, COLLECT(DISTINCT connected_proteins) AS connected_proteins_list"
      + "\nRETURN p2.uid AS p2_uid, SIZE(connected_proteins_list) AS connected_proteins_count"
    const result = await session.run(query);

    result.records.forEach(record => {
      const allIndexes = record.get('p2_uid');
      const valueIndes = record.get('connected_proteins_count');
      if (scoreMap.has(allIndexes)) {
        // If it exists, add the score to the existing value
      } else {
        scoreMap.set(allIndexes, Number(valueIndes));
      }
    });
    const scoreArray = Array.from(scoreMap);


    scoreArray.sort((a, b) => b[1] - a[1]);

    const topResults = scoreArray.slice(0, resultSize);
    var all_uids = topResults.map(subarr => subarr[0]);
    all_uids = all_uids.filter(item => !all_seed_uids.includes(item));
    setIsModalFindTargetsOpen(false);
    connect_new_nodes(all_uids, all_seed_uids, topResults);
  };

/**
 * Find new nodes based on trustrank / personalized pagerank
 * @param {*} all_seed_uids 
 * @param {*} dampingFactor 
 */
  const trustrank = async (all_seed_uids, dampingFactor) => {
    const driver = neo4j.driver("neo4j://localhost:7687", neo4j.auth.basic("neo4j", "workwork"));
    const session = driver.session();
    var topResults = [];
    var query = "WITH " + JSON.stringify(all_seed_uids) + " AS seedUids"
      + "\nMATCH (seed:Protein)"
      + "\nWHERE seed.uid IN seedUids"
      + "\nWITH collect(seed) AS seeds, seedUids"
      + "\nCALL gds.pageRank.stream('graph', {nodeLabels: ['Protein'], relationshipTypes: ['PPI'], sourceNodes: seeds, maxIterations: 10, dampingFactor:" + dampingFactor.toString() + "})"
      + "\nYIELD nodeId, score"
      + "\nWITH gds.util.asNode(nodeId) AS topNode, score, seedUids"
      + "\nWHERE NOT topNode.uid IN seedUids"
      + "\nRETURN topNode.uid AS TopProteinUid, score"
      + "\nORDER BY score DESC"
      + "\nLIMIT " + resultSize.toString();
    const result = await session.run(query);
    var get_all_Top_Uids = [];
    result.records.forEach(record => {
      const nodeUID = record.get('TopProteinUid');
      const nodeScore = record.get('score').toFixed(5);
      get_all_Top_Uids.push(nodeUID);
      topResults.push([nodeUID, nodeScore]);
    });

    await session.close();
    await driver.close();
    setIsModalFindTargetsOpen(false);
    connect_new_nodes(get_all_Top_Uids, all_seed_uids, topResults);
  };



  /**
   * set new filter call
   */
  const updateWebsite = () => {
    setNewFilter(filterGraphInformation);
  }



  /**
   * Starts drug targets search algorithm
   */
  const handleOkFindTarget = () => {
    var all_seed_uids = [];
    var match_query = ""
    for (let i = 0; i < selectedNodes.length; i++) {
      all_seed_uids.push(selectedNodes[i].uid)
    }
    switch (selectedDrugTargetAlgorithmus) {
      case 'Betweenness centrality':
        match_query = betweeness_centrality(all_seed_uids);
        break;
      case 'TrustRank':
        match_query = trustrank(all_seed_uids, 0.85);
        break;
      case 'Harmonic Centrality':
        match_query = harmonic_centrality(all_seed_uids);
        break;
      case 'Degree Centrality':
        match_query = degree_centrality(all_seed_uids);
        break;
    }
  };

  /**
   * Start search for new connections
   */
  const handleOk = () => {
    setIsModalOpen(false);
    var n1 = "";
    var n2 = "";
    var add_constrains = "";
    for (let i = 0; i < graphInformation.relationships.length; i++) {
      const r = graphInformation.relationships[i];
      if (r.name === selectedEntity3) {
        n1 = r.n1;
        n2 = r.n2;
        if (r.name === "ASSOCIATION" && usePanCanAssociationDefinition) {
          add_constrains = " AND (r.fdr < 0.01 or r.nc_fdr < 0.01) AND (abs(r.beta) > 0.1 OR abs(r.nc_beta) > 0.1)"
        } else {
          for (let j = 0; j < r.attributes.length; j++) {
            if (r.attributes[j].type === "list") {
              if (r.attributes[j].valuesChange !== r.attributes[j].values) {
                add_constrains = add_constrains + " AND r." + r.attributes[j].name + " IN " + JSON.stringify(r.attributes[j].valuesChange)
              }
            } else {
              if (r.attributes[j].min !== r.attributes[j].minChange) {
                add_constrains = add_constrains + " AND r." + r.attributes[j].name + " >= " + r.attributes[j].minChange.toString()
              }
              if (r.attributes[j].max !== r.attributes[j].maxChange) {
                add_constrains = add_constrains + " AND r." + r.attributes[j].name + " <= " + r.attributes[j].maxChange.toString()
              }
            }

          }
        }

        break;
      }
    }
    var all_seed_uids = [];
    for (let i = 0; i < selectedNodes.length; i++) {
      if (selectedNodes[i].label === selectedEntity1) {
        all_seed_uids.push(selectedNodes[i].uid)
      }
    }
    var attr_order = "";
    if (lowestValue) {
      attr_order = "ASC";
    }
    if (highestValue) {
      attr_order = "DESC";
    }
    var match_connection = "MATCH (s:" + n1 + ")-[r:" + selectedEntity3 + "]-(t:" + n2 + ")";
    var match_seed = "";
    if (selectedEntity1 === n1) {
      match_seed = "\nWHERE s.uid IN " + JSON.stringify(all_seed_uids) + add_constrains + " WITH r,s,t";
    } else {
      match_seed = "\nWHERE t.uid IN " + JSON.stringify(all_seed_uids) + add_constrains + " WITH r,s,t";
    }
    var match_order = "";
    if (attr_order !== "") {
      if (isCheckedAbsolut) {
        match_order = "\nORDER BY ABS(r." + orderAttribute + ") " + attr_order;
      }else{
        match_order = "\nORDER BY r." + orderAttribute + " " + attr_order;
      }
      
    }
    var match_limit = "\nLIMIT " + resultSize.toString();
    var apoc = "\nCALL apoc.export.json.data([s,t], [r], null, {stream: true})\nYIELD data\nRETURN data"
    var match_query = match_connection + match_seed + match_order + match_limit + apoc;
    console.log("1021", match_query);
    setQuery(match_query);
  };

  /**
   * find shortest path between two nodes
   */
  const handleOkShortestPath = () => {
    setIsModalShortestPath(false);
    var all_seed_uids = [];
    for (let i = 0; i < selectedNodes.length; i++) {
      all_seed_uids.push(selectedNodes[i].uid)
    }
    var allowed_connection_types = "";
    if (selectedEntity4 && selectedEntity4.length > 0) {
      allowed_connection_types = "r:";
      for (let i = 0; i < selectedEntity4.length; i++) {
        if (i !== 0) {
          allowed_connection_types = allowed_connection_types + "|";
        }
        allowed_connection_types = allowed_connection_types + selectedEntity4[i];
      }
    }
    allowed_connection_types = allowed_connection_types + "*";
    var match_connection = "MATCH (startNode {uid: " + JSON.stringify(all_seed_uids[0]) + "}), (endNode {uid: " + JSON.stringify(all_seed_uids[1]) + "})";
    var shortestPath = "\nMATCH path = shortestPath((startNode)-[" + allowed_connection_types + "]-(endNode))";
    var returnValues = "\WITH nodes(path) AS s, relationships(path) AS r";
    var apoc = "\nCALL apoc.export.json.data(s, r, null, {stream: true})\nYIELD data\nRETURN data"
    var match_query = match_connection + shortestPath + returnValues + apoc;

    setQuery(match_query);
  };

  /**
   * Change underline to blank
   * @param {*} not_correct_text 
   * @returns 
   */
  const handleBetterText2 = (not_correct_text) => {
    if (typeof not_correct_text === 'string') {
      not_correct_text = not_correct_text.replace(/_/g, " ");
    }

    var correct_text = not_correct_text;
    return correct_text;
  };

  /**
   * Find nearest ProCan Protein
   */
  const handleOkFindPanCanProtein = () => {
    var all_seed_uids = [];
    for (let i = 0; i < selectedNodes.length; i++) {
      if (selectedNodes[i].biogrid === 0 && typeof selectedNodes[i].pancan === 'undefined') {
        all_seed_uids.push(selectedNodes[i].uid)
      }
    }

    var match_queries = all_seed_uids.map(uid => {
      return `
          MATCH (startNode {uid: ${JSON.stringify(uid)}}), (endNode:Protein {project_id: 1})
          MATCH path = shortestPath((startNode)-[:PPI]-(endNode))
          WITH nodes(path) AS s, relationships(path) AS r
          CALL apoc.export.json.data(s, r, null, {stream: true})
          YIELD data
          RETURN data
          LIMIT 10
      `;
    });

    var combinedQuery = match_queries.join('\nUNION\n');
    setQuery(combinedQuery);
  }

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsModalFindTargetsOpen(false);
  };

  const handleShortestPathCancel = () => {
    setIsModalShortestPath(false);
  };
  const handleSelectChange1 = (value) => {
    setSelectedEntity1(value);
    findArray(allEntitiesConnections, value, selectedEntity2);
  };
  const handleSelectChange2 = (value) => {
    setSelectedEntity2(value);
    findArray(allEntitiesConnections, selectedEntity1, value);
  };
  const handleSelectChange3 = (value) => {
    setSelectedEntity3(value);
    if(value === "DRUG_SIMILARITY"){
      console.log("1130");
      handleOrderAttribute("value"); 
      setHighestValue(true);
      setLowestValue(false);
    }
  };
  const handleShortestPathChange = (value) => {
    setSelectedEntity4(value);
  };

  const columns2 = [
    {
      title: 'Name',
      dataIndex: 'Name',
      key: 'Name',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.Name.localeCompare(b.Name),
      render: text => <span style={{ fontSize: '12px' }}>{text}</span>,
    },
    {
      title: 'Value',
      dataIndex: 'Value',
      key: 'Value',
      render: (text, record) => {
        if (record.Link) {
          // If a Link property is present, render a link
          return (
            <a href={record.Link} target="_blank" rel="noopener noreferrer">
              {record.LinkText}
            </a>
          );
        } else {
          // Otherwise, render the text
          return <span style={{ fontSize: '12px' }}>{text}</span>;;
        }
      },
    },
  ];
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Entity',
      dataIndex: 'label',
      key: 'label',
      filters: uniqueEntities,
      onFilter: (value, record) => record.label === value,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render: (text, record, index) => (
        <span>
          <Button type="danger" onClick={() => handleDelete(index)} icon={<DeleteOutlined />}>
          </Button>
        </span>
      ),
    },
  ];

  const handleUsePanCanAssociationDefinition = () => {
    setUsePanCanAssociationDefinition(!usePanCanAssociationDefinition);
  };

  /**
   * open link to Drugst.One with all graph proteins
   */
  const handleDrugstOne = async () => {
    var DrugstOneNodes = [];
    var DrugstOneEdges = [];
    cy.edges().forEach((edge) => {
      if (!edge.hidden()) {
        var source_is_selected = false;
        var target_is_selected = false;
        const sourceNodeId = edge.source().id();
        const targetNodeId = edge.target().id();
        var selectedNodeElementNameSource = "";
        var selectedNodeElementNameTarget = "";
        for (const selectedNodeElement of selectedNodes) {
          if (sourceNodeId === selectedNodeElement.id) {
            source_is_selected = true;
            selectedNodeElementNameSource = selectedNodeElement.name;
          }
          if (targetNodeId === selectedNodeElement.id) {
            target_is_selected = true;
            selectedNodeElementNameTarget = selectedNodeElement.name;
          }
          if (source_is_selected && target_is_selected) {
            DrugstOneEdges.push({ "from": selectedNodeElementNameSource, "to": selectedNodeElementNameTarget });
            break;
          }
        }
      }

    });
    for (const selectedNodeElement of selectedNodes) {
      var DrugstOneNodeGroup = "";
      switch (selectedNodeElement.label) {
        case 'Protein':
          DrugstOneNodeGroup = "gene"
          break;
        case 'Drug':
          DrugstOneNodeGroup = "foundDrug"
          break;
        default:
          DrugstOneNodeGroup = "default";
      }
      DrugstOneNodes.push({ "id": selectedNodeElement.name, "label": selectedNodeElement.name, "group": DrugstOneNodeGroup });
    }
    const postData = {
      network: { "nodes": DrugstOneNodes, "edges": DrugstOneEdges },
      groups: {},
      config: {}
    };
axios.post('https://api.drugst.one/create_network', postData)
      .then(response => {
        const networkID = response.data;
        const urlToOpen = 'https://drugst.one?id=' + networkID;
        window.open(urlToOpen, '_blank');
      })
      .catch(error => {
        console.error('Error:', error);
      });

  };

  /**
   * open link to Profiler with all graph proteins
   */
  const handleProfiler = () => {
    const firstPartofProfileURL = "https://biit.cs.ut.ee/gprofiler/gost?organism=hsapiens&query=";
    var genElements = "";
    for (const selectedNodeElement of selectedNodes) {
      if (selectedNodeElement.label === "Protein") {
        if (genElements !== "") {
          genElements = genElements + "%0A";
        }
        genElements = genElements + selectedNodeElement.name;
      }
    }
    const urlToOpen = firstPartofProfileURL + genElements;
    window.open(urlToOpen, '_blank');
  };

  /**
   * open link to NDEX with all graph proteins
   */
  const handleNDEX = () => {
    const firstPartofProfileURL = "https://ndexbio.org/iquery/?genes=";
    var genElements = "";
    for (const selectedNodeElement of selectedNodes) {
      if (selectedNodeElement.label === "Protein") {
        if (genElements !== "") {
          genElements = genElements + "%20";
        }
        genElements = genElements + selectedNodeElement.name;
      }
    }
    const urlToOpen = firstPartofProfileURL + genElements;
    window.open(urlToOpen, '_blank');
  };

  /**
   * open link to digest with all graph proteins
   */
  const handleDigest = () => {
    const apiUrl = 'https://api.digest-validation.net'; // Base API URL
    var genElements = [];
    for (const selectedNodeElement of selectedNodes) {
      if (selectedNodeElement.label === "Protein") {
        genElements.push(selectedNodeElement.name);
      }
    }
    // Define the parameters for your POST request
    const requestBody = {
      target_id: 'symbol',
      target: genElements,
      runs: 1000,
      replace: 80,
      distance: 'jaccard',
      background_model: 'complete',
      type: 'gene', // Optional
    };

    // Make the POST request to create a validation task
    axios.post(`${apiUrl}/set`, requestBody)
      .then(response => {
        const taskID = response.data.task;
        const urlToOpen = "https://digest-validation.net/result?id=" + taskID;
        window.open(urlToOpen, '_blank');
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  /**
   * handle go to node
   * @param {*} value 
   */
  const handleGoToNode = (value) => {
    const uidItem = value.find(item => item.Name === "uid" && item.Value.length > 8);
    getUid(uidItem.Value);
  };

  /**
   * deselect a node
   * @param {*} index 
   */
  const handleDelete = (index) => {
    const newData = [...selectedNodes];
    const selectedNodeId = newData[index].id;
    const targetNode = cy.$(`#${selectedNodeId}`);
    targetNode.style({ 'border-color': 'gray', });
    newData.splice(index, 1);
    setSelectedNodes(newData);
  };

  /**
   * unselect all nodes
   */
  const handleReset = () => {
    cy.nodes().forEach(node => {
      node.style({ 'border-color': 'gray', });
    });
    setCy(cy);
    setSelectedNodes([]);
  };

  /**
   * Select all nodes
   */
  const handleSetAll = () => {
    var updatedSelectedNodes = [];
    cy.nodes().forEach(node => {
      node.style({ 'border-color': 'yellow', });
      updatedSelectedNodes.push({
        id: node.id(),
        name: node.data('name'),
        label: node.data('label'),
        uid: node.data('uid'),
        biogrid: node.data('project_id_0'),
        pancan: node.data('project_id'),
      })
    });
    setCy(cy);
    setSelectedNodes(updatedSelectedNodes);
  };

  /**
   * Add selected nodes by type
   * @param {*} typeId 
   */
  const handleSelectByType = (typeId) => {
    const updatedSelectedNodes = [...selectedNodes];
    cy.nodes().forEach((node) => {
      if (node.data('label') === typeId) {
        node.style({ 'border-color': 'yellow' });
        updatedSelectedNodes.push({
          id: node.id(),
          name: node.data('name'),
          label: node.data('label'),
          uid: node.data('uid'),
          biogrid: node.data('project_id_0'),
          pancan: node.data('project_id'),
        });
      }
    });
    setCy(cy);
    setSelectedNodes(updatedSelectedNodes);
  };

  /**
   * Map menu items
   */
  const menu = (
    <Menu>
      {nodeTypes.map((type) => (
        <Menu.Item key={type.name} onClick={() => handleSelectByType(type.name)}>
          {type.name}
        </Menu.Item>
      ))}
    </Menu>
  )

  /**
   * Check what Analysis tools should be selectable based on selected nodes
   */
  useEffect(() => {
    const newUniqueEntities = [];
    const entitySet = [];
    var protein_true = false;
    var biogrid_protein = false;
    var any_node = false;
    var more_then_one_node = false;
    if (selectedNodes.length === 2) {
      more_then_one_node = true;
    }
    for (const dataItem of selectedNodes) {
      any_node = true
      if (dataItem.label === "Protein") {
        protein_true = true;
      }
      if (dataItem.biogrid === 0 && typeof dataItem.pancan === 'undefined') {
        biogrid_protein = true;
      }
      if (!entitySet.includes(dataItem.label)) {
        entitySet.push(dataItem.label);
        newUniqueEntities.push({ text: dataItem.label, value: dataItem.label });
      }
    }
    setButtonDisabled(!protein_true);
    setButtonDisabledAnalysis(!any_node);
    setButtonDisabledShortestPath(!more_then_one_node);
    setUniqueEntities(newUniqueEntities);
    setButtonDisabledFindPanCanProtein(!biogrid_protein);
  }, [selectedNodes]);

  /**
   * Get Ids for proteins from gprofiler
   */
  useEffect(() => {
    var targets = ['ENTREZGENE_ACC', 'GENECARDS', 'ENSG', 'UNIPROTSWISSPROT_ACC'];
    var is_protein = false;
    var is_name = "";
    if (selectedElementInfo != []) {
      for (const element of selectedElementInfo) {
        if (element.Name === "label" && element.Value === "Protein") {
          is_protein = true;
        }
        if (element.Name === "name") {
          is_name = element.Value;
        }

      }
    }
    if (is_protein) {
      var add_external_links = [];
      for (const targetGen of targets) {
        const data = {
          organism: 'hsapiens',
          target: targetGen,
          query: [is_name]

        };


        axios.post('https://biit.cs.ut.ee/gprofiler/api/convert/convert/', data, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            const result = response.data.result[0].converted;
            if (result !== 'none') {
              add_external_links.push({ "Name": targetGen, "Value": result });
            }
          })
          .catch(error => {
            console.error('Error:', error);
          });

      }
    }
  }, [selectedElementInfo])
  
  /**
   * Test
   */
  useEffect(() => {
    console.log("905", nodeTypes);
  }, [nodeTypes])


  return (
    <div style={{ overflow: 'scroll', height: 'calc(100vh - 150px)'  }}>
      <Collapse defaultActiveKey={['2']} style={{ width: '430px' }}>
        <Collapse.Panel header="Analyse" key="5" style={{ width: '430px' }}>
          <div>
            <Tooltip title={isButtonDisabledAnalysis ? 'Select one or more nodes' : ''}>
              <Button disabled={isButtonDisabledAnalysis} type="default" icon={<RadarChartOutlined />} onClick={showModal} style={{ display: 'block' }}>
                Find Connections
              </Button>
            </Tooltip>
            <Tooltip title={isButtonDisabledShortestPath ? 'Select two nodes' : ''}>
              <Button disabled={isButtonDisabledShortestPath} type="default" icon={<RadarChartOutlined />} onClick={showModalShortestPath} style={{ display: 'block' }}>
                Shortest Path
              </Button>
            </Tooltip>
            <Modal title="Shortest Path" open={isModalShortestPath} onOk={handleOkShortestPath} onCancel={handleShortestPathCancel} width={650} okButtonProps={{
              onClick: handleOkShortestPath, // Custom click event handler
              style: { backgroundColor: '#4096FF' }
            }}>
              {shortestPathAllowedConnections.length > 0 && (
                <div>
                  <p style={{ fontSize: "14px" }}>Select the connections that can be used to find the shortest path</p>

                  <Select
                    mode="multiple"
                    style={{ width: '300px' }}
                    placeholder={`Select Connections}`}
                    onChange={(values) => handleShortestPathChange(values)}
                    optionLabelProp="label"
                    allowClear
                    showSearch
                  >
                    {shortestPathAllowedConnections.map((value) => (
                      <Option key={value} value={value} label={value}>
                        {handleBetterText2(value)}
                      </Option>
                    ))}
                  </Select>
                  <p style={{ fontSize: "10px" }}>Note: When nothing is selected, all edges can be used to find the shortest path.</p>
                </div>
              )}
            </Modal>
            <Modal title="Find Connections" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} width={650} okButtonProps={{
              onClick: handleOk, // Custom click event handler
              style: { backgroundColor: '#4096FF' }
            }}>
              <p>What connections should be found?</p>
              <Select
                showSearch
                style={{ width: 200 }} // Adjust styling as needed
                placeholder="Seed Entities"
                onChange={handleSelectChange1}
                value={selectedEntity1} // Bind the selected value to state
              >
                {filteredTypes.map((type) => (
                  <Select.Option key={type} value={type} label={type}>
                    {handleBetterText2(type)}
                  </Select.Option>
                ))}
              </Select>
              <span>  →</span>
              <Select
                showSearch
                style={{ width: 200, marginLeft: 10 }} // Adjust styling as needed
                placeholder="Target Entities"
                defaultValue=""
                onChange={handleSelectChange2}
                value={selectedEntity2} // Bind the selected value to state
              >
                {allEntities.map((type) => (
                  <Option key={type} value={type}>
                    {handleBetterText2(type)}
                  </Option>
                ))}
              </Select>
              {connectionOptions.length > 0 && (
                <div>
                  <p>Select the Connections you would like to get</p>
                  <Select
                    style={{ width: 200, marginLeft: 10 }} // Adjust styling as needed
                    defaultValue=""
                    onChange={handleSelectChange3}
                    value={selectedEntity3} // Bind the selected value to state
                  >
                    {connectionOptions.map((type) => (
                      <Option key={type} value={type}>
                        {handleBetterText2(type)}
                      </Option>
                    ))}
                  </Select>
                </div>
              )}
              {selectedEntity3 !== null && (
                <div>
                  <p>Constrain search results</p>
                  <p style={{ fontSize: 'smaller' }}>Note: If no value is selected for an attribute, there are no restrictions for it.</p>
                  <Collapse style={{ width: '600px' }}>
                    <Collapse.Panel header={handleBetterText2(selectedEntity2)} key="10" style={{ width: '600px' }}>
                      <Row gutter={[16, 16]} style={{ width: '800px' }}>
                        {graphInformation.nodes.length > 0 ? (
                          graphInformation.nodes.map((node_property) => {
                            return node_property.name === selectedEntity2 ? (
                              <div key={node_property.name}>
                                {node_property.attributes.map((attribute) => (
                                  <Row key={attribute.name} gutter={[16, 16]} align="middle">
                                    <Col span={12}>
                                      <p>{handleBetterText2(attribute.name)}</p>
                                    </Col>
                                    <Col span={12}>
                                      {attribute.type === 'list' ? (
                                        <Select
                                          mode="multiple"
                                          style={{ width: '300px' }}
                                          placeholder={`Select ${handleBetterText2(attribute.name)}`}
                                          onChange={(values) => handleSelectChange("nodes", node_property.name, attribute.name, values)}
                                          optionLabelProp="label"
                                          allowClear
                                          showSearch
                                        >
                                          {attribute.values.map((value) => (
                                            <Option key={value} value={value} label={value}>
                                              {value}
                                            </Option>
                                          ))}
                                        </Select>
                                      ) : (
                                        <div key={attribute.name}>
                                          <Slider
                                            range
                                            min={attribute.min}
                                            max={attribute.max}
                                            value={[attribute.minChange, attribute.maxChange]}
                                            step={(attribute.max - attribute.min) / 100}
                                            onChange={(value) => handleSliderChange("nodes", node_property.name, attribute.name, value)}
                                          />
                                        </div>


                                      )}
                                    </Col>
                                  </Row>
                                ))}
                              </div>
                            ) : null;
                          })
                        ) : (
                          <p>No data found for the selected item.</p>
                        )}
                      </Row>
                    </Collapse.Panel>
                    <Collapse.Panel header={handleBetterText2(selectedEntity3)} key="11" style={{ width: '600px' }}>
                      <Row gutter={[16, 16]} style={{ width: '800px' }}>
                        {graphInformation.relationships.length > 0 ? (
                          graphInformation.relationships.map((node_property) => {
                            return node_property.name === selectedEntity3 ? (
                              <div>
                                <div>
                                  {selectedEntity3 === "ASSOCIATION" ? (
                                    <Checkbox checked={usePanCanAssociationDefinition} onClick={handleUsePanCanAssociationDefinition}>
                                      Restrict to the default ProCan Association parameters
                                    </Checkbox>
                                  ) : null}
                                </div>
                                <div key={node_property.name}>
                                  {node_property.attributes.map((attribute) => (
                                    <Row key={attribute.name} gutter={[16, 16]} align="middle">
                                      <Col span={12}>
                                        <p>{handleBetterText2(attribute.name)}</p>
                                      </Col>
                                      <Col span={12}>
                                        {attribute.type === 'list' ? (
                                          <Select
                                            mode="multiple"
                                            style={{ width: '300px' }}
                                            placeholder={`Select ${attribute.name}`}
                                            onChange={(values) => {
                                              console.log('Selected:', values);
                                              // Handle selection changes here
                                            }}
                                            optionLabelProp="label"
                                            allowClear
                                            showSearch
                                          >
                                            {attribute.values.map((value) => (
                                              <Option key={value} value={value} label={value}>
                                                {value}
                                              </Option>
                                            ))}
                                          </Select>
                                        ) : (
                                          <div key={attribute.name}>
                                            <Slider
                                              range
                                              min={attribute.min}
                                              max={attribute.max}
                                              value={[attribute.minChange, attribute.maxChange]}
                                              step={(attribute.max - attribute.min) / 100}
                                              onChange={(value) => handleSliderChange("relationships", node_property.name, attribute.name, value)}
                                              style={{minWidth: "200px"}}
                                            />
                                          </div>


                                        )}
                                      </Col>
                                    </Row>
                                  ))}
                                </div>
                              </div>
                            ) : null;
                          })
                        ) : (
                          <p>No data found for the selected item.</p>
                        )}
                      </Row>
                    </Collapse.Panel>
                  </Collapse>
                  <p>Optional: Which nodes/relationships should be returned preferentially?</p>
                  {
                    graphInformation.relationships.length > 0 ? (
                      graphInformation.relationships.map((node_property) => {
                        return node_property.name === selectedEntity3 ? (
                          <div key={node_property.name}>
                            <Select
                              style={{ width: '300px' }}
                              onChange={(values) => { handleOrderAttribute(values); }}
                              optionLabelProp="label"
                              allowClear
                              showSearch
                              value={orderAttribute}
                            >
                              {node_property.attributes.map((attribute) => {
                                return attribute.type !== 'list' ? (
                                  <Select.Option key={attribute.name} value={attribute.name} label={attribute.name}>
                                    {handleBetterText2(attribute.name)}
                                  </Select.Option>
                                ) : null;
                              })}
                            </Select>
                            <Checkbox
        checked={isCheckedAbsolut}
        onChange={handleCheckboxChangeAbsolut}
        style={{ marginLeft: '10px' }}
      >
        Use absolute values
      </Checkbox>
                          </div>
                        ) : null;
                      })
                    ) : (
                      <p>No data found for the selected item.</p>
                    )
                  }
                  <Button icon={<CaretUpOutlined />} style={{ backgroundColor: highestValue ? 'lightblue' : 'white' }} type="default" onClick={() => {
                    const temp = highestValue;
                    setHighestValue(!temp);
                    setLowestValue(temp);
                  }}>
                    Get Results with highest Value
                  </Button>
                  <Button icon={<CaretDownOutlined />} type="default" style={{ backgroundColor: lowestValue ? 'lightblue' : 'white' }} onClick={() => {
                    const temp = lowestValue;
                    setLowestValue(!temp);
                    setHighestValue(temp);
                  }}>
                    Get Results with lowest Value
                  </Button>

                  <InputNumber
                    defaultValue={resultSize}
                    min={0} // Set minimum value if needed
                    max={1000} // Set maximum value if needed
                    step={1}
                    onChange={handleResultSize}
                  />
                </div>

              )}
            </Modal>
            <Tooltip title={isButtonDisabledShortestPath ? 'Select one or more proteins' : ''}>
              <Button disabled={isButtonDisabled} type="default" icon={<RadarChartOutlined />} onClick={showModalFindTargets} style={{ display: 'block' }}>
                Explore PPI Neighborhood
              </Button>
              <Modal title="Explore PPI Neighborhood" open={isModalFindTargetsOpen} onCancel={handleCancel} width={650} okButtonProps={{
                onClick: handleOkFindTarget, // Custom click event handler
                style: { backgroundColor: '#4096FF' }
              }}>
                <p style={{ fontSize: "12px" }}>Note: This algorithmus will search for a number of proteins that are between the selected proteins</p>
                <p style={{ fontSize: "medium", fontWeight: "bold" }}>Select a algorithmus</p>
                <Select
                  showSearch
                  style={{ width: 250 }} // Adjust styling as needed
                  placeholder=""
                  onChange={(value) => setSelectedDrugTargetAlgorithmus(value)}
                  value={selectedDrugTargetAlgorithmus} // Bind the selected value to state
                >
                  {drugTargetAlgorithms.map((type) => (
                    <Select.Option key={type} value={type} label={type}>
                      {type}
                    </Select.Option>
                  ))}
                </Select>
                <p style={{ fontSize: "medium", fontWeight: "bold" }}>Set the result sizes</p>
                <InputNumber
                  defaultValue={resultSize}
                  min={0} // Set minimum value if needed
                  max={100} // Set maximum value if needed
                  step={1}
                  onChange={handleResultSize}
                />
                {/*<p>Hub Penality</p>
                <InputNumber
                  defaultValue={hubPenality}
                  min={0} // Set minimum value if needed
                  max={1} // Set maximum value if needed
                  step={0.01}
                  onChange={(value) => sethubPenality(value)}
                />
                <p>Maximum degree</p>
                <InputNumber
                  defaultValue={maximumDegree}
                  min={0} // Set minimum value if needed
                  max={100} // Set maximum value if needed
                  step={1}
                  onChange={(value) => setMaximumDegree(value)}
                  />*/}
              </Modal>

            </Tooltip>
            <Tooltip title={isButtonDisabledFindPanCanProtein ? 'Select a red protein from the BioGRID database' : ''}>
              <Button disabled={isButtonDisabledFindPanCanProtein} type="default" icon={<RadarChartOutlined />} onClick={handleOkFindPanCanProtein} style={{ display: 'block' }}>
                Find nearest ProCan Protein
              </Button>
            </Tooltip>
          </div>
        </Collapse.Panel>
        <Collapse.Panel header="Information" key="2" style={{ width: '430px' }}>
          <div>
            {selectedElementInfo.length > 0 && (
              <>
                {selectedElementInfo.some(item => item.Name === "label" && allEntities.includes(item.Value)) && (
                  <Tooltip title="Go to node">
                    <Button
                      type="primary"
                      icon={<EnvironmentOutlined />}
                      style={{ border: 'none', background: 'blue' }}
                      onClick={() => handleGoToNode(selectedElementInfo)}
                    /></Tooltip>)}
                <Table
                  size="small"
                  style={{ width: '350px' }}
                  columns={columns2}
                  dataSource={cleanUpInformation(selectedElementInfo)}
                  pagination={{ pageSize: 10 }}
                /></>
            )}
          </div>
        </Collapse.Panel>
        <Collapse.Panel header="Node Selection" key="3" style={{ width: '430px' }}>
          <Table size="small" dataSource={selectedNodes} columns={columns} />
          <Button type="default" onClick={handleReset}>
            Delete All
          </Button>
          <Dropdown overlay={menu}>
            <Button type="default">
              Entity
            </Button>
          </Dropdown>
          <Button type="default" onClick={handleSetAll}>
            Set All
          </Button>
        </Collapse.Panel>
        <Collapse.Panel header="Advanced Filter" key="11" style={{ width: '430px' }}>
          <div>
            <Collapse style={{ width: '400px' }}>
              {filterInfo.nodes.map((node_property, index) => (
                <Collapse.Panel header={handleBetterText2(node_property.name)} key={`panel_${index}`} style={{ width: '400px' }}>
                  <Row gutter={[16, 16]} style={{ width: '800px' }}>
                    <div key={node_property.name}>
                      {node_property.attributes.map((attribute) => (
                        <Row key={attribute.name} gutter={[16, 16]} align="middle">
                          <Col span={12}>
                            <p style={{ fontSize: '14px' }}>{handleBetterText2(attribute.name)}</p>
                          </Col>
                          <Col span={12}>
                            {attribute.type === 'list' ? (
                              <Select
                                mode="multiple"
                                style={{ width: '200px' }}
                                placeholder={`Select ${handleBetterText2(attribute.name)}`}
                                onChange={(values) => handleSelectChangeFilter("nodes", node_property.name, attribute.name, values)}
                                optionLabelProp="label"
                                allowClear
                                showSearch
                              >
                                {attribute.values.map((value) => (
                                  <Option key={value} value={value} label={value}>
                                    {handleBetterText2(value)}
                                  </Option>
                                ))}
                              </Select>
                            ) : (
                              <div key={attribute.name}>
                                <Slider
                                  range
                                  min={attribute.min}
                                  max={attribute.max}
                                  value={[attribute.minChange, attribute.maxChange]}
                                  step={(attribute.max - attribute.min) / 100}
                                  onChange={(value) => handleSliderChangeFilter("nodes", node_property.name, attribute.name, value)}
                                  style={{minWidth: "180px"}}
                                />
                              </div>


                            )}
                          </Col>
                        </Row>
                      ))}
                    </div>
                  </Row>
                </Collapse.Panel>
              ))}
            </Collapse>
          </div>
          <p></p>
          <div>
            <Collapse style={{ width: '400px' }}>
              {filterInfo.relationships.map((node_property, index) => (
                <Collapse.Panel header={handleBetterText2(node_property.name)} key={`panel_${index}`} style={{ width: '400px' }}>
                  <Row gutter={[16, 16]} style={{ width: '450px' }}>
                    <div key={node_property.name} >
                      {node_property.attributes.map((attribute) => (
                        <Row key={attribute.name} gutter={[16, 16]} align="middle" >
                          <Col span={12}>
                            <p style={{ fontSize: '14px' }}>{handleBetterText2(attribute.name)}</p>
                          </Col>
                          <Col span={12}>
                            {attribute.type === 'list' ? (
                              <Select
                                mode="multiple"
                                style={{ width: '200px' }}
                                placeholder={`Select ${handleBetterText2(attribute.name)}`}
                                onChange={(values) => handleSelectChangeFilter("relationships", node_property.name, attribute.name, values)}
                                optionLabelProp="label"
                                allowClear
                                showSearch
                              >
                                {attribute.values.map((value) => (
                                  <Option key={value} value={value} label={value}>
                                    {handleBetterText2(value)}
                                  </Option>
                                ))}
                              </Select>
                            ) : (
                              <div key={attribute.name}>
                                <Slider
                                  range
                                  min={attribute.min}
                                  max={attribute.max}
                                  value={[attribute.minChange, attribute.maxChange]}
                                  step={(attribute.max - attribute.min) / 100}
                                  onChange={(value) => handleSliderChangeFilter("relationships", node_property.name, attribute.name, value)}
                                  style={{minWidth: "180px"}}
                                />
                              </div>


                            )}
                          </Col>
                        </Row>
                      ))}
                    </div>
                  </Row>
                </Collapse.Panel>
              ))}
            </Collapse>
          </div>
        </Collapse.Panel>
        <Collapse.Panel header="External Tools" key="4" style={{ width: '430px' }}>
          Note: All Selected nodes will be used.
          <Button disabled={isButtonDisabled} icon={<GlobalOutlined />} type="default" onClick={handleDrugstOne} style={{ display: 'block' }}>
            Drugst.One
          </Button>
          <Button disabled={isButtonDisabled} icon={<GlobalOutlined />} type="default" onClick={handleProfiler} style={{ display: 'block' }}>
            g:Profiler
          </Button>
          <Button disabled={isButtonDisabled} icon={<GlobalOutlined />} type="default" onClick={handleNDEX} style={{ display: 'block' }}>
            NDEx integrated Query
          </Button>
          <Button disabled={isButtonDisabled} icon={<GlobalOutlined />} type="default" onClick={handleDigest} style={{ display: 'block' }}>
            DIGEST enrichment analysis
          </Button>
        </Collapse.Panel>
        <Collapse.Panel header="Grouping of datasets" key="6" style={{ width: '430px' }}>
          <p style={{ fontSize: '14px' }}>Cluster a dataset based on the similarity of the entities.</p>
          <div style={{ display: 'flex' }}>
            <p style={{ fontSize: '14px', fontWeight: 'bold' }}>Dataset&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
            <Select style={{ paddingBottom: '10px', minWidth: '300px' }} defaultValue="GDSC1" onChange={handleGroupingDatasetChange}>
              <Option value="GDSC1">GDSC1</Option>
              <Option value="GDSC2">GDSC2</Option>
            </Select>
          </div>
          <div style={{ display: 'flex' }}>
            <p style={{ fontSize: '14px', fontWeight: 'bold' }}>Similarity&nbsp;&nbsp;</p>
            <Select style={{ paddingBottom: '10px', minWidth: '300px' }} defaultValue="Drug-Drug" onChange={handleGroupingSimilarityChange}>
              <Option value="Drug-Drug">Drug-Drug</Option>
              {/*<Option value="Drug-Protein">Drug-Protein</Option>*/}
            </Select>
          </div>
          <div style={{ display: 'flex' }}>
            <p style={{ fontSize: '14px', fontWeight: 'bold' }}>Grouping&nbsp;&nbsp;</p>
            <Select style={{ paddingBottom: '10px', minWidth: '300px' }} defaultValue="tSNE" onChange={handleGroupingGroupChange}>
                <Option value="tSNE">tSNE</Option>
                <Option value="Isomap with many neighbours">Isomap</Option>
                <Option value="Louvain with large communities">Louvain</Option>
                <Option value="UMAP with many neighbours">UMAP</Option>
            </Select>
          </div>
          <div style={{ display: 'flex' }}>
            <Button type="primary" style={{ backgroundColor: 'blue' }} onClick={handleApplyClustering}>Apply Grouping</Button>
            <p>&nbsp;&nbsp;</p>
            <Button type="primary" style={{ backgroundColor: 'red' }} onClick={handleRemoveClustering}>Remove Grouping</Button>

          </div>
        </Collapse.Panel>

      </Collapse>
    </div>
  );
};

export default Panel;