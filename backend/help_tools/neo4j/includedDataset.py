from neo4j import GraphDatabase
import pandas as pd
import json
import csv
import os
import tqdm
import requests
csv.field_size_limit(200000)

############################################
# Integrate ProCan Data in to the neo4j db #
############################################

uri = "bolt://localhost:7687" 
username = "neo4j"      
password = "workwork"   
gene_names = ["ATP5PO", "ATP5PB", "ATP5F1B", "MRPL58", "ATP5PF", "ATP5F1C", "JPT2", "ATP5PD", "MT-ATP8", "ATP5ME", "ATP5IF1", "CIAO2A", "CIAO2B", "MMUT", "ATP5MG", "KYAT1", "MT-CO2", "JCHAIN", "ADGRL2", "ATP5F1A", "VIRMA", "NAXE", "PIP4P2", "RFLNB", "PIP4P1", "NECTIN4", "BORCS5", "PLPBP", "WASHC5", "RIPOR1", "JPT1", "NECTIN2", "WASHC2A", "PRUNE1", "SELENOH", "ADGRF1", "TOMM70", "SPOUT1", "ATP5F1D", "ITPRID2", "KYAT3", "MCRIP1", "PRXL2A", "MMP24OS", "PCLAF", "ECPAS", "LNPK", "MELTF", "INTS13", "TIMM29", "CEMIP2", "CARD19", "MAP3K20", "BABAM2", "SINHCAF", "PYCR3", "DGLUCY", "PPP4R3A", "RETREG2", "ADGRE5", "SELENOO", "PPP4R3B", "ADGRG1", "BORCS6", "HDGFL3", "PIMREG", "WASHC3", "MICOS13", "CCDC9B", "NECTIN1", "EEF1AKNMT", "PUDP", "HDGFL2", "ATP5MF", "METTL26", "INTS14", "BORCS7", "KIRREL1", "ABRAXAS2", "SPINDOC", "DMAC2L", "CFAP298", "ADGRG6", "SHTN1", "SELENOS", "NAXD", "SELENOF", "MACO1", "FAM234A", "ATP5MPL", "TASOR2", "RETREG3"]

gene_names3 = [
    "ATP5PO", "ATP5PB", "ATP5F1B", "MRPL58", "ATP5PF", "ATP5F1C", "JPT2", "ATP5PD", "TRIR",
    "MT-ATP8", "GLMP", "ATP5ME", "ERO1B", "RTRAF", "ATP5IF1", "CIAO2A", "CIAO2B", "MMUT", "PYM1",
    "MAIP1", "ATP5MG", "KYAT1", "MT-CO2", "JCHAIN", "ADGRL2", "ATP5F1A", "NCBP3", "PIP4P1", "BORCS5",
    "PLPBP", "MTREX", "SRPRA", "WASHC2A", "SELENOH", "ADGRF1", "SPOUT1", "ATP5F1D", "ITPRID2", "PRXL2A",
    "SPART", "ECPAS", "RELCH", "JPT1", "MAP3K20", "QTRT2", "MCRIP1", "NECTIN2", "ADGRE5", "CZIB", "ADGRG1",
    "GSDME", "BORCS6", "HDGFL3", "LNPK", "EEF1AKNMT", "CEMIP2", "HDGFL2", "PAXX", "TKFC", "PIP4P2", "MYDGF",
    "COQ8B", "VIRMA", "RIDA", "DMAC2L", "EIPR1", "RIPOR1", "COQ8A", "NAXE", "MICOS13", "TOMM70", "SELENOO",
    "TSTD1", "FAM234A", "HDHD5", "SELENOF", "SHTN1", "PPP4R3A", "BABAM2", "SINHCAF", "PUDP", "RIOX1", "RCC1L",
    "MEAK7", "PIMREG", "NAXD", "DGLUCY", "ESS2", "RETREG3", "DMAC2", "MELTF", "SPINDOC", "ABRAXAS2", "MMP24OS",
    "NECTIN1", "CARD19", "NECTIN4", "WASHC3"
]

def query_mmc6(tx):
    query2 = ("""
LOAD CSV WITH HEADERS FROM 'file:///mmc6.csv' AS row
FIELDTERMINATOR ';'
MERGE (drug:Drug {id: row.drug_id})
SET drug.name = row.drug_name
OPTIONAL MATCH (p:Protein)
WHERE toLower(p.name) = toLower({row.x_id}) and p.Organism_Name_Interactor="Homo sapiens"
WITH p
WHERE p IS NULL
OPTIONAL MATCH (p2:Protein)
WHERE ANY(sname IN p2.Synonyms_Interactor WHERE toLower(sname) = toLower({row.x_id})) and p2.Organism_Name_Interactor="Homo sapiens"
WITH drug, COALESCE(p, p2) AS protein, row
LIMIT 1

CREATE (drug)-[r:dataset_1]-(protein)
    SET r.n = toInteger(row.n),
    r.beta = toFloat(replace(row.beta, ',', '.')),
    r.lr = toFloat(replace(row.lr, ',', '.')),
    r.covs = toInteger(row.covs),
    r.pval = toFloat(replace(row.pval, ',', '.')),
    r.fdr = toFloat(replace(row.fdr, ',', '.')),
    r.nc_beta = toFloat(replace(row.nc_beta, ',', '.')),
    r.nc_lr = toFloat(replace(row.nc_lr, ',', '.')),
    r.nc_pval = toFloat(replace(row.nc_pval, ',', '.')),
    r.nc_fdr = toFloat(replace(row.nc_fdr, ',', '.')),
    r.r2 = toFloat(replace(row.r2, ',', '.')),
    r.target = row.target,
    r.ppi = toInteger(row.ppi),
    r.skew = toFloat(replace(row.skew, ',', '.')),
    r.GDSC = row.GDSC
"""
    )
    #tx.run(query)
    query = """
LOAD CSV WITH HEADERS FROM 'file:///mmc6.csv' AS row
FIELDTERMINATOR ';'
WITH row
LIMIT 10
MATCH (existingProtein:Protein {name: row.x_id})
WHERE existingProtein IS NULL
RETURN DISTINCT row.x_id AS unmatchedProteinName
"""

    result = tx.run(query)
    print(result)
    unmatched_proteins = [record["unmatchedProteinName"] for record in result]
    print(unmatched_proteins)    

