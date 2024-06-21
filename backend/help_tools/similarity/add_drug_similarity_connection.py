from neo4j import GraphDatabase
import pandas as pd


########################################################################################################################################################
# Add Drug_similarity connection between two drugs nodes, with the similarity value and the dataset (e.g. GDSC1) for which the meassurement was taken. #
########################################################################################################################################################



uri = "bolt://localhost:7687"  
username = "neo4j"            
password = "workwork"          

def addSimilarity(tx, file_path):
    similarity_df = pd.read_csv(file_path, index_col=0, dtype=str)
    counter = 0

    for drug1, row in similarity_df.iterrows():
        for drug2, similarity_value in row.items():
            drug2 = int(drug2)
            drug1 = int(drug1)
            
            if drug1 < drug2 and float(similarity_value) > 0:
                
                drug2 = str(drug2)
                drug1 = str(drug1)
                query = (
                    "MATCH (d1:Drug {drug_id: $drug1}), (d2:Drug {drug_id: $drug2}) "
                    "CREATE (d1)-[:DRUG_SIMILARITY {value: $similarity_value, dataset: 'GDSC2'}]->(d2)"
                )
                tx.run(query, drug1=drug1, drug2=drug2, similarity_value=similarity_value)
                counter += 1
                print(counter)
                

def update_database():   
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            session.write_transaction(addSimilarity, file_path='similarity_matrix_gdsc21.csv')

update_database()