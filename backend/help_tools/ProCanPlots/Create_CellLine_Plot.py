import csv
from neo4j import GraphDatabase
##############################################
# Create Cell Line plot bar for tissue types #
##############################################
pathway_dict = {}
uri = "neo4j://localhost:7687" 
username = "neo4j"
password = "workwork"
driver = GraphDatabase.driver(uri, auth=(username, password))
counter = 0
with driver.session() as session:
    with open('celllineTissue.csv', mode='r', encoding='utf-8-sig') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            drug_name = row['name'].strip('""')


            pathway = row['Tissue_type'].strip('""')

            drug_uid = row['uid'].strip('""')
            counter = counter +1
            print(counter)
            
            if pathway not in pathway_dict:
                pathway_dict[pathway] = {'category_name': pathway, 'names': [], 'count': 0}
            
            pathway_dict[pathway]['names'].append([drug_name, drug_uid])
            
            pathway_dict[pathway]['count'] += 1

resulting_array = list(pathway_dict.values())

resulting_array.sort(key=lambda x: x['count'], reverse=True)

import json
with open('resultCellline.json', 'w') as json_file:
    json.dump(resulting_array, json_file, indent=2)

print("Resulting array saved to 'result.json'")