def mmc6():
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            session.write_transaction(query_mmc6)
    file_path = "database.json"
    projectName = "Drug-Protein Associations"
    projectID = 1
    projectNodeInformation = []
    projectEdge = ["Drug-Protein Association"]
    status = 1
    md_content = "Work in Progress"
    with open(file_path, 'w') as file:
        json.dump([[projectName, projectID, projectNodeInformation, projectEdge, status, md_content]], file)




def query_cell_lines_details(tx):
    query = ("""
LOAD CSV WITH HEADERS FROM 'file:///Cell_Lines_Details_1.csv' AS row FIELDTERMINATOR ';'
WITH row
CREATE (c:Cell_Line)
SET c.Sample_Name = row.Sample_Name,
    c.COSMIC_ID = toInteger(row.COSMIC_ID),
    c.Whole_Exome_Sequencing = row.Whole_Exome_Sequencing,
    c.Copy_Number_Alterations = row.Copy_Number_Alterations,
    c.Gene_Expression = row.Gene_Expression,
    c.Methylation = row.Methylation,
    c.Drug_Response = row.Drug_Response,
    c.GDSC_Tissue_descriptor_1 = row.GDSC_Tissue_descriptor_1,
    c.GDSC_Tissue_descriptor_2 = row.GDSC_Tissue_descriptor_2,
    c.Cancer_Type = row.Cancer_Type,
    c.Microsatellite_instability_Status = row.Microsatellite_instability_Status,
    c.Screen_Medium = row.Screen_Medium,
    c.Growth_Properties = row.Growth_Properties,
    c.Cancer_Type_Name = 
        CASE row.Cancer_Type
            WHEN 'PAAD' THEN 'Pancreatic adenocarcinoma'
            WHEN 'PRAD' THEN 'Prostate adenocarcinoma'
            WHEN 'SCLC' THEN 'Small Cell Lung Cancer'
            WHEN 'SKCM' THEN 'Skin Cutaneous Melanoma'
            WHEN 'STAD' THEN 'Stomach adenocarcinoma'
            WHEN 'THCA' THEN 'Thyroid carcinoma'
            WHEN 'UCEC' THEN 'Uterine Corpus Endometrial Carcinoma'
            ELSE ''
        END,
    c.MSI_Data = 
        CASE row.MSI
            WHEN 'MSS' THEN 'Microsatellite class stable (0 of 5 markers show instability)'
            WHEN 'MSI-L' THEN 'Microsatellite instability low (1 of 5 markers show instability)'
            WHEN 'MSI-H' THEN 'Microsatellite instability High (>=2 of 5 markers show instability)'
            ELSE ''
        END,
    c.Screen_Medium_Description = 
        CASE row.Screen_Medium
            WHEN 'D/F12' THEN 'DMEM/F12: DMEM/F12, 10% FBS, 1% PenStrep'
            WHEN 'D/F12+10' THEN 'DMEM/F12+additonal 10%FBS: DMEM/F12, 20% FBS, 1% PenStrep'
            WHEN 'R' THEN 'RPMI: RPMI, 10% FBS, % PenStrep, % Glucose, 1mM Sodium Pyruvate'
            WHEN 'R+10' THEN 'RPMI+additonal 10%FBS: RPMI, 20% FBS, % PenStrep, % Glucose, 1mM Sodium Pyruvate'
            WHEN 'H' THEN 'Hites: 5ug/ml Insulin, 10nM B-estradiol, 10uM Hydrocortisone'
            ELSE ''
        END;
"""
    )
    tx.run(query)    

def query_cell_lines_details_2(tx):
    query = ("""
LOAD CSV WITH HEADERS FROM 'file:///Cell_Lines_Details_2.csv' AS row FIELDTERMINATOR ';'
WITH row
MERGE (c:Cell_Line {COSMIC_ID: toInteger(row.COSMIC_ID)})
ON CREATE SET
    c.Sample_Name = row.Line
SET c.COSMIC_ID = toInteger(row.COSMIC_ID),
    c.Site = row.Site,
    c.Histology = row.Histology,
    c.Synonyms = CASE
        WHEN NOT c.Sample_Name = row.Line THEN COALESCE(c.Synonyms, []) + [row.Line]
        ELSE c.Synonyms
    END;
"""
    )
    tx.run(query)  


def cell_lines_details():
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            session.write_transaction(query_cell_lines_details)
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            session.write_transaction(query_cell_lines_details_2)


