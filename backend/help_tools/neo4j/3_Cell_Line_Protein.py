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

def cell_line_exists(tx, sample_name):
    result = tx.run(
        "MATCH (cl:Cell_Line {Sample_Name: $sample_name})"
        " RETURN COUNT(cl) > 0 AS exists",
        sample_name=sample_name,
    )
    return result.single()[0]



def create_extra_proteins():
    csv_file_path = 'C:/Users/PC/Downloads/uniprot_human_idmap.tab/uniprot_human_idmap.tab'

    csv_file_path = 'C:/Users/PC/Downloads/uniprot_human_idmap.tab/uniprot_human_idmap.tab'

    data_list = []
    entry_values = {}  # Dictionary to store the count of each Entry

    with open(csv_file_path, 'r') as file:
        csv_reader = csv.DictReader(file, delimiter='\t')
        for row in csv_reader:
            data_list.append(row)
            entry = row['Entry']
            if entry in entry_values:
                entry_values[entry] += 1
            else:
                entry_values[entry] = 1
    
    non_unique_entries = [entry for entry, count in entry_values.items() if count > 1]
    swiss_found = 0
    entry_name_found = 0
    swiss_or_entry_name_found = 0
    swiss_and_entry_name_found = 0
    swiss_but_no_primary_gen_exist = 0
    swiss_but_many_primary_gen_exist = 0    
    if non_unique_entries:
        print(f"The following Entry values are not unique: {non_unique_entries}")
    else:
        print("All Entry values are unique.")
    #print(data_list)
    print("List with Proteins that have the same SWISS but different Entry Names")
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
                    nf = 0
                    for i in range(len(column_name_list)):
                        if i != 0:
                            human_protein = column_name_list[i].split(';')
                            swiss = human_protein[0]
                            entry_name = human_protein[1].split('\n')[0]
                            gene_name = []
                            entrez_number = []
                            for d in data_list:
                                if d['Entry'] == swiss:
                                    swiss_found = swiss_found  + 1
                                    gene_name = [d['Gene names  (primary )']]
                                    if d['Gene names  (primary )'] == "":
                                        swiss_but_no_primary_gen_exist = swiss_but_no_primary_gen_exist + 1
                                        #gene_name = [entry_name]
                                        #print("moin", entry_name, entry_name[:-6])
                                    if ";" in d['Gene names  (primary )']:
                                        gene_name_string = d['Gene names  (primary )']
                                        gene_name = gene_name_string.split('; ')
                                        #print("lol", gene_name)
                                        swiss_but_many_primary_gen_exist = swiss_but_many_primary_gen_exist + 1
                                    if d['Entry name'] != entry_name:
                                        t = 0
                                        #nf = nf +1
                                        #print(nf, swiss, d['Entry name'], entry_name)
                                
                                if d['Entry name'] == entry_name:
                                    entry_name_found = entry_name_found + 1
                                if d['Entry name'] == entry_name and d['Entry'] == swiss:
                                    swiss_and_entry_name_found = swiss_and_entry_name_found + 1
                                if d['Entry name'] == entry_name or d['Entry'] == swiss:
                                    swiss_or_entry_name_found = swiss_or_entry_name_found + 1

                            if gene_name == "":
                                t = 0
                                #nf = nf +1
                                #print(swiss, human_protein[1])
                            if ";" in gene_name:
                                t = 0
                                #nf = nf +1
                                #print(swiss, human_protein[1])
                            if True:
                                with driver.session() as session:  
                                    result = session.run("""
                                    WITH $swiss AS swiss_name, $gene_name AS gene_name
                                    OPTIONAL MATCH (p:Protein)-[:HAS_SWISS]->(s:SWISS)
                                    WHERE s.name = swiss_name and p.Organism_Name_Interactor = "Homo sapiens" and ANY(gene_name_list IN gene_name WHERE toLower(gene_name_list) = toLower(p.name))
                                    WITH s, gene_name, swiss_name, COUNT(p) AS pCount
                                    WHERE pCount <> 1
                                    OPTIONAL MATCH (p2:Protein)-[:HAS_SWISS]->(s2:SWISS)
                                    WHERE s2.name = swiss_name and p2.Organism_Name_Interactor = "Homo sapiens" and ANY(gene_name2 IN gene_name WHERE ANY(sname IN p2.Synonyms_Interactor WHERE toLower(sname) = toLower(gene_name2)))
                                    WITH s2, gene_name, swiss_name, COUNT(p2) AS pCount2
                                    WHERE pCount2 <> 1
                                    OPTIONAL MATCH (p3:Protein)
                                    WHERE p3.SWISS_PROT_Accessions_Interactor=["-"] and p3.Organism_Name_Interactor = "Homo sapiens" and ANY(gene_name_list IN gene_name WHERE toLower(gene_name_list) = toLower(p3.name))
                                    WITH gene_name, swiss_name, COUNT(p3) AS pCount3
                                    WHERE pCount3 <> 1
                                    OPTIONAL MATCH (p4:Protein)
                                    WHERE p4.SWISS_PROT_Accessions_Interactor=["-"] and p4.Organism_Name_Interactor = "Homo sapiens" and ANY(gene_name2 IN gene_name WHERE ANY(sname IN p4.Synonyms_Interactor WHERE toLower(sname) = toLower(gene_name2)))
                                    WITH gene_name, swiss_name, COUNT(p4) AS pCount4
                                    WHERE pCount4 <> 1
                                    OPTIONAL MATCH (p4:Protein)-[:HAS_SWISS]->(s4:SWISS)
                                    WHERE s4.name = swiss_name and p4.Organism_Name_Interactor = "Homo sapiens"
                                    WITH s4, gene_name, swiss_name, COUNT(p4) AS pCount4
                                    WHERE pCount4 <> 1
                                    RETURN gene_name, swiss_name
                                    """, swiss=swiss, gene_name=gene_name, entrez_number=entrez_number)
                                    count_found = count_found +1
                                    if count_found % 200 == 0:
                                        c = 0
                                        print(count_found, nf)
                                    for record in result:
                                        #nf = nf +1
                                        if gene_name != "" and not ";" in gene_name:
                                            nf = nf +1
                                            q = 0
                                            print("Gene Name:", record["gene_name"])
                                            print("SWISS:", record["swiss_name"])
                                #    break
                            #with driver.session() as session:  
                            #    result = session.run("""
                            #    WITH $swiss AS swiss, $gene_name AS gene_name
                            #    OPTIONAL MATCH (p:Protein)
                            #    WHERE swiss IN p.SWISS_PROT_Accessions_Interactor
                            #    WITH p, swiss, gene_name
                            #    WHERE NOT (toLower(p.name) = toLower(gene_name) or ANY(sname IN p.Synonyms_Interactor WHERE toLower(sname) = toLower(gene_name)))  
                            #    SET p.Synonyms_Interactor = coalesce(p.Synonyms_Interactor, []) + gene_name
                            #    RETURN p;
                            #    """, swiss=swiss, gene_name=gene_name)
                                #count_found = count_found +1
                    print("Not found", nf, 8498-nf)
    print("Number of exact swiss found in uniprot file: ", swiss_found)
    print("Number of exact Entry names found in uniprot file: ", entry_name_found)
    print("Number of exact Entry names and swiss found in uniprot file: ", swiss_and_entry_name_found)
    print("Number of exact Entry names or swiss found in uniprot file: ", swiss_or_entry_name_found)
    print("swiss_but_no_primary_gen_exist ", swiss_but_no_primary_gen_exist)
    print("swiss_but_many_primary_gen_exist", swiss_but_many_primary_gen_exist)
    print(value_list)
    print(nf)
