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
username = "neo4j"      # Replace with your Neo4j username
password = "workwork"      # Replace with your Neo4j password

def create_Proteins_Synonyms_SWISS_A(tx, csv_file):
  query = """
  CALL apoc.periodic.iterate(
      'LOAD CSV WITH HEADERS FROM "file:///BioGRID/"""+csv_file+"""" AS row FIELDTERMINATOR "\\t" RETURN row',
      '
      MATCH (p1:Protein {uid_0: row.BioGRID_ID_Interactor_A, project_id: 1})
      SET p1.name_0 = row.Official_Symbol_Interactor_A,
      p1.Entrez_Gene_Interactor_0 = row.Entrez_Gene_Interactor_A,
      p1.Systematic_Name_Interactor_0 = row.Systematic_Name_Interactor_A,
      p1.Synonyms_Interactor_0 = SPLIT(row.Synonyms_Interactor_A, "|"),
      p1.Organism_ID_Interactor_0 = row.Organism_ID_Interactor_A,
      p1.SWISS_PROT_Accessions_Interactor_0 = SPLIT(row.SWISS_PROT_Accessions_Interactor_A, "|"),
      p1.TREMBL_Accessions_Interactor_0 = SPLIT(row.TREMBL_Accessions_Interactor_A, "|"),
      p1.REFSEQ_Accessions_Interactor_0 = SPLIT(row.REFSEQ_Accessions_Interactor_A, "|"),
      p1.Organism_Name_Interactor_0 = row.Organism_Name_Interactor_A,
      p1.project_id_0 = 0
      FOREACH (synonymName IN CASE WHEN row.Synonyms_Interactor_A <> "-" THEN SPLIT(row.Synonyms_Interactor_A, "|") ELSE [] END |
          MERGE (syn:Synonym {name: synonymName})
          MERGE (p1)-[r3:HAS_SYNONYM]->(syn)
          SET r3.project_id_0 = 0
      )
      FOREACH (swissName IN CASE WHEN row.SWISS_PROT_Accessions_Interactor_A <> "-" THEN SPLIT(row.SWISS_PROT_Accessions_Interactor_A, "|") ELSE [] END |
    MERGE (s:SWISS {name: swissName})
    MERGE (p1)-[r4:HAS_SWISS]->(s)
    SET r4.project_id_0 = 0

)
      ',
      { batchSize: 100000}
  );
  """
    
  tx.run(query)  # Update "output_directory" with the actual directory path

def create_Proteins_Synonyms_SWISS_B(tx, csv_file):
  query = """
  CALL apoc.periodic.iterate(
      'LOAD CSV WITH HEADERS FROM "file:///BioGRID/"""+csv_file+"""" AS row FIELDTERMINATOR "\\t" RETURN row',
      '
  MATCH (p2:Protein {uid_0: row.BioGRID_ID_Interactor_B, project_id: 1})
  SET p2.name_0 = row.Official_Symbol_Interactor_B,
    p2.Entrez_Gene_Interactor_0 = row.Entrez_Gene_Interactor_B,
    p2.Systematic_Name_Interactor_0 = row.Systematic_Name_Interactor_B,
    p2.Synonyms_Interactor_0 = SPLIT(row.Synonyms_Interactor_B, "|"),
    p2.Organism_ID_Interactor_0 = row.Organism_ID_Interactor_B,
    p2.SWISS_PROT_Accessions_Interactor_0 = SPLIT(row.SWISS_PROT_Accessions_Interactor_B, "|"),
    p2.TREMBL_Accessions_Interactor_0 = SPLIT(row.TREMBL_Accessions_Interactor_B, "|"),
    p2.REFSEQ_Accessions_Interactor_0 = SPLIT(row.REFSEQ_Accessions_Interactor_B, "|"),
    p2.Organism_Name_Interactor_0 = row.Organism_Name_Interactor_B,
    p2.project_id_0 = 0
      FOREACH (synonymName IN CASE WHEN row.Synonyms_Interactor_B <> "-" THEN SPLIT(row.Synonyms_Interactor_B, "|") ELSE [] END |
          MERGE (syn:Synonym {name: synonymName})
          MERGE (p1)-[r3:HAS_SYNONYM]->(syn)
          SET r3.project_id_0 = 0
      )
      FOREACH (swissName IN CASE WHEN row.SWISS_PROT_Accessions_Interactor_B <> "-" THEN SPLIT(row.SWISS_PROT_Accessions_Interactor_B, "|") ELSE [] END |
    MERGE (s:SWISS {name: swissName})
    MERGE (p2)-[r4:HAS_SWISS]->(s)
    SET r4.project_id_0 = 0
)
      ',
      { batchSize: 100000}
  );
  """
  
  tx.run(query)  # Update "output_directory" with the actual directory path