def query_protein_matrix(tx):
    query = ("""
LOAD CSV WITH HEADERS FROM 'file:///mmc6.csv' AS row
FIELDTERMINATOR ';'
MERGE (c:Cell_Line {Sample_name: })
MERGE (protein:Protein {name: row.x_id})

WITH drug, protein, row
CREATE (drug)-[r:dataset_1]->(protein)
    SET r.n = toInteger(row.n),
    r.beta = toFloat(replace(row.beta, ',', '.')),
    r.lr = toFloat(replace(row.lr, ',', '.')),
    r.covs = toInteger(row.covs),
    r.pval = toFloat(replace(row.pval, ',', '.')),
    r.fdr = toFloat(replace(row.fdr, ',', '.')),
    r.nc_beta = toFloat(replace(row.nc_beta, ',', '.')),
    r.nc_lr = toFloat(replace(row.nc_lr, ',', '.')),
    r.nc_pval = toFloat(replace(row.nc_pval, ',', '.')),
    r.nc_fdr = toFloat(replace(row.nc_fdr, ',', '.')),
    r.r2 = toFloat(replace(row.r2, ',', '.')),
    r.target = row.target,
    r.ppi = toInteger(row.ppi),
    r.skew = toFloat(replace(row.skew, ',', '.')),
    r.GDSC = row.GDSC
"""
    )
    tx.run(query)    



# Function to create or retrieve a Cell_Line node
def get_or_create_cell_line(tx, sample_name, project_identifier, old_name):
    if sample_name != old_name:
        print(sample_name, old_name)
        result = tx.run(
            "MERGE (cl:Cell_Line {Sample_Name: $sample_name})"
            " ON MATCH SET cl.Synonyms = COALESCE(cl.Synonyms, []) + [$old_name],"
            " cl.Project_Identifier = $project_identifier"
            " RETURN cl",
            old_name=old_name,
            sample_name=sample_name,
            project_identifier=project_identifier,
        )
    else:
        result = tx.run(
            "MERGE (cl:Cell_Line {Sample_Name: $sample_name})"
            " SET cl.Project_Identifier = $project_identifier"
            " RETURN cl",
            old_name=old_name,
            sample_name=sample_name,
            project_identifier=project_identifier,
        )
    return result.single()[0]

def cell_line_exists(tx, sample_name):
    result = tx.run(
        "MATCH (cl:Cell_Line {Sample_Name: $sample_name})"
        " RETURN COUNT(cl) > 0 AS exists",
        sample_name=sample_name,
    )
    return result.single()[0]


# Function to create or retrieve a Protein node
def get_or_create_protein(tx, protein_name):
    result = tx.run(
        "MERGE (p:Protein {name: $protein_name})"
        " RETURN p",
        protein_name=protein_name,
    )
    return result.single()[0]

# Function to create a relationship with a value between Cell_Line and Protein nodes
def create_relationship_with_value(tx, cell_line, protein, value):
    tx.run(
        "MATCH (cl:Cell_Line {Sample_Name: $sample_name})"
        " MATCH (p:Protein {name: $protein_name})"
        " CREATE (cl)-[r:HAS_PROTEIN {Value: $value}]->(p)",
        sample_name=cell_line,
        protein_name=protein,
        value=value,
    )
def create_protein_matrix():
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
            #file_name = "/ProCan-DepMapSanger_peptide_counts_per_protein_per_sample.txt"
        file_name = "/ProCan-DepMapSanger_protein_matrix_8498_averaged.txt"
        column_names = True
        column_name_list = []
        value_list = []
        cell_line = ""
        with open( "C:/Users/PC/Downloads/data/data/dropbox/19345397"+file_name, 'r') as file:
            for line in file:
                if column_names:
                    column_names = False
                    column_name_list = line.split('\t')
                    for i in range(len(column_name_list)):
                        if i != 0:
                            human_protein = column_name_list[i].split(';')
                            column_name_list[i] = human_protein[1].split('_HUMAN')
                            
                else:
                    value_list = line.split('\t')
                    #print("range", range(len(value_list)))
                    for i in range(len(value_list)):
                        if i == 0:
                            #print("testetst")
                            project_name = value_list[i].split(';')
                            human_sample = project_name[1].split('_human')# not necessary
                            old_name = human_sample[0]
                            if human_sample[0] == "K052":
                                human_sample[0] = "KO52"
                            elif human_sample[0] == "DiFi":
                                human_sample[0] = "DIFI"
                            elif human_sample[0] == "PC-3_[JPC-3]":
                                human_sample[0] = "PC-3 [JPC-3]"
                            elif human_sample[0] == "PE-CA-PJ15":
                                human_sample[0] = "PE/CA-PJ15"
                            elif human_sample[0] == "Hep3B2-1-7":
                                human_sample[0] = "Hep 3B2_1-7"
                            elif human_sample[0] == "LS1034":
                                human_sample[0] = "LS-1034"
                            elif human_sample[0] == "HuTu-80":
                                human_sample[0] = "HUTU-80"
                            elif human_sample[0] == "G-292-Clone-A141B1":
                                human_sample[0] = "G-292 Clone A141B1"
                            elif human_sample[0] == "CAPAN-2":
                                human_sample[0] = "Capan-2"
                            elif human_sample[0] == "B-CPAP":
                                human_sample[0] = "BCPAP"
                            elif human_sample[0] == "SNU-5":
                                human_sample[0] = "NCI-SNU-5"
                            elif human_sample[0] == "SNU-16":
                                human_sample[0] = "NCI-SNU-16"                        
                            elif human_sample[0] == "SNU-1":
                                human_sample[0] = "NCI-SNU-1"
                            elif human_sample[0] == "T24":
                                human_sample[0] = "T-24"
                            elif human_sample[0] == "NTERA-2-cl-D1":
                                human_sample[0] = "NTERA-2 cl.D1"
                            elif human_sample[0] == "MMAc-SF":
                                human_sample[0] = "MMAC-SF"
                            elif human_sample[0] in ["NCI-H2731", "NCI-H2722", "NCI-H2595", "NCI-H2591", "NCI-H2461", "NCI-H2373", "NCI-H2369", "NCI-H513", "NCI-H2795", "NCI-H2803", "NCI-H2804", "NCI-H2810", "NCI-H3118", "NCI-H290", "NCI-H2869", "NCI-H2818"]:
                                human_sample[0] = human_sample[0][4:]
                            elif human_sample[0] == "NB4":
                                human_sample[0] = "NB-4"
                            elif human_sample[0] in ["Hs-940-T", "Hs-939-T", "Hs-766T", "Hs-746T", "Hs-683", "Hs-633T"]:
                                human_sample[0] = "Hs"+human_sample[0][3:]
                            
                            cell_line = human_sample[0]
                            #print("cellline", cell_line)
                            with driver.session() as session:
                                #if old_name != human_sample[0]:
                                #    print(old_name, human_sample[0])
                                #session.write_transaction(get_or_create_cell_line, human_sample[0], value_list[i], old_name)
                                exist_protein = session.write_transaction(cell_line_exists, project_name[0])
                                if not exist_protein:
                                    print(human_sample[0])

                        #else:
                        #    if value_list[i] != "" and value_list[i] != "\n":
                        #        float_value = float(value_list[i])
                        #        with driver.session() as session:
                        #            #print("moin")
                        #            protein = column_name_list[i][0]
                        #            session.write_transaction(get_or_create_protein, protein)
                        #            #print(cell_line,"hallo", protein,"hallo2", float_value)
                        #            session.write_transaction(create_relationship_with_value, cell_line, protein, float_value)

