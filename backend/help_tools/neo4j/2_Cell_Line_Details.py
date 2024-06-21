from neo4j import GraphDatabase
import pandas as pd
import json
import csv
import os
import tqdm
import requests
uri = "bolt://localhost:7687"  # Replace with your Neo4j server's URI
username = "neo4j"      # Replace with your Neo4j username
password = "workwork"      # Replace with your Neo4j password

def query_cell_lines_details(tx):
    query = ("""
LOAD CSV WITH HEADERS FROM 'file:///Cell_Lines_Details_1.csv' AS row FIELDTERMINATOR ';'
WITH row
CREATE (c:Cell_Line)
SET c.name = row.Sample_Name,
    c.COSMIC_ID = toInteger(row.COSMIC_ID),
    c.Whole_Exome_Sequencing = row.Whole_Exome_Sequencing,
    c.Copy_Number_Alterations = row.Copy_Number_Alterations,
    c.Gene_Expression = row.Gene_Expression,
    c.Methylation = row.Methylation,
    c.Drug_Response = row.Drug_Response,
    c.GDSC_Tissue_descriptor_1 = row.GDSC_Tissue_descriptor_1,
    c.GDSC_Tissue_descriptor_2 = row.GDSC_Tissue_descriptor_2,
    c.Cancer_Type = row.Cancer_Type,
    c.Microsatellite_instability_Status = row.Microsatellite_instability_Status,
    c.Screen_Medium = row.Screen_Medium,
    c.Growth_Properties = row.Growth_Properties,
    c.project_id = 1,
    c.uid = apoc.create.uuid(),
    c.Cancer_Type_Name = 
        CASE row.Cancer_Type
            WHEN 'PAAD' THEN 'Pancreatic adenocarcinoma'
            WHEN 'PRAD' THEN 'Prostate adenocarcinoma'
            WHEN 'SCLC' THEN 'Small Cell Lung Cancer'
            WHEN 'SKCM' THEN 'Skin Cutaneous Melanoma'
            WHEN 'STAD' THEN 'Stomach adenocarcinoma'
            WHEN 'THCA' THEN 'Thyroid carcinoma'
            WHEN 'UCEC' THEN 'Uterine Corpus Endometrial Carcinoma'
            ELSE ''
        END,
    c.MSI_Data = 
        CASE row.MSI
            WHEN 'MSS' THEN 'Microsatellite class stable (0 of 5 markers show instability)'
            WHEN 'MSI-L' THEN 'Microsatellite instability low (1 of 5 markers show instability)'
            WHEN 'MSI-H' THEN 'Microsatellite instability High (>=2 of 5 markers show instability)'
            ELSE ''
        END,
    c.Screen_Medium_Description = 
        CASE row.Screen_Medium
            WHEN 'D/F12' THEN 'DMEM/F12: DMEM/F12, 10% FBS, 1% PenStrep'
            WHEN 'D/F12+10' THEN 'DMEM/F12+additonal 10%FBS: DMEM/F12, 20% FBS, 1% PenStrep'
            WHEN 'R' THEN 'RPMI: RPMI, 10% FBS, % PenStrep, % Glucose, 1mM Sodium Pyruvate'
            WHEN 'R+10' THEN 'RPMI+additonal 10%FBS: RPMI, 20% FBS, % PenStrep, % Glucose, 1mM Sodium Pyruvate'
            WHEN 'H' THEN 'Hites: 5ug/ml Insulin, 10nM B-estradiol, 10uM Hydrocortisone'
            ELSE ''
        END;
"""
    )
    tx.run(query)    

def query_cell_lines_details_2(tx):
    query = ("""
LOAD CSV WITH HEADERS FROM 'file:///Cell_Lines_Details_2.csv' AS row FIELDTERMINATOR ';'
WITH row
MERGE (c:Cell_Line {COSMIC_ID: toInteger(row.COSMIC_ID)})
ON CREATE SET
    c.name = row.Line,
    c.uid = apoc.create.uuid()
SET c.COSMIC_ID = toInteger(row.COSMIC_ID),
    c.Site = row.Site,
    c.Histology = row.Histology,
    c.Synonyms = CASE
        WHEN NOT c.name = row.Line THEN COALESCE(c.Synonyms, []) + [row.Line]
        ELSE c.Synonyms
    END;
"""
    )
    tx.run(query)  
def create_Index(tx):
    query = ("CREATE INDEX IF NOT EXISTS FOR (c:Cell_Line) ON (c.COSMIC_ID);")
    tx.run(query)

def cell_lines_details():
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            session.write_transaction(create_Index)
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            session.write_transaction(query_cell_lines_details)
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            session.write_transaction(query_cell_lines_details_2)


def query_create_cell_line(tx):
    query = ("""
LOAD CSV WITH HEADERS FROM 'file:///ProCan-DepMapSanger_mapping_file_averaged.txt' AS row FIELDTERMINATOR '\t'
WITH row
CREATE (c:Cell_Line)
SET c.project_id = 1,
    c.name = row.Cell_line,
    c.uid = apoc.create.uuid(),
    c.SIDM= row.SIDM,
    c.Project_Identifier = row.Project_Identifier,
    c.Tissue_type = row.Tissue_type,
    c.Cancer_type = row.Cancer_type,
    c.Cancer_subtype = row.Cancer_subtype
"""
    )
    tx.run(query)     

def cell_line_information():
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            session.write_transaction(query_create_cell_line)    


#cell_lines_details()
cell_line_information()