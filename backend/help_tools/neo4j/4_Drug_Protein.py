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

def query_create_drugs(tx, file_name):
    query = """
            CALL apoc.periodic.iterate(
            'LOAD CSV WITH HEADERS FROM "file:///Drug_Protein/"""+file_name+""".csv" AS row FIELDTERMINATOR "," RETURN row',
            '
            WITH row
            MERGE (d:Drug {name: row.drug_name})
            SET d.uid = apoc.create.uuid(),
            d.project_id = 1',
            { batchSize: 100000}
            );"""
    tx.run(query)
def query_create_index(tx):
    queries = [
        "CREATE INDEX IF NOT EXISTS FOR (d:Drug) ON (d.name);",
        "CREATE INDEX IF NOT EXISTS FOR (r:HAS_SYNONYM) ON (r.project_id);",
        "CREATE INDEX IF NOT EXISTS FOR (p:Protein) ON (p.name);"
    ]
    for query in queries:
        tx.run(query)

def query_check(tx, name):
    query = """
            MATCH (p:Protein {name: $name})
            RETURN count(p) AS count
            """
    result = tx.run(query, name=name).single()
    node_count = result['count'] if result else 0
    
    if node_count == 0:
        print(f"Node with name '{name}' does not exist.")

def test():
    folder_path = 'C:/Users/PC/neo4j/import/Drug_Protein'

    # List to store distinct x_id values
    distinct_x_ids = set()

    # Iterate through each file in the folder
    for filename in os.listdir(folder_path):
        if filename.endswith('.csv') and filename != "lm_sklearn_degr_drug_annotated_diann_051021.csv":
            print(filename)
            file_path = os.path.join(folder_path, filename)
            with open(file_path, newline='') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    # Assuming 'x_id' is the column name
                    distinct_x_ids.add(row['x_id'])

    # Convert the set to a list if needed
    distinct_x_ids_list = list(distinct_x_ids)
    print(len(distinct_x_ids_list))
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            for name in distinct_x_ids_list:
                session.execute_write(query_check, name)



def query_create_connections(tx, file_name):
    print(file_name)
    query = """
            CALL apoc.periodic.iterate(
            'LOAD CSV WITH HEADERS FROM "file:///Drug_Protein/"""+file_name+""".csv" AS row FIELDTERMINATOR "," RETURN row',
            '
            WITH row
            MATCH (d:Drug {name: row.drug_name})
            MATCH (p:Protein{name: row.x_id, project_id: 1})
            CREATE (d)-[r:ASSOCIATION]->(p)
            SET r.n = toInteger(row.n),
            r.beta = toFloat(row.beta),
            r.lr = toFloat(row.lr),
            r.covs = toInteger(row.covs),
            r.pval = toFloat(row.pval),
            r.fdr = toFloat(row.fdr),
            r.nc_beta = toFloat(row.nc_beta),
            r.nc_lr = toFloat(row.nc_lr),
            r.nc_pval = toFloat(row.nc_pval),
            r.nc_fdr = toFloat(row.nc_fdr),
            r.r2 = toFloat(row.r2),
            r.target = row.target,
            r.ppi = toInteger(row.ppi),
            r.skew = toFloat(row.skew),
            r.GDSC = row.GDSC,
            r.drug_id = row.drug_id,
            r.project_id = 1',
            { batchSize: 100000}
            );"""
    tx.run(query)    
def create_drugs():
    start_time = time.time()
    files = ['Drug_Protein_1','Drug_Protein_2','Drug_Protein_3','Drug_Protein_4','Drug_Protein_5','Drug_Protein_6','Drug_Protein_7','Drug_Protein_8','Drug_Protein_9']
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            session.execute_write(query_create_index)
            #session.execute_write(query_create_drugs)
            #for file_name in files:
            #    session.execute_write(query_create_drugs, file_name)
            #    print(file_name)
            for file_name in files:
                session.execute_write(query_create_connections, file_name)
                print(file_name)
    end_time = time.time()
    execution_time = end_time - start_time

    print(f"Execution time: {execution_time} seconds")
create_drugs()
#test()
def process_csv_files():
    folder_path="C:/Users/PC/neo4j/import/Drug_Protein"
    for filename in os.listdir(folder_path):
        if filename.endswith(".csv"):
            file_path = os.path.join(folder_path, filename)
            df = pd.read_csv(file_path)

            # Splitting the 'y_id' column by ';' into separate columns
            df[['drug_id', 'drug_name', 'GDSC']] = df['y_id'].str.split(';', expand=True)
            
            # Drop the original 'y_id' column
            df.drop(columns=['y_id'], inplace=True)

            # Save the modified dataframe to a new CSV file
            new_filename = f"{filename}"
            new_file_path = os.path.join(folder_path, new_filename)
            df.to_csv(new_file_path, index=False)
            print(f"File '{filename}' processed. Saved as '{new_filename}'.")

# Replace 'folder_path' with the path to your folder containing the CSV files
#process_csv_files()