def create_protein_matrix2():
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
            #file_name = "/ProCan-DepMapSanger_peptide_counts_per_protein_per_sample.txt"
        file_name = "/ProCan-DepMapSanger_protein_matrix_8498_averaged.txt"
        column_names = True
        column_name_list = []
        value_list = []
        cell_line = ""
        count_found = 0
        count_not_found = 0
        with open( "C:/Users/PC/Downloads/data/data/dropbox/19345397"+file_name, 'r') as file:
            for line in file:
                if column_names:
                    column_names = False
                    column_name_list = line.split('\t')
                    for i in range(len(column_name_list)):
                        if i != 0:
                            human_protein = column_name_list[i].split(';')
                            swiss = human_protein[0]
                            column_name_list[i] = human_protein[1].split('_HUMAN')

                            with driver.session() as session:  
                                result = session.run("""
                                WITH $swiss AS swiss
                                MATCH (p:Protein)
                                WHERE swiss in p.SWISS_PROT_Accessions_Interactor
                                WITH p
                                RETURN COUNT(p) AS count
                                """, swiss=swiss)
                                count = result.single()['count']
        
                                if count > 0:
                                    count_found += 1
                                else:
                                    count_not_found += 1
                                    value_list.append(swiss)
                                print("Proteins found:", count_found, swiss)
                                print("Proteins not found:", count_not_found)
    print(value_list)


def create_extra_proteins():
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
            #file_name = "/ProCan-DepMapSanger_peptide_counts_per_protein_per_sample.txt"
        file_name = "/ProCan-DepMapSanger_protein_matrix_8498_averaged.txt"
        column_names = True
        column_name_list = []
        value_list = []
        cell_line = ""
        count_found = 0
        count_not_found = 0
        with open( "C:/Users/PC/Downloads/data/data/dropbox/19345397"+file_name, 'r') as file:
            for line in file:
                if column_names:
                    column_names = False
                    column_name_list = line.split('\t')
                    for i in range(len(column_name_list)):
                        if i != 0:
                            human_protein = column_name_list[i].split(';')
                            swiss = human_protein[0]
                            gene_name = human_protein[1].split('_HUMAN')[0]
                            print(gene_name)
                            with driver.session() as session:  
                                result = session.run("""
                                WITH $swiss AS swiss, $gene_name AS gene_name
                                OPTIONAL MATCH (p:Protein)
                                WHERE swiss IN p.SWISS_PROT_Accessions_Interactor
                                WITH p, swiss, gene_name
                                WHERE p IS NULL
                                CREATE (newProtein:Protein { name: gene_name, SWISS_PROT_Accessions_Interactor: [] + swiss, Organism_Name_Interactor: "Homo sapiens", Organism_ID_Interactor: 9606 })
                                RETURN newProtein;
                                """, swiss=swiss, gene_name=gene_name)
                                count_found = count_found +1
                                print(count_found)
                            with driver.session() as session:  
                                result = session.run("""
                                WITH $swiss AS swiss, $gene_name AS gene_name
                                OPTIONAL MATCH (p:Protein)
                                WHERE swiss IN p.SWISS_PROT_Accessions_Interactor
                                WITH p, swiss, gene_name
                                WHERE NOT (toLower(p.name) = toLower(gene_name) or ANY(sname IN p.Synonyms_Interactor WHERE toLower(sname) = toLower(gene_name)))  
                                SET p.Synonyms_Interactor = coalesce(p.Synonyms_Interactor, []) + gene_name
                                RETURN p;
                                """, swiss=swiss, gene_name=gene_name)
                                #count_found = count_found +1
    print(value_list)

                
def create_mobem(tx, properties):
    # Extract the COSMIC_ID from the properties
    cosmic_id = properties.get("COSMIC_ID")

    # Create the Mobem node with properties
    query_create_mobem = (
        "CREATE (m:Mobem) "
        "SET m = $properties"
    )
    tx.run(query_create_mobem, properties=properties)

    # Create a relationship to a Cell_Line node based on COSMIC_ID
    query_create_relationship = (
        "MATCH (m:Mobem {COSMIC_ID: $cosmic_id}), (cl:Cell_Line {COSMIC_ID: $cosmic_id}) "
        "MERGE (m)-[:MOBEM_CONNECTION]->(cl)"
    )
    tx.run(query_create_relationship, cosmic_id=cosmic_id)


