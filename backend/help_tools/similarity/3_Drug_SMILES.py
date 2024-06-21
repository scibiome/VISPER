import pandas as pd
import numpy as np
import math
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize
from sklearn.manifold import TSNE
from sklearn.manifold import Isomap
import community
from community import community_louvain
import matplotlib.pyplot as plt
from neo4j import GraphDatabase
import networkx as nx
import random
import get_intersection_of_two_drugs
import warnings
from rdkit import Chem, DataStructs
from rdkit.Chem import AllChem
from rdkit.DataStructs import TanimotoSimilarity
import umap

uri = "bolt://localhost:7687"  # Replace with your Neo4j server's URI
username = "neo4j"             # Replace with your Neo4j username
password = "workwork"          # Replace with your Neo4j password





def getDrugsWithSMILE2(tx):
    result  = tx.run("MATCH (d:Drug) WHERE d.SMILES IS NOT NULL RETURN d.drug_id AS drug_id, d.SMILES AS SMILES")
    return [{"drug_id": record["drug_id"], "SMILES": record["SMILES"]} for record in result]



def getDrugsWithSMILE():
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            drugs = session.read_transaction(getDrugsWithSMILE2)
            print(drugs)
            return drugs
        
def calculateTanimoto(drug_list):
    # Extract drug IDs and SMILES
    drug_ids = [drug['drug_id'] for drug in drug_list]
    smiles_list = [drug['SMILES'] for drug in drug_list]
    print("smile ", smiles_list[0])
    # Convert SMILES to RDKit molecules
    #molecules = [Chem.MolFromSmiles(smiles) for smiles in smiles_list]
    #print("molecules ", molecules[0])
    molecules = []
    valid_drug_ids = []
    for i, smiles in enumerate(smiles_list):
        mol = Chem.MolFromSmiles(smiles)
        if mol is not None:
            #print(f"Valid molecule {i}: {smiles}")
            molecules.append(mol)
            valid_drug_ids.append(drug_ids[i])
        else:
            print(f"Invalid molecule {i}: {smiles}")
    # Generate Morgan fingerprints (radius=2)
    #fingerprints = [Chem.RDKFingerprint(mol) for mol in molecules]


    fpgen = AllChem.GetRDKitFPGenerator()
    fingerprints = [fpgen.GetFingerprint(mol) for mol in molecules]
    # Calculate Tanimoto similarity matrix
    num_drugs = len(valid_drug_ids)
    similarity_matrix = np.zeros((num_drugs, num_drugs))
    for i in range(num_drugs):
        for j in range(num_drugs):
            if i <= j:  # Tanimoto similarity is symmetric
                similarity = DataStructs.TanimotoSimilarity(fingerprints[i], fingerprints[j])
                similarity_matrix[i, j] = similarity
                similarity_matrix[j, i] = similarity

    # Create a DataFrame for the similarity matrix
    similarity_df = pd.DataFrame(similarity_matrix, index=valid_drug_ids, columns=valid_drug_ids)
    print(similarity_df)
    return similarity_df, valid_drug_ids


def dimensionality_reduction(similarity_matrix, valid_drug_ids):
    similarity_matrix_values = similarity_matrix.values
    #t-SNE
    tsne_result_global = TSNE(n_components=2, random_state=0, n_iter=1000, n_iter_without_progress=300, perplexity=30).fit_transform(similarity_matrix_values)
    tsne_result_local = TSNE(n_components=2, random_state=0, n_iter=1000, n_iter_without_progress=300, perplexity=5).fit_transform(similarity_matrix_values)

    updateDB2(valid_drug_ids, tsne_result_global[:, 0], tsne_result_global[:, 1], "All", "tanimoto_tsne_global")
    updateDB2(valid_drug_ids, tsne_result_local[:, 0], tsne_result_local[:, 1], "All", "tanimoto_tsne_local")


    # isomap
    isomap_result_global = Isomap(n_components=2, n_neighbors=30).fit_transform(similarity_matrix_values)
    isomap_result_local = Isomap(n_components=2, n_neighbors=5).fit_transform(similarity_matrix_values)

    # umap
    umap_result_gloabl = umap.UMAP(n_components=2, random_state=0, n_neighbors=30, min_dist=0.1).fit_transform(similarity_matrix_values)
    umap_result_local = umap.UMAP(n_components=2, random_state=0, n_neighbors=5, min_dist=0.1).fit_transform(similarity_matrix_values)


    # louvain
    G1 = nx.Graph() #GDSC1



    communities_normal = community_louvain.best_partition(G1)


def writeDB(tx, node_names, tsne_x, tsne_y, gdsc, methode):
    counter = 0
    for node_name, x, y in zip(node_names, tsne_x, tsne_y):
        # Extract the drug_id from the node_name
        drug_id = node_name.split(';')[0]
        query = f"""
        MATCH (n:Drug {{drug_id: "{drug_id}"}})
        SET n.drug_drug_{gdsc}_{methode} = 1
        SET n.drug_drug_{gdsc}_{methode}_x = {x}
        SET n.drug_drug_{gdsc}_{methode}_y = {y}
        """
        #print(query)
        tx.run(query)
        counter += 1
        print(drug_id, counter)



def updateDB2(node_names, tsne_x, tsne_y, gdsc, methode):
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            #chembl_ids = session.write_transaction(getList)  # Retrieve chembl_ids
            #session.write_transaction(writeDB2, node_names=node_names, tsne_x=tsne_x, tsne_y=tsne_y, chembl_ids=chembl_ids)
            session.write_transaction(writeDB, node_names=node_names, tsne_x=tsne_x, tsne_y=tsne_y, gdsc=gdsc, methode=methode)




drug_list = getDrugsWithSMILE()
similarity_df, valid_drug_ids  = calculateTanimoto(drug_list)
similarity_matrix = np.array(similarity_df)
dimensionality_reduction(similarity_df, valid_drug_ids)