def create_PPI_Connection(tx, csv_file):
  query = """
CALL apoc.periodic.iterate(
  'LOAD CSV WITH HEADERS FROM "file:///BioGRID/"""+csv_file+"""" AS row FIELDTERMINATOR "\\t" RETURN row',
  '
  MATCH (p1:Protein {uid_0: row.BioGRID_ID_Interactor_A})
  MATCH (p2:Protein {uid_0: row.BioGRID_ID_Interactor_B})
  CREATE (p1)-[r:PPI]->(p2)
  SET r.BioGRID_Interaction_ID_0 = row.BioGRID_Interaction_ID,
    r.project_id_0 = 0,
    r.Experimental_System_0 = row.Experimental_System,
    r.Experimental_System_Type_0 = row.Experimental_System_Type,
    r.Author_0 = row.Author,
    r.Publication_Source_0 = row.Publication_Source,
    r.Throughput_0 = SPLIT(row.Throughput, "|"),
    r.Score_0 = row.Score,
    r.Modification_0 = row.Modification,
    r.Qualifications_0 = SPLIT(row.Qualifications, "|"),
    r.Tags_0 = SPLIT(row.Tags, "|"),
    r.Source_Database_0 = row.Source_Database,
    r.Ontology_Term_IDs_0 = SPLIT(row.Ontology_Term_IDs, "|"),
    r.Ontology_Term_Names_0 = SPLIT(row.Ontology_Term_Names, "|"),
    r.Ontology_Term_Categories_0 = SPLIT(row.Ontology_Term_Categories, "|"),
    r.Ontology_Term_Qualifier_IDs_0 = SPLIT(row.Ontology_Term_Qualifier_IDs, "|"),
    r.Ontology_Term_Qualifier_Names_0 = SPLIT(row.Ontology_Term_Qualifier_Names, "|"),
    r.Ontology_Term_Types_0 = SPLIT(row.Ontology_Term_Types, "|")
  ',
  { batchSize: 100000}
);
"""   
  tx.run(query)

def create_Index(tx):
 
  queries = [
        "CREATE INDEX IF NOT EXISTS FOR (p:Protein) ON (p.name_0);",
        "CREATE INDEX IF NOT EXISTS FOR (p:Protein) ON (p.name_0, p.project_id_0);",
        "CREATE INDEX IF NOT EXISTS FOR (p:Protein) ON (p.swiss_0);",
        "CREATE INDEX IF NOT EXISTS FOR (p:Protein) ON (p.swiss_0, p.project_id_0);",
        "CREATE INDEX IF NOT EXISTS FOR (c:Cell_Line) ON (c.name);",
        "CREATE INDEX IF NOT EXISTS FOR (c:Cell_Line) ON (c.uid);",
        "CREATE INDEX IF NOT EXISTS FOR (c:Cell_Line) ON (c.COSMIC_ID);",
        "CREATE INDEX IF NOT EXISTS FOR (d:Drug) ON (d.name);",
        "CREATE INDEX IF NOT EXISTS FOR (d:Drug) ON (d.uid);"
    ] 
  queries = [
        "CREATE INDEX IF NOT EXISTS FOR (p:Protein) ON (p.uid_0);",
        "CREATE INDEX IF NOT EXISTS FOR (s1:SWISS) on (s1.name);",
        "CREATE INDEX IF NOT EXISTS FOR (s:Synonym) ON (s.name);",
        "CREATE INDEX IF NOT EXISTS FOR (p:Protein) ON (p.project_id);"
    ]  
  for query in queries:
        tx.run(query)

def create_BIOGRID():
  csv_files = ["output_1.csv", "output_2.csv", "output_3.csv", "output_4.csv", "output_5.csv", "output_6.csv"]
  with GraphDatabase.driver(uri, auth=(username, password)) as driver:
    with driver.session() as session:
      session.execute_write(create_Index)
    for csv_file in csv_files:
      with driver.session() as session:
        session.execute_write(create_Proteins_Synonyms_SWISS_A, csv_file)
        print(csv_file, "A")
        session.execute_write(create_Proteins_Synonyms_SWISS_B, csv_file)
        print(csv_file, "B")
        #break
    #for csv_file in csv_files:
    #  with driver.session() as session:
    #    session.execute_write(create_PPI_Connection, csv_file)
    #    print(csv_file, "PPI")
create_BIOGRID()