### Einzeldateien haben 617 Einträge und GF_PANCAN_nomedia_mobem hat 998 Einträge --> columns in anderen Dateien kommen zum Teil in  GF_PANCAN_nomedia_mobem nicht vor. Ingesamt 1615 nodes.
###Alle Verbindungen konnten erstellt werden
def mobem(folder_path_mobem):
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        for filename in os.listdir(folder_path_mobem):
            file_path = os.path.join(folder_path_mobem, filename)
            df = pd.read_csv(file_path)
            df.rename(columns=lambda x: x.replace(".", "_"), inplace=True)
            #df.rename(columns={"COSMIC_ID": "cosmic_id"}, inplace=True)
            #df.rename(columns={"TISSUE_FACTOR": "tissue_factor"}, inplace=True)
            #df.rename(columns={"MSI_FACTOR": "msi_factor"}, inplace=True)
            value_mobem = filename[filename.find("_")+1:filename.rfind("_mobem.csv")]
            df['cancer_type'] = value_mobem
            
            
            for i in range(len(df)):
                row = df.iloc[i] 
                properties_dict = {}
                for col_name, value in row.items():
                    properties_dict[col_name] = value
                with driver.session() as session:
                    session.write_transaction(create_mobem, properties=properties_dict)

def query_screened_compounds(tx):
    query = ("""
    LOAD CSV WITH HEADERS FROM 'file:///screened_compounds_rel.csv' AS row
    FIELDTERMINATOR ','
    MERGE (d:Drug {id: row.DRUG_ID})
    SET d.screening_site = row.SCREENING_SITE,
        d.synonyms = row.SYNONYMS,
        d.target = row.TARGET,
        d.target_pathway = row.TARGET_PATHWAY,
        d.name = row.DRUG_NAME
    """
    )
    tx.run(query)    

#621 drugs
def screened_compounds():
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            session.write_transaction(query_screened_compounds)    


def query_fitted_dose(tx):
    query = ("""
    LOAD CSV WITH HEADERS FROM 'file:///GDSC1_fitted_dose_response_24Jul22.csv' AS row
    FIELDTERMINATOR ';'
    MERGE (d:Drug {id: row.DRUG_ID})
    MERGE (c:Cell_Line {COSMIC_ID: row.COSMIC_ID})
    WITH d, c, row
    CREATE (d)-[r:fitted_dose]->(c)
    SET r.GDSC = "GDSC1",
        r.dataset = row.DATASET,
        r.NLME_RESULT_ID = row.NLME_RESULT_ID,
        r.NLME_CURVE_ID = row.NLME_CURVE_ID,
        r.SANGER_MODEL_ID = row.SANGER_MODEL_ID,
        r.TCGA_DESC = row.TCGA_DESC,
        r.PUTATIVE_TARGET = row.PUTATIVE_TARGET,
        r.PATHWAY_NAME = row.PATHWAY_NAME,
        r.COMPANY_ID = row.COMPANY_ID,
        r.WEBRELEASE = row.WEBRELEASE,
        r.MIN_CONC = row.MIN_CONC,
        r.MAX_CONC = row.MAX_CONC,
        r.LN_IC50 = row.LN_IC50,
        r.AUC = row.AUC,
        r.RMSE = row.RMSE,
        r.Z_SCORE = row.Z_SCORE             
    """
    )
    tx.run(query)      

def query_fitted_dose2(tx):
    query = ("""
    LOAD CSV WITH HEADERS FROM 'file:///GDSC2_fitted_dose_response_24Jul22.csv' AS row
    FIELDTERMINATOR ';'
    MERGE (d:Drug {id: row.DRUG_ID})
    MERGE (c:Cell_Line {COSMIC_ID: row.COSMIC_ID})
    WITH d, c, row
    CREATE (d)-[r:fitted_dose]->(c)
    SET r.GDSC = "GDSC2",
        r.dataset = row.DATASET,
        r.NLME_RESULT_ID = row.NLME_RESULT_ID,
        r.NLME_CURVE_ID = row.NLME_CURVE_ID,
        r.SANGER_MODEL_ID = row.SANGER_MODEL_ID,
        r.TCGA_DESC = row.TCGA_DESC,
        r.PUTATIVE_TARGET = row.PUTATIVE_TARGET,
        r.PATHWAY_NAME = row.PATHWAY_NAME,
        r.COMPANY_ID = row.COMPANY_ID,
        r.WEBRELEASE = row.WEBRELEASE,
        r.MIN_CONC = row.MIN_CONC,
        r.MAX_CONC = row.MAX_CONC,
        r.LN_IC50 = row.LN_IC50,
        r.AUC = row.AUC,
        r.RMSE = row.RMSE,
        r.Z_SCORE = row.Z_SCORE             
    """
    )
    tx.run(query)      

def fitted_dose():
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            session.write_transaction(query_fitted_dose)
            session.write_transaction(query_fitted_dose2)       

