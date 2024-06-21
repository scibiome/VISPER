from neo4j import GraphDatabase
import pandas as pd
import json
import csv
import os
import tqdm
import requests
import time

uri = "bolt://localhost:7687"  # Replace with your Neo4j server's URI
username = "neo4j"      # Replace with your Neo4j username
password = "workwork"      # Replace with your Neo4j password

def query_create_drugs(tx):
    query = """
            CALL apoc.periodic.iterate(
            'LOAD CSV WITH HEADERS FROM "file:///Drug_Protein/lm_sklearn_degr_drug_annotated_diann_051021.csv" AS row FIELDTERMINATOR "," RETURN row',
            '
            WITH SPLIT(row.y_id, ";")[0] AS name
            MERGE (d:Drug {drug_id: name})',
            { batchSize: 100000}
            );"""
    tx.run(query)
def query_create_index(tx):
    queries = [
        "CREATE INDEX IF NOT EXISTS FOR (d:Drug) ON (d.name);",
        "CREATE INDEX IF NOT EXISTS FOR (r:HAS_SYNONYM) ON (r.project_id);",
        "CREATE INDEX IF NOT EXISTS FOR (c:Cell_Line) ON (c.SID);"
    ]
    for query in queries:
        tx.run(query)

def query_create_connections(tx):
    query = """
            CALL apoc.periodic.iterate(
            'LOAD CSV WITH HEADERS FROM "file:///Drug_Cell_Line/DrugResponse_PANCANCER_GDSC1_GDSC2_20200602.csv" AS row FIELDTERMINATOR "," RETURN row',
            '
            WITH row
            MATCH (d:Drug {drug_id: row.drug_id})
            WITH d, row
            MERGE (c:Cell_Line{SID: row.model_id})
                SET c.cancer_type_detail = row.cancer_type_detail,
                c.COSMIC_ID = row.COSMIC_ID,
                c.model_type = row.model_type,
                c.BROAD_ID = row.BROAD_ID,
                c.model_synonyms = row.model_synonyms,
                c.sample_treatment_details = row.sample_treatment_details,
                c.master_cell_id = row.master_cell_id,
                c.cancer_type = row.cancer_type,
                c.model_treatment = row.model_treatment,
                c.sample_treatment = row.sample_treatment,
                c.model_name = row.model_name,
                c.RRID = row.RRID,
                c.growth_properties = row.growth_properties,
                c.tissue = row.tissue,
                c.msi_status = row.msi_status,
                c.use_in_publications = row.use_in_publications,
                c.sample_site = row.sample_site,
                c.cell_line_name = row.cell_line_name
            CREATE (d)-[r:TESTED_ON]->(c)
            SET r.dataset = row.dataset,
                r.RMSE = row.RMSE,
                r.ln_IC50 = row.ln_IC50,
                r.num_replicates = row.num_replicates,
                r.AUC = row.AUC,
                r.max_screening_conc = row.max_screening_conc,
                r.project_id = 1',
            {batchSize: 100000}
            );"""
    print(query)
    tx.run(query)    
def create_drugs():
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            session.execute_write(query_create_index)
            print("moin")
            session.execute_write(query_create_connections)


def read_csv_file():
    file_name = "D:/neo4j/import/Drug_Cell_Line/DrugResponse_PANCANCER_GDSC1_GDSC2_20200602.csv"
    #file_name = "D:/neo4j/import/Drug_Protein/lm_sklearn_degr_drug_annotated_diann_051021.csv"
    all_cosmic_ids = []
    get_cosmic_id_with_data = []
    different_columns_set = set()
    with open(file_name, 'r') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            find_id = 'COSMIC_ID'
            print(row[find_id])
            if row[find_id]  in all_cosmic_ids:
                for g in get_cosmic_id_with_data:
                    if g[find_id] == row[find_id]:
                        different_columns = [col for col in row if g[col] != row[col]]
                        different_columns_set.update(different_columns)
                        
            else:
                all_cosmic_ids.append(row[find_id])
                get_cosmic_id_with_data.append(dict(row))
    column_names = set(csv_reader.fieldnames) 
    unique_different_columns = list(different_columns_set)  # Convert set to list for unique differences
    
    extra = {'model_type', 'model_treatment', 'drug_owner', 'use_in_publications', 'putative_gene_target', 'putative_target', 'target_pathway', 'webrelease', 'PUBCHEM', 'drug_name', 'CHEMBL', 'drug_synonyms', 'drug_id'}
    columns_not_different = different_columns_set - extra
    
    print(f"All unique different columns: {unique_different_columns}")
    print(f"Columns with the same values but not different: {columns_not_different}")
    for i in columns_not_different:
        print("r."+i+" = row."+i+",")




#read_csv_file()
create_drugs()