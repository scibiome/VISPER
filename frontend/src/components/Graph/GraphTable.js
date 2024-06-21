import React, { useEffect, useState } from "react";
import { Select, Table, Button, Modal, Checkbox, Collapse } from 'antd';
import {
    TableOutlined
} from '@ant-design/icons';
import axios from "axios";
/**
 * Creates content for the graph table
 * @param {*} param0 
 * @returns 
 */

const GraphTable = ({ cy, updateGraph, setSelectedElementInfo, selectedNodes, allInformation }) => {
    const [filterInfo2, setFilterInfo2] = useState({ 'nodes': [{ 'name': 'Cell_Line', 'attributes': [{ 'name': 'tissue', 'type': 'list', 'values': ['Haematopoietic and Lymphoid', 'Lung', 'Stomach', 'Breast', 'Bone', 'Ovary', 'Skin', 'Head and Neck', 'Endometrium', 'Adrenal Gland', 'Central Nervous System', 'Pancreas', 'Prostate', 'Peripheral Nervous System', 'Large Intestine', 'Cervix', 'Kidney', 'Liver', 'Soft Tissue', 'Biliary Tract', 'Bladder', 'Esophagus', 'Testis', 'Thyroid', 'Vulva', 'Uterus', 'Small Intestine', 'Placenta'], 'valuesChange': ['Haematopoietic and Lymphoid', 'Lung', 'Stomach', 'Breast', 'Bone', 'Ovary', 'Skin', 'Head and Neck', 'Endometrium', 'Adrenal Gland', 'Central Nervous System', 'Pancreas', 'Prostate', 'Peripheral Nervous System', 'Large Intestine', 'Cervix', 'Kidney', 'Liver', 'Soft Tissue', 'Biliary Tract', 'Bladder', 'Esophagus', 'Testis', 'Thyroid', 'Vulva', 'Uterus', 'Small Intestine', 'Placenta'] }, { 'name': 'growth_properties', 'type': 'list', 'values': ['Suspension', 'Adherent', 'Unknown', 'Semi-Adherent'], 'valuesChange': ['Suspension', 'Adherent', 'Unknown', 'Semi-Adherent'] }, { 'name': 'cancer_type', 'type': 'list', 'values': ["B-Cell Non-Hodgkin's Lymphoma", 'Plasma Cell Myeloma', 'Acute Myeloid Leukemia', 'Other Solid Carcinomas', 'Gastric Carcinoma', 'T-Lymphoblastic Leukemia', 'Breast Carcinoma', "Ewing's Sarcoma", 'Ovarian Carcinoma', 'Melanoma', 'Head and Neck Carcinoma', 'Endometrial Carcinoma', 'Glioblastoma', 'Small Cell Lung Carcinoma', 'Pancreatic Carcinoma', 'Mesothelioma', 'B-Lymphoblastic Leukemia', 'Prostate Carcinoma', 'Neuroblastoma', 'Non-Small Cell Lung Carcinoma', 'Chronic Myelogenous Leukemia', "Burkitt's Lymphoma", 'Colorectal Carcinoma', 'Cervical Carcinoma', 'Oral Cavity Carcinoma', 'Kidney Carcinoma', 'Hepatocellular Carcinoma', 'Non-Cancerous', 'Biliary Tract Carcinoma', 'Glioma', 'Squamous Cell Lung Carcinoma', 'Bladder Carcinoma', 'Esophageal Squamous Cell Carcinoma', "Hodgkin's Lymphoma", 'Rhabdomyosarcoma', 'Thyroid Gland Carcinoma', "T-Cell Non-Hodgkin's Lymphoma", 'Esophageal Carcinoma', 'Other Blood Carcinomas', 'Osteosarcoma', 'Chondrosarcoma'], 'valuesChange': ["B-Cell Non-Hodgkin's Lymphoma", 'Plasma Cell Myeloma', 'Acute Myeloid Leukemia', 'Other Solid Carcinomas', 'Gastric Carcinoma', 'T-Lymphoblastic Leukemia', 'Breast Carcinoma', "Ewing's Sarcoma", 'Ovarian Carcinoma', 'Melanoma', 'Head and Neck Carcinoma', 'Endometrial Carcinoma', 'Glioblastoma', 'Small Cell Lung Carcinoma', 'Pancreatic Carcinoma', 'Mesothelioma', 'B-Lymphoblastic Leukemia', 'Prostate Carcinoma', 'Neuroblastoma', 'Non-Small Cell Lung Carcinoma', 'Chronic Myelogenous Leukemia', "Burkitt's Lymphoma", 'Colorectal Carcinoma', 'Cervical Carcinoma', 'Oral Cavity Carcinoma', 'Kidney Carcinoma', 'Hepatocellular Carcinoma', 'Non-Cancerous', 'Biliary Tract Carcinoma', 'Glioma', 'Squamous Cell Lung Carcinoma', 'Bladder Carcinoma', 'Esophageal Squamous Cell Carcinoma', "Hodgkin's Lymphoma", 'Rhabdomyosarcoma', 'Thyroid Gland Carcinoma', "T-Cell Non-Hodgkin's Lymphoma", 'Esophageal Carcinoma', 'Other Blood Carcinomas', 'Osteosarcoma', 'Chondrosarcoma'] }, { 'name': 'sample_treatment', 'type': 'list', 'values': ['Unknown', 'None', 'Chemotherapy;Radiotherapy', 'Chemotherapy', 'Radioiodine Therapy', 'Steroid', 'Radiotherapy'], 'valuesChange': ['Unknown', 'None', 'Chemotherapy;Radiotherapy', 'Chemotherapy', 'Radioiodine Therapy', 'Steroid', 'Radiotherapy'] }, { 'name': 'Cancer_type', 'type': 'list', 'values': ["B-Cell Non-Hodgkin's Lymphoma", 'Plasma Cell Myeloma', 'Acute Myeloid Leukemia', 'Carcinoid Tumour', 'Gastric Carcinoma', 'T-Lymphoblastic Leukemia', 'Breast Carcinoma', "Ewing's Sarcoma", 'Ovarian Carcinoma', 'Melanoma', 'Head and Neck Carcinoma', 'Endometrial Carcinoma', 'Other Solid Carcinomas', 'Glioblastoma', 'Small Cell Lung Carcinoma', 'Pancreatic Carcinoma', 'Mesothelioma', 'B-Lymphoblastic Leukemia', 'Prostate Carcinoma', 'Neuroblastoma', 'Non-Small Cell Lung Carcinoma', 'Chronic Myelogenous Leukemia', "Burkitt's Lymphoma", 'Colorectal Carcinoma', 'Cervical Carcinoma', 'Kidney Carcinoma', 'Hepatocellular Carcinoma', 'T-Lymphoblastic Lymphoma', 'Leiomyosarcoma', 'Non-Cancerous', 'Biliary Tract Carcinoma', 'Glioma', 'Bladder Carcinoma', 'Esophageal Carcinoma', "Hodgkin's Lymphoma", 'Other Blood Cancers', 'Other Sarcomas', 'Rhabdomyosarcoma', 'Thyroid Gland Carcinoma', "T-Cell Non-Hodgkin's Lymphoma", 'Vulvar carcinoma', 'Hairy Cell Leukemia', 'Osteosarcoma', 'Chondrosarcoma', 'Uncertain'], 'valuesChange': ["B-Cell Non-Hodgkin's Lymphoma", 'Plasma Cell Myeloma', 'Acute Myeloid Leukemia', 'Carcinoid Tumour', 'Gastric Carcinoma', 'T-Lymphoblastic Leukemia', 'Breast Carcinoma', "Ewing's Sarcoma", 'Ovarian Carcinoma', 'Melanoma', 'Head and Neck Carcinoma', 'Endometrial Carcinoma', 'Other Solid Carcinomas', 'Glioblastoma', 'Small Cell Lung Carcinoma', 'Pancreatic Carcinoma', 'Mesothelioma', 'B-Lymphoblastic Leukemia', 'Prostate Carcinoma', 'Neuroblastoma', 'Non-Small Cell Lung Carcinoma', 'Chronic Myelogenous Leukemia', "Burkitt's Lymphoma", 'Colorectal Carcinoma', 'Cervical Carcinoma', 'Kidney Carcinoma', 'Hepatocellular Carcinoma', 'T-Lymphoblastic Lymphoma', 'Leiomyosarcoma', 'Non-Cancerous', 'Biliary Tract Carcinoma', 'Glioma', 'Bladder Carcinoma', 'Esophageal Carcinoma', "Hodgkin's Lymphoma", 'Other Blood Cancers', 'Other Sarcomas', 'Rhabdomyosarcoma', 'Thyroid Gland Carcinoma', "T-Cell Non-Hodgkin's Lymphoma", 'Vulvar carcinoma', 'Hairy Cell Leukemia', 'Osteosarcoma', 'Chondrosarcoma', 'Uncertain'] }, { 'name': 'Tissue_type', 'type': 'list', 'values': ['Haematopoietic and Lymphoid', 'Lung', 'Stomach', 'Breast', 'Bone', 'Ovary', 'Skin', 'Head and Neck', 'Endometrium', 'Adrenal Gland', 'Central Nervous System', 'Pancreas', 'Prostate', 'Peripheral Nervous System', 'Other tissue', 'Large Intestine', 'Cervix', 'Kidney', 'Liver', 'Soft Tissue', 'Biliary Tract', 'Bladder', 'Esophagus', 'Testis', 'Thyroid', 'Vulva', 'Small Intestine', 'Placenta'], 'valuesChange': ['Haematopoietic and Lymphoid', 'Lung', 'Stomach', 'Breast', 'Bone', 'Ovary', 'Skin', 'Head and Neck', 'Endometrium', 'Adrenal Gland', 'Central Nervous System', 'Pancreas', 'Prostate', 'Peripheral Nervous System', 'Other tissue', 'Large Intestine', 'Cervix', 'Kidney', 'Liver', 'Soft Tissue', 'Biliary Tract', 'Bladder', 'Esophagus', 'Testis', 'Thyroid', 'Vulva', 'Small Intestine', 'Placenta'] }, { 'name': 'msi_status', 'type': 'list', 'values': ['MSS', 'MSI'], 'valuesChange': ['MSS', 'MSI'] }, { 'name': 'sample_treatment_details', 'type': 'list', 'values': ['adriamycin and taxol', '5 years with Busulfan (1979-1984)', 'transcatheter arterial embolization with lipoidol plus doxorubicin', 'Cisplatin', 'treated by transcatheter arterial embolization with lipoidol plus a combination of doxorubicin and mitomycin C', 'Three courses of CAP; cyclophosphamide, adriamycin and cisplatin. Three courses of etoposide and cisplatin.', 'Six courses of CAP; cyclophosphamide, adriamycin and cis-platinum.', '5-FU', 'Cyclophosphamide', 'yclophosphamide, hydroxydaunomycin, vincristine, and prednisone (CHOP chemotherapy)', '7 year chlorambucil', '5-FU + Doxorubicin + Mitomycin C', '5 fluorouracil, doxorubicin and mitomycin C', 'Five courses of CAP; cyclophosphamide, adriamycin and cis-platinum.', '3 cycles of chemotherapy treatment with eroposide, colchicine, methotrexate and vincristine', 'The patient had received sequential treatment with cisplatin and cyclophosphamide, cisplatin and etoposide and subsequently tamoxifen', 'chlorambucil.', 'cytoxan, bleomycin and adriamycin', 'cisplatin, 5-fluorouracil and chlorambucil treatment.', 'The patient was treated with RTG, methotrexate, adriamycin, vincristine, cytoxan, and aramycin C', 'The patient was treated with cytoxan, vincristine, methotrexate and radiation therapy'], 'valuesChange': ['adriamycin and taxol', '5 years with Busulfan (1979-1984)', 'transcatheter arterial embolization with lipoidol plus doxorubicin', 'Cisplatin', 'treated by transcatheter arterial embolization with lipoidol plus a combination of doxorubicin and mitomycin C', 'Three courses of CAP; cyclophosphamide, adriamycin and cisplatin. Three courses of etoposide and cisplatin.', 'Six courses of CAP; cyclophosphamide, adriamycin and cis-platinum.', '5-FU', 'Cyclophosphamide', 'yclophosphamide, hydroxydaunomycin, vincristine, and prednisone (CHOP chemotherapy)', '7 year chlorambucil', '5-FU + Doxorubicin + Mitomycin C', '5 fluorouracil, doxorubicin and mitomycin C', 'Five courses of CAP; cyclophosphamide, adriamycin and cis-platinum.', '3 cycles of chemotherapy treatment with eroposide, colchicine, methotrexate and vincristine', 'The patient had received sequential treatment with cisplatin and cyclophosphamide, cisplatin and etoposide and subsequently tamoxifen', 'chlorambucil.', 'cytoxan, bleomycin and adriamycin', 'cisplatin, 5-fluorouracil and chlorambucil treatment.', 'The patient was treated with RTG, methotrexate, adriamycin, vincristine, cytoxan, and aramycin C', 'The patient was treated with cytoxan, vincristine, methotrexate and radiation therapy'] }, { 'name': 'COSMIC_ID', 'type': 'num', 'min': 683667.0, 'max': 1789883.0, 'minChange': 683667.0, 'maxChange': 1789883.0 }, { 'name': 'master_cell_id', 'type': 'num', 'min': 1.0, 'max': 2266.0, 'minChange': 1.0, 'maxChange': 2266.0 }, { 'name': 'cell_line_name', 'type': 'num', 'min': 697.0, 'max': 5637.0, 'minChange': 697.0, 'maxChange': 5637.0 }, { 'name': 'model_name', 'type': 'num', 'min': 697.0, 'max': 5637.0, 'minChange': 697.0, 'maxChange': 5637.0 }, { 'name': 'name', 'type': 'num', 'min': 697.0, 'max': 5637.0, 'minChange': 697.0, 'maxChange': 5637.0 }] }, { 'name': 'Protein', 'attributes': [] }, { 'name': 'Drug', 'attributes': [{ 'name': 'target_pathway', 'type': 'list', 'values': ['p53 pathway', 'Chromatin other', 'EGFR signaling', 'Protein stability and degradation', 'Other, kinases', 'RTK signaling', 'WNT signaling', 'Mitosis', 'PI3K/MTOR signaling', 'Other', 'Apoptosis regulation', 'Chromatin histone methylation', 'DNA replication', 'Metabolism', 'Cell cycle', 'Genome integrity', 'ERK MAPK signaling', 'IGF1R signaling', 'Cytoskeleton', 'Chromatin histone acetylation', 'JNK and p38 signaling', 'ABL signaling', 'Hormone-related', 'Unclassified'], 'valuesChange': ['p53 pathway', 'Chromatin other', 'EGFR signaling', 'Protein stability and degradation', 'Other, kinases', 'RTK signaling', 'WNT signaling', 'Mitosis', 'PI3K/MTOR signaling', 'Other', 'Apoptosis regulation', 'Chromatin histone methylation', 'DNA replication', 'Metabolism', 'Cell cycle', 'Genome integrity', 'ERK MAPK signaling', 'IGF1R signaling', 'Cytoskeleton', 'Chromatin histone acetylation', 'JNK and p38 signaling', 'ABL signaling', 'Hormone-related', 'Unclassified'] }, { 'name': 'drug_owner', 'type': 'list', 'values': ['GDSC', 'AZ', 'MGH', 'AZ_GDSC', 'Nathanael.Gray', 'SGC', 'Mike.Olson', 'Ed.Tate', 'baylor.college.of.medicine.peggy.goodell'], 'valuesChange': ['GDSC', 'AZ', 'MGH', 'AZ_GDSC', 'Nathanael.Gray', 'SGC', 'Mike.Olson', 'Ed.Tate', 'baylor.college.of.medicine.peggy.goodell'] }, { 'name': 'webrelease', 'type': 'list', 'values': ['Y', 'N'], 'valuesChange': ['Y', 'N'] }, { 'name': 'PUBCHEM', 'type': 'num', 'min': 1018.0, 'max': 126689157.0, 'minChange': 1018.0, 'maxChange': 126689157.0 }, { 'name': 'drug_id', 'type': 'num', 'min': 17.0, 'max': 2510.0, 'minChange': 17.0, 'maxChange': 2510.0 }] }], 'relationships': [{ 'name': 'HAS_PROTEIN_6692', 'n1': 'Cell_Line', 'n2': 'Protein', 'attributes': [{ 'name': 'Protein_Intensity', 'type': 'num', 'min': -4.058114592328761, 'max': 15.503639324498378, 'minChange': -4.058114592328761, 'maxChange': 15.503639324498378 }] }, { 'name': 'HAS_PROTEIN_8498', 'n1': 'Cell_Line', 'n2': 'Protein', 'attributes': [{ 'name': 'Protein_Intensity', 'type': 'num', 'min': -5.444587739880729, 'max': 15.652689341072046, 'minChange': -5.444587739880729, 'maxChange': 15.652689341072046 }] }, { 'name': 'TESTED_ON', 'n1': 'Drug', 'n2': 'Cell_Line', 'attributes': [{ 'name': 'dataset', 'type': 'list', 'values': ['GDSC1', 'GDSC2'], 'valuesChange': ['GDSC1', 'GDSC2'] }, { 'name': 'AUC', 'type': 'num', 'min': 0.0055058589737584365, 'max': 0.9999639441639192, 'minChange': 0.0055058589737584365, 'maxChange': 0.9999639441639192 }, { 'name': 'ln_IC50', 'type': 'num', 'min': -10.579286628308195, 'max': 12.359001840287563, 'minChange': -10.579286628308195, 'maxChange': 12.359001840287563 }, { 'name': 'num_replicates', 'type': 'num', 'min': 1.0, 'max': 181.0, 'minChange': 1.0, 'maxChange': 181.0 }, { 'name': 'max_screening_conc', 'type': 'num', 'min': 0.001, 'max': 4000.0, 'minChange': 0.001, 'maxChange': 4000.0 }, { 'name': 'RMSE', 'type': 'num', 'min': 0.001485906910673817, 'max': 0.2999572668734664, 'minChange': 0.001485906910673817, 'maxChange': 0.2999572668734664 }] }, { 'name': 'ASSOCIATION', 'n1': 'Drug', 'n2': 'Protein', 'attributes': [{ 'name': 'GDSC', 'type': 'list', 'values': ['GDSC2', 'GDSC1'], 'valuesChange': ['GDSC2', 'GDSC1'] }, { 'name': 'skew', 'type': 'num', 'min': -4.106193002139706, 'max': 1.9878671232784333, 'minChange': -4.106193002139706, 'maxChange': 1.9878671232784333 }, { 'name': 'r2', 'type': 'num', 'min': 0.1013839670288539, 'max': 0.7734339936656506, 'minChange': 0.1013839670288539, 'maxChange': 0.7734339936656506 }, { 'name': 'ppi', 'type': 'num', 'min': 1.0, 'max': 4.0, 'minChange': 1.0, 'maxChange': 4.0 }, { 'name': 'drug_id', 'type': 'num', 'min': 1.0, 'max': 2510.0, 'minChange': 1.0, 'maxChange': 2510.0 }, { 'name': 'nc_pval', 'type': 'num', 'min': 7.84946148385623e-43, 'max': 1.0, 'minChange': 7.84946148385623e-43, 'maxChange': 1.0 }, { 'name': 'nc_fdr', 'type': 'num', 'min': 4.341537146720881e-39, 'max': 1.0, 'minChange': 4.341537146720881e-39, 'maxChange': 1.0 }, { 'name': 'nc_beta', 'type': 'num', 'min': -2.19763946136419, 'max': 2.185802362170413, 'minChange': -2.19763946136419, 'maxChange': 2.185802362170413 }, { 'name': 'nc_lr', 'type': 'num', 'min': -7.503331289626658e-12, 'max': 188.20184113361572, 'minChange': -7.503331289626658e-12, 'maxChange': 188.20184113361572 }, { 'name': 'pval', 'type': 'num', 'min': 1.0023245614279191e-15, 'max': 0.9999987968766584, 'minChange': 1.0023245614279191e-15, 'maxChange': 0.9999987968766584 }, { 'name': 'fdr', 'type': 'num', 'min': 5.548868772064962e-12, 'max': 0.9999987968766584, 'minChange': 5.548868772064962e-12, 'maxChange': 0.9999987968766584 }, { 'name': 'lr', 'type': 'num', 'min': 2.273736754432321e-12, 'max': 64.42588874796547, 'minChange': 2.273736754432321e-12, 'maxChange': 64.42588874796547 }, { 'name': 'covs', 'type': 'num', 'min': 19.0, 'max': 22.0, 'minChange': 19.0, 'maxChange': 22.0 }, { 'name': 'n', 'type': 'num', 'min': 61.0, 'max': 916.0, 'minChange': 61.0, 'maxChange': 916.0 }, { 'name': 'beta', 'type': 'num', 'min': -1.9500100915153256, 'max': 2.57257140936904, 'minChange': -1.9500100915153256, 'maxChange': 2.57257140936904 }] }] });
    const [filterInfo3, setFilterInfo3] = useState(null);
    const [filterInfo4, setFilterInfo4] = useState(null);
    const [showType, setShowType] = useState('node');
    const [showTableMode, setShowTableMode] = useState(false);
    const [showInfo, setShowInfo] = useState('simple');
    const [nodeColumns, setNodeColumns] = useState([]);
    const [nodeColumnNames, setNodeColumnNames] = useState([]);
    const [edgeColumns, setEdgeColumns] = useState([]);
    const [edgeColumnNames, setEdgeColumnNames] = useState([]);
    const allTypes = ['node', 'edge']



    useEffect(() => {
        if (allInformation) {
          setFilterInfo2(allInformation[2]);
        }
      }, [allInformation]);
    /**
     * change underline in text to blanks
     * @param {*} not_correct_text 
     * @returns 
     */
    const handleBetterText3 = (not_correct_text) => {
        not_correct_text = not_correct_text.replace(/_/g, " ");
        var correct_text = not_correct_text;
        return correct_text;
    };

    /**
     * 
     */
    const handleShowTableOptions = () => {
        var getCopy = { ...filterInfo2 };
        if (filterInfo3 === null) {
            for (let i = 0; i < getCopy.nodes.length; i++) {
                for (let j = 0; j < getCopy.nodes[i].attributes.length; j++) {
                    getCopy.nodes[i].attributes[j].status = false;
                }

            }
            for (let i = 0; i < getCopy.relationships.length; i++) {
                for (let j = 0; j < getCopy.relationships[i].attributes.length; j++) {
                    getCopy.relationships[i].attributes[j].status = false;
                }

            }
            setFilterInfo3(getCopy);
            setFilterInfo4(getCopy);
        } else {
            setFilterInfo4(filterInfo3);
        }
        setShowTableMode(true);
    };
    const handleTableOptionsCancel = () => {
        setShowTableMode(false);
    };
    const handleOkTableOptions = () => {
        console.log(66, filterInfo4);
        setFilterInfo3(filterInfo4);
        console.log("68 ", filterInfo4)
        setShowTableMode(false);
    };
    const handleCheckboxChangeOption = (nodeEdge, label, attributeName) => {
        console.log("71");
        var getCopy = { ...filterInfo4 };
        for (let i = 0; i < getCopy[nodeEdge].length; i++) {
            if (getCopy[nodeEdge][i].name === label) {
                for (let j = 0; j < getCopy[nodeEdge][i].attributes.length; j++) {
                    if (getCopy[nodeEdge][i].attributes[j].name === attributeName) {
                        getCopy[nodeEdge][i].attributes[j].status = !getCopy[nodeEdge][i].attributes[j].status;
                        break;
                    }
                }
                break;

            }
        }
        console.log("86 ",getCopy);
        setFilterInfo4(getCopy);

    };
    /**
     * create links to other websites
     * @param {*} nodeId 
     */
    const handleButtonClick = (nodeId) => {
        const node = cy.getElementById(nodeId);
        const nodeData = node.data();
        const dataEntries = Object.entries(nodeData);
        const dataS = dataEntries.map(([name, value]) => ({
            Name: name,
            Value: value,
        }));
        var targets = ['ENTREZGENE_ACC', 'GENECARDS', 'ENSG', 'UNIPROTSWISSPROT_ACC'];
        var targetsName = ['Entrez', 'Symbol', 'Ensembl', 'UniProtKB'];
        var targetsLinks = ['https://www.ncbi.nlm.nih.gov/gene/', 'https://www.genecards.org/cgi-bin/carddisp.pl?gene=', 'https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=', 'https://www.uniprot.org/uniprotkb/'];

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
    };
    /**
     * show edge data in a table
     * @param {*} Id 
     */
    const handleButtonClick2 = (Id) => {
        const edge = cy.getElementById(Id);
        const edgeId = edge.id();
        const edgeData = edge.data();
        const dataEntries = Object.entries(edgeData);
        const dataS = dataEntries.map(([name, value]) => ({
            Name: name,
            Value: value,
        }));
        setSelectedElementInfo(dataS);
    };
    /**
     * create graph table content
     */
    useEffect(() => {
        if (cy) {
            console.log("heeloo");
            var get_extra_node_columns = [];
            var get_extra_edge_columns = [];
            var nodeEdge = 'nodes';
            console.log("173", selectedNodes);
            if (filterInfo3) {
                for (let i = 0; i < filterInfo3[nodeEdge].length; i++) {
                    for (let j = 0; j < filterInfo3[nodeEdge][i].attributes.length; j++) {
                        console.log("170", filterInfo3[nodeEdge][i]);
                        if (filterInfo3[nodeEdge][i].attributes[j].status) {
                            get_extra_node_columns.push([filterInfo3[nodeEdge][i].name, filterInfo3[nodeEdge][i].attributes[j].name, filterInfo3[nodeEdge][i].attributes[j].type]);
                        }
                    }
                }

                nodeEdge = 'relationships';
                for (let i = 0; i < filterInfo3[nodeEdge].length; i++) {
                    for (let j = 0; j < filterInfo3[nodeEdge][i].attributes.length; j++) {
                        if (filterInfo3[nodeEdge][i].attributes[j].status) {
                            get_extra_edge_columns.push([filterInfo3[nodeEdge][i].name, filterInfo3[nodeEdge][i].attributes[j].name, filterInfo3[nodeEdge][i].attributes[j].type]);
                        }
                    }
                }
            }


            var new_node_columns_name = [];
            var new_node_columns = [];
            var new_edge_columns_name = [];
            var new_edge_columns = [];
            new_node_columns_name = [{
                title: 'Name', dataIndex: 'name', key: 'name', defaultSortOrder: 'descend',
                sorter: (a, b) => a.name.localeCompare(b.name),
                render: (text, record) => (
                    <Button type="link" onClick={() => handleButtonClick(record.id)}>
                        {record.name}
                    </Button>
                )
            }, {
                title: 'Label', dataIndex: 'label', key: 'label', defaultSortOrder: 'descend',
                sorter: (a, b) => a.label.localeCompare(b.label), filters: [
                    {
                        text: 'Protein',
                        value: 'Protein',
                    },
                    {
                        text: 'Drug',
                        value: 'Drug',
                    },
                    {
                        text: 'Cell Line',
                        value: 'Cell_Line',
                    },
                ],
                onFilter: (value, record) => record.label.indexOf(value) === 0,
            }, {
                title: 'Features', dataIndex: 'features', key: 'features', defaultSortOrder: 'descend',
                sorter: (a, b) => a.features.localeCompare(b.features)
            }, {
                title: 'Score', dataIndex: 'score', key: 'score', defaultSortOrder: 'descend',
                sorter: (a, b) => a.score - b.score

            }, {
                title: 'Edges', dataIndex: 'connectionCount', key: 'connectionCount', defaultSortOrder: 'descend',
                sorter: (a, b) => a.connectionCount - b.connectionCount

            }];

            for (let i = 0; i < get_extra_node_columns.length; i++) {
                if (get_extra_node_columns[i][1] === 'list') {
                    new_node_columns_name.push({ title: get_extra_node_columns[i][1], dataIndex: get_extra_node_columns[i][1], key: get_extra_node_columns[i][1], defaultSortOrder: 'descend', sorter: (a, b) => a[get_extra_node_columns[i][1]].localeCompare(b[get_extra_node_columns[i][1]]) });
                } else {
                    new_node_columns_name.push({ title: get_extra_node_columns[i][1], dataIndex: get_extra_node_columns[i][1], key: get_extra_node_columns[i][1], defaultSortOrder: 'descend', sorter: (a, b) => a[get_extra_node_columns[i][1]] - b[get_extra_node_columns[i][1]] });
                }
            }

            new_edge_columns_name = [{
                title: 'id', dataIndex: 'id', key: 'id', defaultSortOrder: 'descend',
                sorter: (a, b) => a.id.localeCompare(b.id),
                render: (text, record) => (
                    <Button type="link" onClick={() => handleButtonClick2(record.id)}>
                        {record.id}
                    </Button>
                )
            },
            {
                title: 'Target', dataIndex: 'target', key: 'target', defaultSortOrder: 'descend',
                sorter: (a, b) => a.target.localeCompare(b.target),
                render: (text, record) => (
                    <Button type="link" onClick={() => handleButtonClick(record.nodeIdTarget)}>
                        {record.target}
                    </Button>
                )
            },
            {
                title: 'Source', dataIndex: 'source', key: 'source', defaultSortOrder: 'descend',
                sorter: (a, b) => a.source.localeCompare(b.source),
                render: (text, record) => (
                    <Button type="link" onClick={() => handleButtonClick(record.nodeIdSource)}>
                        {record.source}
                    </Button>
                )
            },
            {
                title: 'Label', dataIndex: 'label', key: 'label', defaultSortOrder: 'descend',
                sorter: (a, b) => a.label.localeCompare(b.label)
            }];
            for (let i = 0; i < get_extra_edge_columns.length; i++) {
                console.log("286", get_extra_edge_columns[i]);
                if (get_extra_edge_columns[i][1] === 'list') {
                    new_edge_columns_name.push({ title: get_extra_edge_columns[i][1], dataIndex: get_extra_edge_columns[i][1], key: get_extra_edge_columns[i][1], defaultSortOrder: 'descend', sorter: (a, b) => a[get_extra_edge_columns[i][1]].localeCompare(b[get_extra_edge_columns[i][1]]) });
                } else {
                    new_edge_columns_name.push({ title: get_extra_edge_columns[i][1], dataIndex: get_extra_edge_columns[i][1], key: get_extra_edge_columns[i][1], defaultSortOrder: 'descend', sorter: (a, b) => a[get_extra_edge_columns[i][1]] - b[get_extra_edge_columns[i][1]] });
                }
            }

            if (showInfo === 'simple') {
                var nodeCounts = {};
                cy.edges().forEach((edge) => {
                    if (edge.visible()) {
                        const edgeId = edge.data('id');
                        const edgeSource = edge.source().data('name');
                        const nodeIdSource = edge.source().id();

                        const edgeTarget = edge.target().data('name');
                        const edgeLabel = edge.data('label');
                        const nodeIdTarget = edge.target().id();

                        nodeCounts[nodeIdSource] = (nodeCounts[nodeIdSource] || 0) + 1;

                        nodeCounts[nodeIdTarget] = (nodeCounts[nodeIdTarget] || 0) + 1;
                        var update_values = { id: edgeId, source: edgeSource, target: edgeTarget, label: edgeLabel, nodeIdSource: nodeIdSource, nodeIdTarget: nodeIdTarget };
                        for (let i = 0; i < get_extra_edge_columns.length; i++) {
                            if (edgeLabel === get_extra_edge_columns[i][0]) {
                                if (edge.data(get_extra_edge_columns[i][1])) {
                                    update_values[get_extra_edge_columns[i][1]] = edge.data(get_extra_edge_columns[i][1]);
                                }
                            }
                        }
                        if(cy.getElementById(nodeIdSource).style('border-color') === 'rgb(255,255,0)' || cy.getElementById(nodeIdTarget).style('border-color') === 'rgb(255,255,0)'){
                            console.log("310");
                            new_edge_columns.push(update_values);
                        }
                        
                        // Push edge data into your edge columns array or perform other required operations
                    }
                });

                cy.nodes().forEach((node) => {

                    console.log("314", node.style('border-color'))
                    if (node.visible() && node.style('border-color') === 'rgb(255,255,0)') {
                        const typeNode = node.data('label');
                        const nameNode = node.data('name');
                        const nodeId = node.id();
                        const countOfConnections = nodeCounts[nodeId] || 0;
                        var seedNode = "-";
                        const borderColor = node.style('border-color');
                        if (borderColor === 'rgb(255,255,0)') {
                            seedNode = "Seed";
                        }
                        if (node.data('highlight') === 'true') {
                            seedNode = "Result";
                        }
                        const scoreNode = node.data('score') !== undefined ? node.data('score') : null;
                        var update_values = { label: typeNode, name: nameNode, features: seedNode, score: scoreNode, id: nodeId, connectionCount: countOfConnections };
                        for (let i = 0; i < get_extra_node_columns.length; i++) {
                            if (typeNode === get_extra_node_columns[i][0]) {
                                if (node.data(get_extra_node_columns[i][1])) {
                                    update_values[get_extra_node_columns[i][1]] = node.data(get_extra_node_columns[i][1]);
                                }
                            }
                        }
                        new_node_columns.push(update_values);

                    }

                });

            }
        }
        setNodeColumns(new_node_columns);
        setNodeColumnNames(new_node_columns_name);
        setEdgeColumns(new_edge_columns);
        setEdgeColumnNames(new_edge_columns_name);
    }, [cy, updateGraph, filterInfo3, selectedNodes]);


    return (
        <div>
            <p>Note: For clarity, this table shows only selected nodes and the edges connected to them.</p>
            <Select
                showSearch
                style={{ width: 200 }}
                placeholder=""
                onChange={(value) => setShowType(value)}
                value={showType} 
            >
                {allTypes.map((type) => (
                    <Select.Option key={type} value={type} label={type}>
                        {type}
                    </Select.Option>
                ))}
            </Select>
             <Button type="default" icon={<TableOutlined style={{ color: 'white' }} />} onClick={handleShowTableOptions} style={{ position: "absolute", backgroundColor: 'blue', right: '10px', color: "white" }}>
                Table Settings
                </Button>
            <Modal title="Table Settings" open={showTableMode} onOk={handleOkTableOptions} onCancel={handleTableOptionsCancel} width={650} okButtonProps={{
                onClick: handleOkTableOptions,
                style: { backgroundColor: '#4096FF' }
            }}>
                <div>
                    <Collapse style={{ width: '400px' }}>
                        {filterInfo4 && filterInfo4.nodes.map((node_property, index) => (
                            <Collapse.Panel header={handleBetterText3(node_property.name)} key={`panel_${index}`} style={{ width: '400px' }}>

                                {node_property.attributes.map((attribute) => (
                                    attribute.name !== "name" && (

                                        <Checkbox value={attribute.name} checked={attribute.status} onChange={(e) => handleCheckboxChangeOption('nodes', node_property.name, attribute.name)}>{attribute.status}{handleBetterText3(attribute.name)}</Checkbox>

                                    )
                                ))}

                            </Collapse.Panel>
                        ))}
                    </Collapse>
                </div>
                <p></p>
                <div>
                    <Collapse style={{ width: '400px' }}>
                        {filterInfo4 && filterInfo4.relationships.map((node_property, index) => (
                            <Collapse.Panel header={handleBetterText3(node_property.name)} key={`panel_${index}`} style={{ width: '400px' }}>
                                {node_property.attributes.map((attribute) => (

<Checkbox value={attribute.name} checked={attribute.status} onChange={(e) => handleCheckboxChangeOption('relationships', node_property.name, attribute.name)}>{attribute.status}{handleBetterText3(attribute.name)}</Checkbox>
                                ))}


                            </Collapse.Panel>
                        ))}
                    </Collapse></div>
            </Modal>
            {
                showType === 'node' && cy && (
                    <div>

                        <Table
                            style={{ width: '350px' }}
                            columns={nodeColumnNames}
                            dataSource={nodeColumns}
                            pagination={{ pageSize: 10 }}
                        />
                    </div>

                )
            }

            {
                showType === 'edge' && (
                    <div>
                        <Table
                            style={{ width: '350px' }}
                            columns={edgeColumnNames}
                            dataSource={edgeColumns}
                            pagination={{ pageSize: 10 }}
                        />
                    </div>
                )
            }


        </div>
    );
};
export default GraphTable;