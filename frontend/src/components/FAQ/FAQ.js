import React from 'react';
import { Layout } from 'antd';
import NavigationBar from "../NavigationBar/NavigationBar";
import styled from 'styled-components';
import Database from '../Database/Database';
const { Content } = Layout;

const Container = styled.div`
  padding: 50px 50px;
  max-width: 60%;
`;
/**
 * Includes the content for the FAQ page
 */

const FAQ = () => {
  return (
    <Layout>
      <NavigationBar />
      <Content>
        <Container>
          <h2 style={{ fontWeight: 'bold', textAlign: 'left' }}>Welcome to VISPER - the Visualization System for Interactions between Proteins and Drugs for Exploratory Research!</h2>
          <p>Our platform provides an immersive experience for exploring and analyzing a segment of the ProCan dataset. Focusing primarily on identifying associated proteins and drugs for individual or groups of proteins, VISPER offers comprehensive tools for in-depth research.</p>
          <br/>
          <h2 style={{ fontWeight: 'bold', textAlign: 'left' }}>Frequently Asked Questions</h2>
          <h1 style={{ fontWeight: 'bold', textAlign: 'left' }}>1. How can i select or deselect a node?</h1>
          <p>You can select or deselect a node by double-clicking on it. A selected node will be outlined in yellow. On the left side, you'll find the Node Selection panel, where you can view all selected nodes and choose to select or deselect groups of nodes as well. Additionally, you can hold the Ctrl key and mark an area; all nodes within this area will be selected.</p>
          <br/>
          <h1 style={{ fontWeight: 'bold', textAlign: 'left' }}>2. What are the minimum and maximum Beta values for ASSOCIATION relationships?</h1>
          <p>The minimum Beta value is -1.950, while the maximum Beta value is 2.573.</p>
          <br/>         
          <h1 style={{ fontWeight: 'bold', textAlign: 'left' }}>3. What is the difference between LOW CONFIDENCE and HIGH CONFIDENCE relationships between proteins and cell lines?</h1>
          <p>- LOW CONFIDENCE: Proteomics data for the entire set of 8498 quantified proteins at the cell line level, averaged across all the replicates.</p>
          <p>- HIGH CONFIDENCE: Proteomics data for 6692 proteins supported by measuring more than one peptide at the cell line level, averaged across all the replicates.</p>
          <br/>
          <h1 style={{ fontWeight: 'bold', textAlign: 'left' }}>4. What do the Analyse tools do?</h1>
          <p><strong>- Find Connections:</strong> This tool allows you to discover connections from one or more selected nodes to other nodes that have a relationship with the selected nodes. You can specify criteria for the nodes and relationships that should be returned.</p>
<p><strong>- Shortest Path:</strong> When you select two nodes, this tool finds the shortest path between them in the network graph. You can also define which types of connections are allowed in the shortest path.</p>
<p><strong>- Explore PPI Neighborhood:</strong> This tool identifies proteins connected to a group of selected proteins based on their centrality in the BioGRID PPI network relative to the selected proteins. The algorithm is based on the code and documentation from  <a href="https://drugst.one/">Drugst.One</a>. Note that differences between the implementation and database in Drugst.One and VISPER may lead to varying results.</p>
<p><strong>- Find Nearest ProCan Protein:</strong> This tool identifies the closest ProCan Protein for proteins found in the BioGRID database but not in the ProCan database. It utilizes a shortest path algorithm. This function is crucial because our database primarily contains information on relationships involving ProCan Proteins with entities such as cell lines or drugs.</p>
<br/>
<h1 style={{ fontWeight: 'bold', textAlign: 'left' }}>5. How is the drug similarity determined?</h1>
<p>To calculate drug similarity, we use a method that was created by the developers of <a href="https://github.com/iMammal/CytoCave">CytoCave</a>. The diagram shows a simplified representation of the individual steps.</p>
<img src="drug_similarity_t.png" alt="Drug similarity"></img>
<br/>
<h1 style={{ fontWeight: 'bold', textAlign: 'left' }}>6. What does ProCan mean?</h1>
<p>ProCan is the ACFR International Centre for the Proteome of Human Cancer. In their new study <a href="https://www.cell.com/cancer-cell/fulltext/S1535-6108(22)00274-4#sectitle0030">Pan-cancer proteomic map of 949 human cell lines</a> they have generated an extensive dataset. For VISPER itself, we mostly use data from a <a href="https://www.dropbox.com/sh/0nemsahltwwstjp/AADb9f6b99K4z2XUPwsJf96Qa?dl=0&e=1">Dropbox</a> they provided.</p>
<br/>
<h1 style={{ fontWeight: 'bold', textAlign: 'left' }}>7. What are the default ProCan Association parameters?</h1>
<p> The default definition for ProCan Associations is ((FDR  &lt;1% or  Nc_FDR  &lt;1%) and ABS(Beta &gt; 0.1 or Nc_Beta &gt; 0.1)). </p>
<br/>
<h1 style={{ fontWeight: 'bold', textAlign: 'left' }}>8. Have the ProCan data used been modified?</h1>
<p> For clarity, we have excluded certain attributes from the ProCan dataset and rounded numerical values to either 3 or 5 decimal places.</p>
<br/>
<h1 style={{ fontWeight: 'bold', textAlign: 'left' }}>9. What do the ATC codes mean?</h1>
<p> The drug color for ATC codes is based on the main anatomical or pharmacological groups. Detailed explanations for these groups are available on the <a href="https://www.who.int/tools/atc-ddd-toolkit/atc-classification">WHO website</a>.</p>
<br/>
<h1 style={{ fontWeight: 'bold', textAlign: 'left' }}>10. What values were used for "Biomarkers for cancer vulnerabilities" plot?</h1>
<p>To create the plot, nc_pval and nc_beta values were used.</p>
           <br/>
           <h1 style={{ fontWeight: 'bold', textAlign: 'left' }}>Overview over the database sources</h1>
            <Database/>
           <br/>
          <h1 style={{ fontWeight: 'bold', textAlign: 'left' }}>Licenses used on this website</h1>
          <ul style={{ listStyleType: 'disc' }}>
              <li>DrugBank under Creative Common's Attribution-NonCommercial 4.0 International License. <a href="https://go.drugbank.com/releases/latest">Link to download</a></li>
              <li>Cell Line node picture: Image of a biology cancer cell, obtained from Iconduck and licensed under CC BY 3.0. <a href="https://iconduck.com/illustrations/122610/biology-cancer-cell-disease-health-human-tumor">Link to image</a></li>
              <li>Spider picture: Modified image of bug spider 2, sourced from Iconduck and licensed under CC0. <a href="https://iconduck.com/icons/250210/bug-spider-2">Link to image</a></li>
          </ul>
        </Container>
      </Content>
    </Layout>
  );
};

export default FAQ;