def query_public_raw_data(tx):
    query = """
    USING PERIODIC COMMIT 100000
    LOAD CSV WITH HEADERS FROM 'file:///GDSC1_public_raw_data_24Jul22.csv' AS row FIELDTERMINATOR ',' 
    MERGE (d:Drug {id: row.DRUG_ID})
    MERGE (c:Cell_Line {COSMIC_ID: row.COSMIC_ID})
    WITH d, c, row
    CREATE (d)-[r:PUBLIC_RAW_DATA]->(c)
    SET r.GDSC = 'GDSC1',
        r.RESEARCH_PROJECT = row.RESEARCH_PROJECT,
        r.BARCODE = row.BARCODE,
        r.SCAN_ID = row.SCAN_ID,
        r.DATE_CREATED = row.DATE_CREATED,
        r.SCAN_DATE = row.SCAN_DATE,
        r.CELL_ID = row.CELL_ID,
        r.MASTER_CELL_ID = row.MASTER_CELL_ID,
        r.CELL_LINE_NAME = row.CELL_LINE_NAME,
        r.SANGER_MODEL_ID = row.SANGER_MODEL_ID,
        r.SEEDING_DENSITY = row.SEEDING_DENSITY,
        r.DRUGSET_ID = row.DRUGSET_ID,
        r.ASSAY = row.ASSAY,
        r.DURATION = row.DURATION,
        r.POSITION = row.POSITION,
        r.TAG = row.TAG,
        r.CONC = row.CONC,
        r.INTENSITY = row.INTENSITY
    """
    tx.run(query)

def public_raw_data():
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            session.write_transaction(query_public_raw_data)
            #session.write_transaction(query_public_raw_data2)       

