import csv
from neo4j import GraphDatabase
# Initialize an empty dictionary to store pathways and associated drugs
pathway_dict = {}
uri = "neo4j://localhost:7687"  # Replace with your Neo4j server URI
username = "neo4j"
password = "workwork"
driver = GraphDatabase.driver(uri, auth=(username, password))
counter = 0
# Read the CSV file
def get_drug_uids(tx, drug_uid,drug_synonyms):
    tx.run("MATCH (drug:Drug {drug_id: $drug_uid}) SET drug.PanCan_Synonymes = $drug_synonyms", drug_uid=drug_uid, drug_synonyms = drug_synonyms)

with driver.session() as session:
    with open('C:/Users/pc/Downloads/data/data/bulk download/screened_compounds_rel_8.4.csv', mode='r', encoding='utf-8-sig') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            #print(row)
            drug_uid = row["DRUG_ID"].strip('""')
            drug_synonym = row["SYNONYMS"].strip('""')
            print(drug_uid)
            print(drug_synonym)
            session.write_transaction(get_drug_uids, drug_uid, drug_synonym)

