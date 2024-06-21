import json
import os
from neo4j import GraphDatabase

uri = os.getenv("NEO4J_URI")
username = os.getenv("NEO4J_USER")
password = os.getenv("NEO4J_PASSWORD")

#uri = "bolt://localhost:7687"  # Replace with your Neo4j server's URI
#username = "neo4j"             # Replace with your Neo4j username
#password = "workwork"          # Replace with your Neo4j password
bad_attributes = ["synonyms", "Organism_ID_Interactor_0", "uid_0", "Entrez_Gene_Interactor_0", "COSMIC_ID", "Sample_Name", "name", "model_name","cell_line_name","master_cell_id","BioGRID_Interaction_ID_0","drug_type_number","drug_protein_GDSC1_louvain_local","drug_protein_GDSC2_louvain_local","drug_protein_GDSC1_louvain_global","drug_protein_GDSC2_louvain_global","drug_drug_GDSC2_cosine_louvain_more_communities","drug_drug_GDSC1_cosine_louvain_more_communities","drug_drug_GDSC2_cosine_louvain","drug_drug_GDSC1_cosine_louvain", "ATC_number","drug_status","SureChEMBL","drug_protein_community_louvain_label","Publication_Sources"]# webrealse, pubchem, drug_id

def updateDBQueryRelationships(tx):
    query = """
    MATCH (startNode)-[r]->(endNode)
    WHERE type(r) <> 'HAS_SYNONYM' AND type(r) <> 'HAS_SWISS'
    RETURN DISTINCT type(r) AS RelationshipType, labels(startNode) AS StartNodeLabels, labels(endNode) AS EndNodeLabels
    """
    results = tx.run(query)
    data = []
    for record in results:
        start_label = '-'.join(record['StartNodeLabels'])
        end_label = '-'.join(record['EndNodeLabels'])
        if start_label > end_label:
            start_label, end_label = end_label, start_label
        combined_label = f"{start_label}-{end_label}"
        data.append({
            "RelationshipType": record['RelationshipType'],
            "NodeLabel": combined_label
        })
    return data


def updateDBQueryNode(tx):
    query = """
    MATCH (n)
    WHERE NONE(label IN labels(n) WHERE label = 'SWISS' OR label = 'Synonym')
RETURN DISTINCT labels(n) AS NodeLabels

    """
    results = tx.run(query)
    data = [label for record in results for label in record['NodeLabels'] if label]
    return data


def convert_to_integer(value):
    try:
        if '.' in str(value):
            integer_value = float(value)
        else:
            integer_value = int(value)
        return integer_value
    except ValueError:
        # Value couldn't be converted to an integer
        return None

def updateDBQueryList(tx, result_data2):
    #print(result_data2)
    data = []
    for nodeName in result_data2:
        query = f"""
        MATCH (c:{nodeName})
        UNWIND keys(c) AS attribute
        WITH DISTINCT attribute AS uniqueAttributes
        MATCH (c:{nodeName})
        WHERE c[uniqueAttributes] IS NOT NULL
        WITH uniqueAttributes, COLLECT(DISTINCT c[uniqueAttributes]) AS uniqueValues
        WHERE SIZE(uniqueValues) <= 50
        RETURN uniqueAttributes, uniqueValues, SIZE(uniqueValues) AS numUniqueValues
        """
        results = tx.run(query)
        attributes = []
        for record in results:
            if len(record['uniqueValues']) > 1 and not record['uniqueAttributes'] in bad_attributes:
                attributes.append({ 'name': record['uniqueAttributes'], 'type': 'list', 'values': record['uniqueValues'], 'valuesChange': record['uniqueValues']})
        queryNumber = f"""
MATCH (n:{nodeName})
UNWIND keys(n) AS attribute
WITH attribute, n[attribute] AS attributeValue
WHERE attributeValue IS NOT NULL
WITH attribute, attributeValue
WHERE NOT(attributeValue CONTAINS "[")  // Check that it does not contain "["
WITH attribute, 
     CASE 
       WHEN attributeValue =~ '^-?\\d+\\.?\\d*$' THEN toFloat(attributeValue)
       ELSE NULL
     END AS numericValue
WHERE numericValue IS NOT NULL
WITH attribute, COLLECT(DISTINCT numericValue) AS attributeValues
WHERE SIZE(attributeValues) > 1
RETURN attribute,
       REDUCE(min_val = NULL, val IN attributeValues | CASE WHEN min_val IS NULL OR val < min_val THEN val ELSE min_val END) AS min_value,
       REDUCE(max_val = NULL, val IN attributeValues | CASE WHEN max_val IS NULL OR val > max_val THEN val ELSE max_val END) AS max_value

        """
        resultsNumber = tx.run(queryNumber)
        for record in resultsNumber:
            if record['min_value'] != record['max_value'] and not record['attribute'] in bad_attributes:
                min_v = record['min_value'] 
                max_v = record['max_value'] 
                if(convert_to_integer(record['min_value']) != None and convert_to_integer(record['max_value']) != None):
                    min_v = convert_to_integer(record['min_value']) 
                    max_v= convert_to_integer(record['max_value']) 
                attributes.append({ 'name': record['attribute'], 'type': 'num', 'min': min_v, 'max': max_v, 'minChange': min_v, 'maxChange': max_v})






        data.append({'name': nodeName, 'attributes': attributes})
    return data