# richtig der Verbindung wird ignoriert
def query_protein_protein_interaction(tx):
    
    query = """
    CREATE INDEX FOR (p:Protein) ON p.uid;
CALL apoc.periodic.iterate(
  'LOAD CSV WITH HEADERS FROM "file:///BIOGRID.txt" AS row FIELDTERMINATOR "\\t" RETURN row',
  '
  MERGE (p1:Protein {uid: row.BioGRID_ID_Interactor_A})
  ON CREATE SET p1.name = row.Official_Symbol_Interactor_A,
    p1.Entrez_Gene_Interactor = row.Entrez_Gene_Interactor_A,
    p1.Systematic_Name_Interactor = row.Systematic_Name_Interactor_A,
    p1.Synonyms_Interactor = SPLIT(row.Synonyms_Interactor_A, "|"),
    p1.Organism_ID_Interactor = row.Organism_ID_Interactor_A,
    p1.SWISS_PROT_Accessions_Interactor = SPLIT(row.SWISS_PROT_Accessions_Interactor_A, "|"),
    p1.TREMBL_Accessions_Interactor = SPLIT(row.TREMBL_Accessions_Interactor_A, "|"),
    p1.REFSEQ_Accessions_Interactor = SPLIT(row.REFSEQ_Accessions_Interactor_A, "|"),
    p1.Organism_Name_Interactor = row.Organism_Name_Interactor_A
  MERGE (p2:Protein {uid: row.BioGRID_ID_Interactor_B})
  ON CREATE SET p2.name = row.Official_Symbol_Interactor_B,
    p2.Entrez_Gene_Interactor = row.Entrez_Gene_Interactor_B,
    p2.Systematic_Name_Interactor = row.Systematic_Name_Interactor_B,
    p2.Synonyms_Interactor = SPLIT(row.Synonyms_Interactor_B, "|"),
    p2.Organism_ID_Interactor = row.Organism_ID_Interactor_B,
    p2.SWISS_PROT_Accessions_Interactor = SPLIT(row.SWISS_PROT_Accessions_Interactor_B, "|"),
    p2.TREMBL_Accessions_Interactor = SPLIT(row.TREMBL_Accessions_Interactor_B, "|"),
    p2.REFSEQ_Accessions_Interactor = SPLIT(row.REFSEQ_Accessions_Interactor_B, "|"),
    p2.Organism_Name_Interactor = row.Organism_Name_Interactor_B
  CREATE (p1)-[r:PPI]->(p2)
  SET r.BioGRID_Interaction_ID = row.BioGRID_Interaction_ID,
    r.Experimental_System = row.Experimental_System,
    r.Experimental_System_Type = row.Experimental_System_Type,
    r.Author = row.Author,
    r.Publication_Source = row.Publication_Source,
    r.Throughput = SPLIT(row.Throughput, "|"),
    r.Score = row.Score,
    r.Modification = row.Modification,
    r.Qualifications = SPLIT(row.Qualifications, "|"),
    r.Tags = SPLIT(row.Tags, "|"),
    r.Source_Database = row.Source_Database,
    r.Ontology_Term_IDs = SPLIT(row.Ontology_Term_IDs, "|"),
    r.Ontology_Term_Names = SPLIT(row.Ontology_Term_Names, "|"),
    r.Ontology_Term_Categories = SPLIT(row.Ontology_Term_Categories, "|"),
    r.Ontology_Term_Qualifier_IDs = SPLIT(row.Ontology_Term_Qualifier_IDs, "|"),
    r.Ontology_Term_Qualifier_Names = SPLIT(row.Ontology_Term_Qualifier_Names, "|"),
    r.Ontology_Term_Types = SPLIT(row.Ontology_Term_Types, "|")
  ',
  { batchSize: 100000}
);
CALL apoc.periodic.iterate(
  'LOAD CSV WITH HEADERS FROM "file:///BIOGRID.txt" AS row FIELDTERMINATOR "\\t" RETURN row',
  '
  MERGE (p1:Protein {uid: row.BioGRID_ID_Interactor_A})
  ON CREATE SET p1.name = row.Official_Symbol_Interactor_A,
    p1.Entrez_Gene_Interactor = row.Entrez_Gene_Interactor_A,
    p1.Systematic_Name_Interactor = row.Systematic_Name_Interactor_A,
    p1.Synonyms_Interactor = SPLIT(row.Synonyms_Interactor_A, "|"),
    p1.Organism_ID_Interactor = row.Organism_ID_Interactor_A,
    p1.SWISS_PROT_Accessions_Interactor = SPLIT(row.SWISS_PROT_Accessions_Interactor_A, "|"),
    p1.TREMBL_Accessions_Interactor = SPLIT(row.TREMBL_Accessions_Interactor_A, "|"),
    p1.REFSEQ_Accessions_Interactor = SPLIT(row.REFSEQ_Accessions_Interactor_A, "|"),
    p1.Organism_Name_Interactor = row.Organism_Name_Interactor_A
  ',
  { batchSize: 100000}
);
CALL apoc.periodic.iterate(
  'LOAD CSV WITH HEADERS FROM "file:///BIOGRID.txt" AS row FIELDTERMINATOR "\\t" RETURN row',
  '
  MERGE (p2:Protein {uid: row.BioGRID_ID_Interactor_B})
  ON CREATE SET p2.name = row.Official_Symbol_Interactor_B,
    p2.Entrez_Gene_Interactor = row.Entrez_Gene_Interactor_B,
    p2.Systematic_Name_Interactor = row.Systematic_Name_Interactor_B,
    p2.Synonyms_Interactor = SPLIT(row.Synonyms_Interactor_B, "|"),
    p2.Organism_ID_Interactor = row.Organism_ID_Interactor_B,
    p2.SWISS_PROT_Accessions_Interactor = SPLIT(row.SWISS_PROT_Accessions_Interactor_B, "|"),
    p2.TREMBL_Accessions_Interactor = SPLIT(row.TREMBL_Accessions_Interactor_B, "|"),
    p2.REFSEQ_Accessions_Interactor = SPLIT(row.REFSEQ_Accessions_Interactor_B, "|"),
    p2.Organism_Name_Interactor = row.Organism_Name_Interactor_B
  ',
  { batchSize: 100000}
);

CALL apoc.periodic.iterate(
  'LOAD CSV WITH HEADERS FROM "file:///output_1.txt" AS row FIELDTERMINATOR "\\t" RETURN row',
  '
  MATCH (p1:Protein {uid: row.BioGRID_ID_Interactor_A})
  MATCH (p2:Protein {uid: row.BioGRID_ID_Interactor_B})
  CREATE (p1)-[r:PPI]->(p2)
  SET r.BioGRID_Interaction_ID = row.BioGRID_Interaction_ID,
    r.Experimental_System = row.Experimental_System,
    r.Experimental_System_Type = row.Experimental_System_Type,
    r.Author = row.Author,
    r.Publication_Source = row.Publication_Source,
    r.Throughput = SPLIT(row.Throughput, "|"),
    r.Score = row.Score,
    r.Modification = row.Modification,
    r.Qualifications = SPLIT(row.Qualifications, "|"),
    r.Tags = SPLIT(row.Tags, "|"),
    r.Source_Database = row.Source_Database,
    r.Ontology_Term_IDs = SPLIT(row.Ontology_Term_IDs, "|"),
    r.Ontology_Term_Names = SPLIT(row.Ontology_Term_Names, "|"),
    r.Ontology_Term_Categories = SPLIT(row.Ontology_Term_Categories, "|"),
    r.Ontology_Term_Qualifier_IDs = SPLIT(row.Ontology_Term_Qualifier_IDs, "|"),
    r.Ontology_Term_Qualifier_Names = SPLIT(row.Ontology_Term_Qualifier_Names, "|"),
    r.Ontology_Term_Types = SPLIT(row.Ontology_Term_Types, "|")
  ',
  { batchSize: 100000}
);

CREATE INDEX FOR (p:Protein) ON (p.name);
CREATE INDEX FOR (p:Protein) ON (p.synonym);

LOAD CSV WITH HEADERS FROM 'file:///mmc7.csv' AS row
FIELDTERMINATOR ';'
WITH COLLECT(DISTINCT row.x_id) AS uniqueProteinNames

UNWIND uniqueProteinNames AS proteinName
OPTIONAL MATCH (p:Protein)
WHERE (toLower(p.name) = toLower(proteinName) OR ANY(sname IN p.Synonyms_Interactor WHERE toLower(sname) = toLower(proteinName))) AND p.Organism_Name_Interactor = "Homo sapiens"
WITH proteinName, p
WHERE p IS NULL
RETURN DISTINCT proteinName
    """
    tx.run(query)

def protein_protein_interaction():
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            session.write_transaction(query_protein_protein_interaction)

#mmc6()#Drug-Protein Information: 4513 Proteine, 549 Drugs, 103371 Connections
cell_lines_details()#cellline 1: 1001 Einträge und Cellline 2: 1029 Einträge --> ZUsammenführen basierend auf cosmic_id und sample_name/Line: 1034 Einträge //// ZUsammenführen basierend auf cosmic_id 1029 Einträge
#create_protein_matrix() #949 cell lines --> 100% Match mit Korrektur für Zelllinien
#mobem("C:/Users/PC/Downloads/data/data/bulk download/GDSCtools_mobems")
#screened_compounds() # 621 drugs -> Übereinstimmung mit 378 von 549 Drugs -> große Lücken in der drug_id Liste -> Grund: beinhaltet nur geprüfte Komponenten
#fitted_dose()
#public_raw_data()
#protein_protein_interaction()