#create_extra_proteins()

import csv
import requests
from neo4j import GraphDatabase
def find_non_unique_strings_case_insensitive(arr):
    unique_strings = set()
    non_unique_strings = set()

    for string in arr:
        lowercase_string = string.lower()
        if lowercase_string in unique_strings:
            non_unique_strings.add(string)
        else:
            unique_strings.add(lowercase_string)

    return list(non_unique_strings)
def create_extra_proteins2():
    big_swiss = []
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        file_name = "/ProCan-DepMapSanger_protein_matrix_8498_averaged.txt"
        input_file_path = "C:/Users/PC/Downloads/data/data/dropbox/19345397" + file_name
        output_file_path = "C:/Users/PC/Downloads/data/data/dropbox/output_file.csv"

        column_names = True
        column_name_list = []
        value_list = []
        cell_line = ""
        count_found = 0
        count_not_found = 0

        with open(input_file_path, 'r') as file, open(output_file_path, 'w', newline='') as csv_file:
            csv_writer = csv.writer(csv_file)
            for line in file:
                if column_names:
                    column_names = False
                    column_name_list = line.strip().split('\t')
                    data_values = line.strip().split('\t')
                    swiss_list = []
                    
                    for i in range(1, len(data_values)):
                        human_protein = data_values[i].split(';')
                        swiss = human_protein[0]
                        swiss_list.append(swiss)
                        big_swiss.append(swiss)
                        if len(swiss_list) == 100:
                            print("hi")
                            r = requests.post(
                                url='https://biit.cs.ut.ee/gprofiler/api/convert/convert/',
                                json={
                                    'organism': 'hsapiens',
                                    'target': 'ENTREZGENE_ACC',
                                    'query': swiss_list,
                                }
                            )
                            swiss_list = []

                            result_list = r.json()['result']
                            for rl in result_list:
                                incoming = rl['incoming']
                                o = 0
                                no_problems = True
                                if False:
                                    for rl2 in result_list:
                                        if incoming == rl2['incoming']:
                                            o = o +1
                                        if o > 1: 
                                            no_problems = False
                                            break
                                if no_problems:
                                    converted = rl['converted']
                                    name = rl['name']
                                    #print("moin")
                                    csv_writer.writerow([incoming, converted, name])
    print("size", len(big_swiss))
    p = find_non_unique_strings_case_insensitive(big_swiss)
    print("p",p)
