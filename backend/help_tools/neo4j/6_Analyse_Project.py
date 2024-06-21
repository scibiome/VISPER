from neo4j import GraphDatabase
import pandas as pd
import json
import csv
import os
import tqdm
import requests

csv.field_size_limit(200000)
# Specify the connection details
uri = "bolt://localhost:7687"  # Replace with your Neo4j server's URI
username = "neo4j"  # Replace with your Neo4j username
password = "workwork"  # Replace with your Neo4j password


def get_nodes(project_id):
    node_types = []
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            result = session.run(
                """MATCH (n)
                WHERE n.project_id IS NOT NULL AND n.project_id = $project_id
                RETURN DISTINCT labels(n) AS node_types
                """,
                project_id=project_id,
            )
            for record in result:
                node_types.extend(record["node_types"])
    return node_types


def get_relationships_and_connected_nodes(project_id):
    relationships_info = []
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            result = session.run(
                """
                MATCH (n1)-[r]->(n2)
                WHERE r.project_id IS NOT NULL AND r.project_id = $project_id AND type(r) <> "HAS_SYNONYM" AND type(r) <> "HAS_SYNONYM"
                RETURN DISTINCT type(r) AS relationship_type, 
                                labels(n1) AS n1, 
                                labels(n2) AS n2
                """,
                project_id=project_id,
            )
            for record in result:
                relationship_type = record["relationship_type"]
                n1 = record["n1"][0]
                n2 = record["n2"][0]
                if relationship_type != "EQUAL_PROTEIN":
                    relationships_info.append(
                        {"name": relationship_type, "n1": n1, "n2": n2}
                    )

    return relationships_info


def get_min_max_values(project_id, node_types):
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            for node_type in node_types:
                node_types = []

                result = session.run(
                    """MATCH ()-[p:ASSOCIATION{project_id: 1}]->()
UNWIND keys(p) AS attribute
WITH p, attribute, p[attribute] AS value
WHERE 
  attribute <> "label" AND 
  attribute <> "id" AND 
  attribute <> "synonyms"
WITH attribute, toFloat(value) AS numValue
RETURN 
  attribute, 
  MIN(numValue) AS min_value, 
  MAX(numValue) AS max_value

                """,
                    project_id=project_id,
                )
            for record in result:
                node_types.extend(record["node_types"])
    return node_types


def get_values_nodes(project_id, node_types):
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            n = []
            for node_type in node_types:
                node_types_values = {"name": node_type, "attributes": []}

                result = session.run(
                    """MATCH (n:"""
                    + node_type
                    + """{project_id: $project_id})
                    UNWIND keys(n) AS attribute
                    WITH  n, attribute
                    WHERE 
                    attribute <> "label" AND 
                    attribute <> "id" AND 
                    attribute <> "synonyms" AND
                    attribute <> "swiss" AND
                    attribute <> "project_id"
                    WITH attribute, collect(DISTINCT n[attribute]) AS values
                    WHERE size(values) <= 50 AND size(values) > 1 AND all(value IN values WHERE value <> '' AND NOT toFloat(value) IS NOT NULL)
                    RETURN attribute, collect(DISTINCT values) AS distinct_values

                """,
                    project_id=project_id,
                )
                for record in result:
                    node_types_values["attributes"].append(
                        {
                            "name": record["attribute"],
                            "type": "list",
                            "values": record["distinct_values"][0],
                            "valuesChange": record["distinct_values"][0],
                        }
                    )
                n.append(node_types_values)

            for element in n:
                node_name = element["name"]
                result = session.run(
                    """MATCH (p:"""
                    + node_name
                    + """{project_id: $project_id})
                    UNWIND keys(p) AS attribute
                    WITH p, attribute, p[attribute] AS value
                    WHERE 
                    attribute <> "label" AND 
                    attribute <> "id" AND 
                    attribute <> "synonyms" AND 
                    attribute <> "project_id"
                    WITH attribute, toFloat(value) AS numValue
                    WHERE numValue IS NOT NULL
                    RETURN 
                    attribute, 
                    MIN(numValue) AS min_value, 
                    MAX(numValue) AS max_value
                """,
                    project_id=project_id,
                )
                for record in result:
                    element["attributes"].append(
                        {
                            "name": record["attribute"],
                            "type": "num",
                            "min": record["min_value"],
                            "max": record["max_value"],
                            "minChange": record["min_value"],
                            "maxChange": record["max_value"],
                        }
                    )

    print(n)
    return n


def get_values_relationships(project_id, relationship_types):
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            n = []
            for node_type in relationship_types:
                node_types_values = {"name": node_type["name"], "n1": node_type["n1"],"n2": node_type["n2"],"attributes": []}
                result = session.run(
                    """MATCH (()-[n:"""
                    + node_type["name"]
                    + """{project_id: $project_id}]->() )
                    UNWIND keys(n) AS attribute
                    WITH  n, attribute
                    WHERE 
                    attribute <> "label" AND 
                    attribute <> "id" AND 
                    attribute <> "synonyms" AND
                    attribute <> "swiss" AND
                    attribute <> "project_id"
                    WITH attribute, collect(DISTINCT n[attribute]) AS values
                    WHERE size(values) <= 50 AND size(values) > 1 AND all(value IN values WHERE value <> '' AND NOT toFloat(value) IS NOT NULL)
                    RETURN attribute, collect(DISTINCT values) AS distinct_values

                """,
                    project_id=project_id,
                )
                for record in result:
                    node_types_values["attributes"].append(
                        {
                            "name": record["attribute"],
                            "type": "list",
                            "values": record["distinct_values"][0],
                            "valuesChange": record["distinct_values"][0],
                        }
                    )
                n.append(node_types_values)

            for element in n:
                node_name = element["name"]
                print("servus", node_name, type(node_name))
                result = session.run(
                    """MATCH (()-[p:"""
                    + node_name
                    + """{project_id: $project_id}]->() )
                    UNWIND keys(p) AS attribute
                    WITH p, attribute, p[attribute] AS value
                    WHERE 
                    attribute <> "label" AND 
                    attribute <> "id" AND 
                    attribute <> "synonyms" AND
                    attribute <> "project_id"
                    WITH attribute, toFloat(value) AS numValue
                    WHERE numValue IS NOT NULL
                    RETURN 
                    attribute, 
                    MIN(numValue) AS min_value, 
                    MAX(numValue) AS max_value
                """,
                    project_id=project_id,
                )
                for record in result:
                    element["attributes"].append(
                        {
                            "name": record["attribute"],
                            "type": "num",
                            "min": record["min_value"],
                            "max": record["max_value"],
                            "minChange": record["min_value"],
                            "maxChange": record["max_value"],
                        }
                    )

    print(n)
    return n


def get_informationen(project_id):
    node_types = get_nodes(project_id)
    relationship_types = get_relationships_and_connected_nodes(project_id)
    print(relationship_types)
    a = get_values_nodes(project_id, node_types)
    b = get_values_relationships(project_id, relationship_types)
    all_data = {"nodes": a, "relationships": b}
    print(all_data)


get_informationen(1)
