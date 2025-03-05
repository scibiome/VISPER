# VISPER - Visualization System for Interactions between Proteins and Drugs for Exploratory Research 
Our platform provides an immersive experience for exploring and analyzing a segment of the dataset from [Gonçalves et al.](https://pubmed.ncbi.nlm.nih.gov/35839778/). 
With a primary focus on identifying associated proteins and drugs for individual or groups of proteins, VISPER offers comprehensive tools for in-depth research.

This repository contains the code for the **Vi**sualization **S**ystem for Interactions between **P**roteins and Drugs for **E**xploratory **R**esearch(**VISPER**).
To use VISPER locally on your PC, we recommend using the Docker version of VISPER. For detailed instructions, see the [Docker installation instructions](#docker).

If you would like to access the code, please contact the authors at daniel.dehncke@tu-braunschweig.de.

## Video Tutorials

### Exploration of significant associations between drug responses and protein measurements

[![Watch the video](https://img.youtube.com/vi/xMHmf7DHU3c/0.jpg)](https://youtu.be/xMHmf7DHU3c)


### Finding information about specific drug-protein associations and pathways of interest

[![Watch Video 1](https://img.youtube.com/vi/-x9TnTY8G3I/0.jpg)](https://youtu.be/-x9TnTY8G3I)

### Interactive Graphs

[![Watch Video](https://img.youtube.com/vi/egKkV9iHY4A/0.jpg)](https://youtu.be/egKkV9iHY4A)

***
### Docker
1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Optional: Restart your pc after the installation
3. Download the [docker-compose.yml from the docker folder](./docker/docker-compose.yml) of this repository. Important: Do not use the wrong docker-compose file!
4. Open the terminal in the folder where you placed the docker-compose.yml and run the following command:
```
docker-compose up
```
(Optional: First run docker-compose pull)
This process can take some time (approximately 40 minutes).
5. Call http://localhost:7474/browser/ and execute the following Neo4j cipher (user: neo4j, password: workwork).
```
CREATE INDEX IF NOT EXISTS FOR (d:Drug) ON (d.name);
CREATE INDEX IF NOT EXISTS FOR (p:Protein) ON (p.name);
CREATE INDEX IF NOT EXISTS FOR (c:Cell_Line) ON (c.name);
CREATE INDEX IF NOT EXISTS FOR (d:Drug) ON (d.uid);
CREATE INDEX IF NOT EXISTS FOR (p:Protein) ON (p.uid);
CREATE INDEX IF NOT EXISTS FOR (c:Cell_Line) ON (c.uid);
CREATE INDEX IF NOT EXISTS FOR (d:Drug) ON (d.drug_id);
CREATE INDEX IF NOT EXISTS FOR (d:Drug) ON (d.CHEMBL);
CREATE INDEX IF NOT EXISTS FOR (c:Cell_Line) ON (c.COSMIC_ID);
CREATE INDEX IF NOT EXISTS FOR (p:Protein) ON (p.swiss);
CALL gds.graph.project("graph", "Protein", {PPI: {orientation: "UNDIRECTED"}});
```
6. The website should be running on http://localhost:3000/


***

## Licensed content
- DrugBank under Creative Common's Attribution-NonCommercial 4.0 International License. [Link to download](https://go.drugbank.com/releases/latest)
- BioGRID under MIT License. [Link to download](https://downloads.thebiogrid.org/File/BioGRID/Release-Archive/BIOGRID-4.4.227/BIOGRID-ALL-4.4.227.tab3.zip)
- Cell Line node picture: Image of a biology cancer cell, obtained from Iconduck and licensed under CC BY 3.0. [Link to image](https://iconduck.com/illustrations/122610/biology-cancer-cell-disease-health-human-tumor)
- Spider picture: Modified image of bug spider 2, sourced from Iconduck and licensed under CC0. [Link to image](https://iconduck.com/icons/250210/bug-spider-2)