def updateDBQueryListRel(tx, result_data1):
    #print(result_data1)
    data = []
    for nodeName2 in result_data1:
        nodeName = nodeName2['RelationshipType']
        query = f"""
        MATCH ()-[c:{nodeName}]-()
        UNWIND keys(c) AS attribute
        WITH DISTINCT attribute AS uniqueAttributes
        LIMIT 50
        MATCH ()-[c:{nodeName}]-()
        WHERE c[uniqueAttributes] IS NOT NULL
        WITH uniqueAttributes, COLLECT(DISTINCT c[uniqueAttributes]) AS uniqueValues
        WHERE SIZE(uniqueValues) <= 50
        RETURN uniqueAttributes, uniqueValues, SIZE(uniqueValues) AS numUniqueValues
        """
        results = tx.run(query)
        attributes = []
        for record in results:
            if len(record['uniqueValues']) > 1 and not record['uniqueAttributes'] in bad_attributes:
                attributes.append({ 'name': record['uniqueAttributes'], 'type': 'list', 'values': record['uniqueValues'], 'valuesChange': record['uniqueValues']})
        queryNumber = f"""
MATCH ()-[p:{nodeName}]-()
UNWIND keys(p) AS attribute
WITH attribute, p[attribute] AS value
WHERE not attribute in ['REFSEQ_Accessions_Interactor_0','SWISS_PROT_Accessions_Interactor_0','Synonyms_Interactor_0','TREMBL_Accessions_Interactor_0','Throughput_0','Tags_0','Qualifications_0','Ontology_Term_Types_0','Ontology_Term_Qualifier_Names_0','Ontology_Term_Qualifier_IDs_0','Ontology_Term_Names_0','Ontology_Term_IDs_0','Ontology_Term_Categories_0','Publication_Sources']
WITH attribute, value
WHERE tointeger(value) is not null
WITH attribute, COLLECT(value) AS values
RETURN attribute,
       REDUCE(s = values[0], v IN values | CASE WHEN v > s THEN v ELSE s END) AS max_value,
       REDUCE(s = values[0], v IN values | CASE WHEN v < s THEN v ELSE s END) AS min_value


        """
        print(queryNumber)
        resultsNumber = tx.run(queryNumber)
        for record in resultsNumber:
            if record['min_value'] != record['max_value'] and not record['attribute'] in bad_attributes:
                min_v = record['min_value'] 
                max_v = record['max_value'] 
                if(convert_to_integer(record['min_value']) != None and convert_to_integer(record['max_value']) != None):
                    min_v = convert_to_integer(record['min_value']) 
                    max_v= convert_to_integer(record['max_value']) 
                attributes.append({ 'name': record['attribute'], 'type': 'num', 'min': min_v, 'max': max_v, 'minChange': min_v, 'maxChange': max_v})






        data.append({'name': nodeName, 'attributes': attributes})
    return data

def updateDB():
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            result_data1 = session.write_transaction(updateDBQueryRelationships)
            #print(result_data1)

            # Convert the result data to JSON

            result_data2 = session.write_transaction(updateDBQueryNode)
            # Convert the result data to JSON
            
            

            result_data3 = session.write_transaction(updateDBQueryList, result_data2=result_data2)
            result_data4 = session.write_transaction(updateDBQueryListRel, result_data1=result_data1)
            result_data = [result_data1, result_data2, { 'nodes': result_data3, 'relationships': result_data4}]
            json_data = json.dumps(result_data)
            with open('allgemeine_info.json', 'w') as json_file:
                json_file.write(json_data)


#updateDB()
