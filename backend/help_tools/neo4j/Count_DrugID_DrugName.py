import csv
from neo4j import GraphDatabase
# Initialize an empty dictionary to store pathways and associated drugs
pathway_dict = {}
uri = "neo4j://localhost:7687"  # Replace with your Neo4j server URI
username = "neo4j"
password = "workwork"
driver = GraphDatabase.driver(uri, auth=(username, password))
counter = 0

#############################################################
# Counts the number of Drugs based on Drug_ID and Drug_Name #
#############################################################

results_array = []

def get_drug_uids(tx):
    result = tx.run("MATCH (drug:Drug)-[r:ASSOCIATION]-(p) RETURN DISTINCT drug.drug_id AS drug_id, drug.name AS name")
    #for record in result:
    #    results_array.append(dict(record)) 
    #print(results_array[0])
    #print(len(results_array))
    drug_counts = {} 
    all_c = 0
    for record in result:
        drug_name = record["name"]
        if drug_name in drug_counts:
            drug_counts[drug_name] += 1
            if drug_counts[drug_name] == 6:
                print(drug_name)            
        else:
            drug_counts[drug_name] = 1
            all_c += 1
    
    #for name, count in drug_counts.items():
    #    print(f"{count} drug names appear {name} times in the dataset")
  
    drug_counts2 = {} 
   
    for name, count in drug_counts.items():
        if count in drug_counts2:
            drug_counts2[count] += 1

        else:
            drug_counts2[count] = 1
    
    print(drug_counts2)
    print(all_c)


with driver.session() as session:
    session.write_transaction(get_drug_uids)
