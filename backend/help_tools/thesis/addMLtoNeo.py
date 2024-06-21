import json
from neo4j import GraphDatabase

#############################
# Add Louvain Data to neo4j #
#############################

uri = "bolt://localhost:7687"  
username = "neo4j"             
password = "workwork"         

def writeDB(tx, node_names, community_labels, tsne_x, tsne_y):
    counter = 0
    for node_name, community, x, y in zip(node_names, community_labels, tsne_x, tsne_y):
        query = f"""
        MATCH (n {{name: "{node_name}"}})
        WHERE (LABELS(n)[0] = "Protein" OR LABELS(n)[0] = "Drug") and n.project_id = 1
        SET n.drug_protein_community_louvain_label = {community}
        SET n.drug_protein_community_louvain_x = {x}
        SET n.drug_protein_community_louvain_y = {y}
        """
        #print(query)
        tx.run(query)
        counter += 1
        print(counter)



def updateDB2(node_names, community_labels, tsne_x, tsne_y):
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            session.write_transaction(writeDB, node_names=node_names, community_labels=community_labels, tsne_x=tsne_x, tsne_y=tsne_y)

