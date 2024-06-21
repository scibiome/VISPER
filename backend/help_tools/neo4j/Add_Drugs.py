import csv
from neo4j import GraphDatabase
#########################
# Add drugs to neo4j db #
#########################

def get_or_create_drug(tx, drug_id):
    result = tx.run(
        "MATCH (d:Drug {id: $drug_id})"
        " RETURN d",
        drug_id=drug_id,
    )
    record = result.single()
    return record is None

csv_file = "C:/Users/PC/neo4j/import/mmc6.csv" 

unique_values = set()

uri = "bolt://localhost:7687" 
username = "neo4j"
password = "workwork"

driver = GraphDatabase.driver(uri, auth=(username, password))

with open(csv_file, "r") as csvfile:
    reader = csv.reader(csvfile, delimiter=";")
    next(reader) 
    i = 0
    for row in reader:
        drug_id = row[0]
        i = i +1
        with driver.session() as session:
            drug_node = session.write_transaction(get_or_create_drug, drug_id)
            if drug_node:
                unique_values.add((row[0], row[1]))
                if i >20:
                    break

driver.close()

for value in unique_values:
    print(f"Drug ID: {value[0]}, Value: {value[1]}")