#create_extra_proteins2()










def create_connections():
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
            #file_name = "/ProCan-DepMapSanger_peptide_counts_per_protein_per_sample.txt"
        file_name = "/ProCan-DepMapSanger_protein_matrix_8498_averaged.txt"
        column_names = True
        column_name_list = []
        value_list = []
        cell_line = ""
        count_found = 0
        count_not_found = 0
        p = 0
        with open( "C:/Users/PC/Downloads/data/data/dropbox/19345397"+file_name, 'r') as file:
            for line in file:
                if column_names:
                    column_names = False
                    column_name_list = line.split('\t')
                    for i in range(len(column_name_list)):
                        if i != 0:
                            p = 0
                else:
                    value_list = line.split('\t')
                    #print("range", range(len(value_list)))
                    for i in range(len(value_list)):
                        if i == 0:
                            #print("testetst")
                            #print(value_list)
                            project_name = value_list[i].split(';')
                            #print(project_name)
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
                                exist_protein = session.write_transaction(cell_line_exists, human_sample[0])
                                if not exist_protein:
                                    print(human_sample[0])
                                else:
                                    print("lol")
    #print(value_list)
#create_extra_proteins()

def change_file():
    input_file_path = "C:/Users/PC/Downloads/data/data/dropbox/19345397/ProCan-DepMapSanger_protein_matrix_8498_averaged.txt"
    output_file_path = "C:/Users/PC/Downloads/data/data/dropbox/19345397/ProCan-DepMapSanger_protein_matrix_modified.txt"

    with open(input_file_path, 'r') as input_file, open(output_file_path, 'w') as output_file:
        column_names = True
        column_name_list = []
        column_name_list2 = []
        for line in input_file:
            if column_names:
                column_names = False
                value_list = line.split('\t')
                value_list2 = line.split('\t')
                output_file.write("Cell_Name\tProject_Identifier\tProtein_Name\tGene_Name\tvalue\n")
                for i in range(len(value_list)):
                    value_list[i] = value_list[i].split(';')[0]
                    if i > 0:
                        value_list2[i] = value_list2[i].split(';')[1].split('_HUMAN')[0]
                column_name_list = value_list
                #print(value_list2[1])
                column_name_list2 = value_list2
            else:
                value_list = line.split('\t')
                project_name = value_list[0].split(';')
                human_sample = project_name[1]

                new = human_sample
                if human_sample == "K052":
                    new = "KO52"
                elif human_sample == "DiFi":
                   new = "DIFI"
                elif human_sample == "PC-3_[JPC-3]":
                    new = "PC-3 [JPC-3]"
                elif human_sample == "PE-CA-PJ15":
                    new = "PE/CA-PJ15"
                elif human_sample == "Hep3B2-1-7":
                    new = "Hep 3B2_1-7"
                elif human_sample == "LS1034":
                   new = "LS-1034"
                elif human_sample == "HuTu-80":
                    new= "HUTU-80"
                elif human_sample == "G-292-Clone-A141B1":
                    new = "G-292 Clone A141B1"
                elif human_sample == "CAPAN-2":
                   new = "Capan-2"
                elif human_sample == "B-CPAP":
                    new = "BCPAP"
                elif human_sample == "SNU-5":
                   new = "NCI-SNU-5"
                elif human_sample == "SNU-16":
                   new = "NCI-SNU-16"                        
                elif human_sample == "SNU-1":
                   new = "NCI-SNU-1"
                elif human_sample == "T24":
                    new = "T-24"
                elif human_sample == "NTERA-2-cl-D1":
                    new = "NTERA-2 cl.D1"
                elif human_sample == "MMAc-SF":
                    new = "MMAC-SF"
                elif human_sample in ["NCI-H2731", "NCI-H2722", "NCI-H2595", "NCI-H2591", "NCI-H2461", "NCI-H2373", "NCI-H2369", "NCI-H513", "NCI-H2795", "NCI-H2803", "NCI-H2804", "NCI-H2810", "NCI-H3118", "NCI-H290", "NCI-H2869", "NCI-H2818"]:
                    new = human_sample[4:]
                elif human_sample == "NB4":
                   new = "NB-4"
                elif human_sample in ["Hs-940-T", "Hs-939-T", "Hs-766T", "Hs-746T", "Hs-683", "Hs-633T"]:
                    new = "Hs"+human_sample[3:]
                for v in range(len(value_list)):
                    if v != 0:
                        if value_list[v] != "" and value_list[v] != "\n":
                            value_list[v]
                            output_file.write(new+"\t"+project_name[0]+"\t"+column_name_list[v]+"\t"+column_name_list2+"\t"+value_list[v].rstrip("\n")+"\n")