def get_protein_synonyms(protein_name):
    # Define the Ensembl REST API endpoint
    url = f"https://rest.ensembl.org/xrefs/name/human/{protein_name}?content-type=application/json"

    # Make the API request
    response = requests.get(url)

    # Check if the request was successful (status code 200)
    if response.status_code == 200:
        # Parse the JSON response
        data = response.json()
        synonyms = []
        # Extract synonyms from the response
        for entry in data:
            synonyms.extend(entry.get('synonyms', []))

        return synonyms

    else:
        # Print an error message if the request was not successful
        print(f"Error: Unable to fetch data. Status code: {response.status_code}")
        return None


#mmc6: 98 proteins --> 2 in den Daten nicht gefundene Proteinen (existiert aber in der Datenbank)TSTD1 ['KAT'] TSTD1 | MMP24OS ['MMP24-AS1'] MMP24OS
def protein_synonym_connector():
    p =0
    exist_p = 0
    n_exist_p = 0
    print(len(gene_names))
    for gene in gene_names:
        synonyms = get_protein_synonyms(gene)
        synonyms_lower = [synonym.lower() for synonym in synonyms]
        if gene == "EEF1AKNMT": #gene_card name händisch hinzugefügt
            synonyms = ["METTL13"]
        if gene == "ATP5MPL": #gene_card name händisch hinzugefügt -> keine klare Zuordnung
            synonyms = ["ATP5MPL"]
        synonyms_lower = [synonym.lower() for synonym in synonyms]    
        if synonyms:
            # Check if a protein node with the same name exists in Neo4j
            with GraphDatabase.driver(uri, auth=(username, password)) as driver:
                with driver.session() as session:
                    #print("synonyms_lower", synonyms_lower)
                    result = session.run("""
                    OPTIONAL MATCH (p:Protein)
                    WHERE toLower(p.name) IN $synonyms AND p.Organism_Name_Interactor = "Homo sapiens"
                    WITH p, $synonyms_normal as proteinName
                    WHERE p is NULL
                    RETURN proteinName
                """, synonyms=synonyms_lower, synonyms_normal=synonyms, gene=gene)
                    existing_protein = [record['proteinName'] for record in result]
                    p = p+1
                    if existing_protein:
                        exist_p = exist_p + 1
#
                        print(p, " | ", exist_p, " | ",  n_exist_p, " | ", existing_protein, gene)
                    else:
                        n_exist_p = n_exist_p + 1
                        print(p, gene)
                        #print(p, " | ", exist_p, " | ",  n_exist_p, " | ", gene, synonyms, gene)
        else:
            print("synonym", gene)
#protein_synonym_connector()

def protein_synonym_connector2():
    p =0
    exist_p = 0
    n_exist_p = 0
    print(len(gene_names))
    for gene in gene_names:
        synonyms = get_protein_synonyms(gene)
        synonyms_lower = [synonym.lower() for synonym in synonyms]
        if gene == "EEF1AKNMT": #gene_card name händisch hinzugefügt
            synonyms = ["METTL13"]
        if gene == "ATP5MPL": #gene_card name händisch hinzugefügt -> keine klare Zuordnung
            synonyms = ["ATP5MPL"]
        synonyms_lower = [synonym.lower() for synonym in synonyms]    
        if synonyms:
            # Check if a protein node with the same name exists in Neo4j
            with GraphDatabase.driver(uri, auth=(username, password)) as driver:
                with driver.session() as session:
                    #print("synonyms_lower", synonyms_lower)
                    result = session.run("""
                    OPTIONAL MATCH (p:Protein)
                    WHERE toLower(p.name) IN $synonyms AND p.Organism_Name_Interactor = "Homo sapiens"
                    WITH CASE WHEN p IS NULL THEN {name: $gene, Synonyms_Interactor: $synonyms_normal, Organism_Name_Interactor: "Homo sapiens"} ELSE p END AS protein
                    MERGE (newProtein:Protein {name: protein.name})
                    ON CREATE SET newProtein.Synonyms_Interactor = protein.Synonyms_Interactor, newProtein.Organism_Name_Interactor = "Homo sapiens"
                    ON MATCH SET newProtein.Synonyms_Interactor = COALESCE(newProtein.Synonyms_Interactor, []) + $gene
                """, synonyms=synonyms_lower, synonyms_normal=synonyms, gene=gene)
                    existing_protein = [record['proteinName'] for record in result]
                    p = p+1
                    if existing_protein:
                        exist_p = exist_p + 1
#
                        print(p, " | ", exist_p, " | ",  n_exist_p, " | ", existing_protein, gene)
                    else:
                        n_exist_p = n_exist_p + 1
                        print(p, gene)
                        #print(p, " | ", exist_p, " | ",  n_exist_p, " | ", gene, synonyms, gene)
        else:
            print("synonym", gene)
#protein_synonym_connector2()

#ON CREATE SET p.name = proteinName p.Synonyms_Interactor = $synonyms_normal
                    #ON MATCH SET p.Synonyms_Interactor = coalesce(p.Synonyms_Interactor, []) + proteinName
                    #WITH CASE WHEN p IS NULL THEN {name: $gene, Synonyms_Interactor: $synonyms_normal, Organism_Name_Interactor: "Homo sapiens"} ELSE p END AS protein
                    #MERGE (newProtein:Protein {name: protein.name})
                    #ON CREATE SET newProtein.Synonyms_Interactor = protein.Synonyms_Interactor, newProtein.Organism_Name_Interactor = "Homo sapiens"
                    #ON MATCH SET newProtein.Synonyms_Interactor = COALESCE(newProtein.Synonyms_Interactor, []) + $gene

#create_protein_matrix2()
#create_extra_proteins()