import csv
from neo4j import GraphDatabase

###########################################################
# Create the Data for the drug ProCan Plot on our website #
###########################################################

pathway_dict = {}
uri = "neo4j://localhost:7687" 
username = "neo4j"
password = "workwork"
driver = GraphDatabase.driver(uri, auth=(username, password))
counter = 0
def get_drug_uids(tx, drug_name):
    all_uids = []
    result = tx.run("MATCH (drug:Drug {name: $drug_name}) RETURN drug.uid AS DrugUID", drug_name=drug_name)
    all_uids = [record["DrugUID"] for record in result]
    return all_uids

with driver.session() as session:
    with open('exportDrugPlot.csv', mode='r', encoding='utf-8-sig') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:

            drug_name = row['DrugName'].strip('""')

            pathway = row['pathway'].strip('""')
            has_association = row['HasAssociationWithGDSC1'].lower() == 'true'

            
            drug_uid = session.read_transaction(get_drug_uids, drug_name)
            counter = counter +1
            print(counter)
            
            # Check if the pathway is already in the dictionary
            if pathway not in pathway_dict:
                pathway_dict[pathway] = {'pathway': pathway, 'drugNames': [], 'count': 0}
            
            # Append drug information to the pathway's drugNames list
            pathway_dict[pathway]['drugNames'].append([drug_name, drug_uid, has_association])
            
            # Increment the count
            pathway_dict[pathway]['count'] += 1

# Convert the dictionary values to a list
resulting_array = list(pathway_dict.values())

# Sort the array in descending order based on the 'count' field
resulting_array.sort(key=lambda x: x['count'], reverse=True)

# Save the resulting array to a file (e.g., JSON format)
import json
with open('result2.json', 'w') as json_file:
    json.dump(resulting_array, json_file, indent=2)