#create_extra_proteins() # create proteins that not exist in the db already
#change_file()




def create_cell_line_protein():
    ############################
    #Create cell line proteins #
    ############################

    # Get all uniprot information              
    csv_file_path = 'C:/Users/pc/Downloads/data/data/dropbox/19345397/uniprot_human_idmap.tab/uniprot_human_idmap.tab'
    uniprot_proteins = []
    with open(csv_file_path, 'r') as file:
        csv_reader = csv.DictReader(file, delimiter='\t')
        for row in csv_reader:
            entry_name = row['Entry name']
            swiss_name =  row['Entry']
            gene_name = row['Gene names  (primary )']
            gene_name_list = []
            if "; " in gene_name:
                gene_name_list = gene_name.split("; ")  
            else:
                gene_name_list = [gene_name]
            data_dict = {'swiss': swiss_name, 'entry_name': entry_name, 'gene_name_list': gene_name_list}
            uniprot_proteins.append(data_dict)
    
    # find matrix Proteins
    matrix_proteins = []
    file_name = "/ProCan-DepMapSanger_protein_matrix_8498_averaged.txt"
    file_path = "C:/Users/pc/Downloads/data/data/dropbox/19345397" + file_name

    with open(file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile, delimiter='\t')
        column_names = reader.fieldnames
        for c in column_names:
            if c != 'Project_Identifier':
                split_name = c.split(";")
                swiss = split_name[0]
                entry_name = split_name[1]
                data_dict = {'swiss': swiss, 'entry_name': entry_name}
                matrix_proteins.append(data_dict)
    count = 0
    print(len(matrix_proteins))
    print(len(uniprot_proteins))
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:  
            for c in matrix_proteins:
                swiss = c['swiss']
                entry_name = c['entry_name']
                name2 = entry_name.split("_")[0]
                not_found = 0
                for d in uniprot_proteins:
                    #print("hi", swiss, d['swiss'])
                    if swiss == d['swiss'] or entry_name == d['entry_name']:#8460 found
                        not_found = 1
                        count = count + 1
                        #print(count)
                        entry_name2 = d['entry_name']
                        name = d['gene_name_list'][0]
                        if len(d['gene_name_list']) > 1:
                            synonyms = d['gene_name_list'][1:]
                        else:
                            synonyms = []
                        
                        session.run("""
                            WITH $swiss AS swiss, $synonyms AS synonyms, $entry_name AS entry_name, $entry_name2 AS entry_name2, $name AS protein_name
                            CREATE (p:Protein{project_id: 1, uid: apoc.create.uuid()})
                            SET p.name = protein_name, p.swiss = swiss, p.synonyms = synonyms, p.entry_name = entry_name, p.entry_name2 = entry_name2
                            FOREACH (synonym IN synonyms |
                                MERGE (s:Synonym {name: synonym})
                                MERGE (p)-[r:HAS_SYNONYM]->(s)
                                SET r.project_id = 1
                            )
                            """, swiss=swiss, synonyms=synonyms, entry_name=entry_name, entry_name2=entry_name2, name=name )
                        break
                if not_found == 0:
                    print(swiss, entry_name, name2)
                    session.run("""
                            WITH $swiss AS swiss, $entry_name AS entry_name
                            CREATE (p:Protein{project_id: 1, uid: apoc.create.uuid()})
                            SET p.swiss = swiss, p.entry_name = entry_name
                            """, swiss=swiss, entry_name=entry_name)

    print(count)

def create_cell_line_csv(file_name):
    csv_column_names = ["project_name", "project_sid", "swiss", "value"]
    column_names = True
    column_name_list = []
    column_name_list_swiss = []
    value_list = []
    with open( "C:/Users/pc/Downloads/data/data/dropbox/19345397/"+file_name, 'r') as file:
        with open(file_name+".csv", mode='w', newline='') as file2:
            writer = csv.writer(file2)
            writer.writerow(csv_column_names)
            for line in file:
                if column_names:
                    column_names = False
                    column_name_list = line.split('\t')
                    for i in range(len(column_name_list)):
                        if i != 0:
                            column_name_list_swiss.append(column_name_list[i].split(";")[0])
                        else:
                            column_name_list_swiss.append(column_name_list[i])
                else:
                    value_list = line.split('\t')
                    project_sid = ""
                    project_name = ""                    
                    for i in range(len(value_list)):

                        if i == 0:
                            
                            project = value_list[i].split(';')
                            
                            project_sid = project[0]
                            project_name = project[1]
                            print(project_sid, project_name)
                            if project_name == "K052":
                                project_name = "KO52"
                            elif project_name == "DiFi":
                                project_name = "DIFI"
                            elif project_name == "PC-3_[JPC-3]":
                                project_name = "PC-3 [JPC-3]"
                            elif project_name == "PE-CA-PJ15":
                                project_name = "PE/CA-PJ15"
                            elif project_name == "Hep3B2-1-7":
                                project_name = "Hep 3B2_1-7"
                            elif project_name == "LS1034":
                                project_name = "LS-1034"
                            elif project_name == "HuTu-80":
                                project_name = "HUTU-80"
                            elif project_name == "G-292-Clone-A141B1":
                                project_name = "G-292 Clone A141B1"
                            elif project_name == "CAPAN-2":
                                project_name = "Capan-2"
                            elif project_name == "B-CPAP":
                                project_name = "BCPAP"
                            elif project_name == "SNU-5":
                                project_name = "NCI-SNU-5"
                            elif project_name == "SNU-16":
                                project_name = "NCI-SNU-16"                        
                            elif project_name == "SNU-1":
                                project_name = "NCI-SNU-1"
                            elif project_name == "T24":
                                project_name = "T-24"
                            elif project_name == "NTERA-2-cl-D1":
                                project_name = "NTERA-2 cl.D1"
                            elif project_name == "MMAc-SF":
                                project_name = "MMAC-SF"
                            elif project_name in ["NCI-H2731", "NCI-H2722", "NCI-H2595", "NCI-H2591", "NCI-H2461", "NCI-H2373", "NCI-H2369", "NCI-H513", "NCI-H2795", "NCI-H2803", "NCI-H2804", "NCI-H2810", "NCI-H3118", "NCI-H290", "NCI-H2869", "NCI-H2818"]:
                                project_name = project_name[4:]
                            elif project_name == "NB4":
                                project_name = "NB-4"
                            elif project_name in ["Hs-940-T", "Hs-939-T", "Hs-766T", "Hs-746T", "Hs-683", "Hs-633T"]:
                                project_name = "Hs"+project_name[3:]
                        else:
                            swiss = column_name_list_swiss[i]
                            value = value_list[i]
                            try:
                                num_value = float(value)
                                row_data = [project_name, project_sid, swiss, num_value]
                                writer.writerow(row_data)
                            except ValueError:
                                t = 0

def query_create_index(tx):
    queries = [
        "CREATE INDEX IF NOT EXISTS FOR (c:Cell_Line) ON (c.Sample_Name);",
        "CREATE INDEX IF NOT EXISTS FOR (c:Cell_Line) ON (c.SIDM);",
        "CREATE INDEX IF NOT EXISTS FOR (p:Protein) ON (p.swiss);",
    ]
    for query in queries:
        tx.run(query)

def query_create_connections(tx, file_name,relationship_name):
    print(file_name)
    query = """
            CALL apoc.periodic.iterate(
            'LOAD CSV WITH HEADERS FROM "file:///"""+file_name+"""" AS row FIELDTERMINATOR "," RETURN row',
            '
            WITH row
            MERGE (c:Cell_Line {SIDM: row.project_sid})
            WITH c, row
            MATCH (p:Protein {swiss: row.swiss})
            CREATE (c)-[r:HAS_PROTEIN_"""+str(relationship_name)+"""]->(p)
            SET r.Protein_Intensity = toFloat(row.value),
            r.project_id = 1',
            { batchSize: 100000}
            );"""
    tx.run(query)    
def create_cell_line(folder_path):
    files = []
    # Walk through the directory and get all files
    for _, _, filenames in os.walk(folder_path):
        files.extend(filenames)
    relationship_name =""
    neo_path = ""
    if folder_path == "D:/neo4j/import/Cell_Line_Protein/6692":
        relationship_name = "6692"
        neo_path = "Cell_Line_Protein/6692/"
    else:
        relationship_name = "8498"
        neo_path = "Cell_Line_Protein/8498/"
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            session.execute_write(query_create_index)
            for file_name in files:
                session.execute_write(query_create_connections, neo_path+file_name, relationship_name)
                print(file_name)






#create_cell_line_csv("ProCan-DepMapSanger_protein_matrix_8498_averaged.txt")
#create_cell_line_csv("ProCan-DepMapSanger_protein_matrix_6692_averaged.txt")

#create_cell_line_protein()
create_cell_line("D:/neo4j/import/Cell_Line_Protein/6692")
create_cell_line("D:/neo4j/import/Cell_Line_Protein/8498")

















#OPTIONAL MATCH (p2:Protein)
#                                WHERE swiss IN p2.SWISS_PROT_Accessions_Interactor and p2.Organism_Name_Interactor = "Homo sapiens" and ANY(sname IN p2.Synonyms_Interactor WHERE toLower(sname) = toLower(gene_name))                       
#                                WITH swiss, gene_name, count(p2) AS nullProteinCount
#                                WHERE NOT nullProteinCount = 1