from neo4j import GraphDatabase
import json
from chembl_webresource_client.new_client import new_client

###############################################################################################
# Use the ChEMBL API to get cancer drug indication and drug type to the drugs in the database #
###############################################################################################


uri = "bolt://localhost:7687"  
username = "neo4j"            
password = "workwork"  
drug_indication = new_client.drug_indication
molecule = new_client.molecule
m1 = molecule.filter(chembl_id='CHEMBL428647')

cancer_types = [['bladder cancer',['urinary bladder cancer','urinary bladder carcinoma']],
                ['breast cancer', ['breast carcinoma']],
                ['cervical cancer',['cervical carcinoma']],
                ['colorectal cancer',['colorectal carcinoma']],
                ['endometrial cancer',['endometrial carcinoma']],
                ['gastric cancer',['gastric carcinoma']],
                ['head and neck cancer',['head and neck squamous cell carcinoma','head and neck carcinoma']],                
                ['hepatocellular cancer',['hepatocellular carcinoma']],
                ['kidney cancer',['renal cell carcinoma','kidney carcinoma']],
                ['leukemia',['leukemia']],
                ['lung cancer',['non-small cell lung carcinoma','small cell lung carcinoma']],
                ['lymphoma',['lymphoma']],
                ['ovarian cancer', ['fallopian tube cancer']],
                ['pancreatic cancer',['pancreatic carcinoma']],
                ['peritoneum cancer',['peritoneum carcinoma']],
                ['prostate cancer', ['prostate adenocarcinoma','prostate adenocarcinoma']],
                ['rectum cancer',['rectum carcinoma']],
                ['sarcoma',['soft tissue sarcoma']],
                ['skin cancer', ['melanoma', 'skin carcinoma','squamous cell carcinoma']]
                ]

def addTypes(tx):
    query = """
        MATCH (d:Drug)
        WHERE d.CHEMBL IS NOT NULL
        RETURN d.drug_id AS drug_id, d.CHEMBL AS CHEMBL
    """
    result = tx.run(query)
    all_drugs = [[record["drug_id"],record["CHEMBL"]]  for record in result]
    all_drugs_chembls = [record["CHEMBL"]  for record in result]
    
    # get indicated drugs for cancer
    search_terms = ["CANCER","CARCINOMA","LYMPHOMA","MELANOMA","SARCOMA","LEUKEMIA"]

    unique_cancer_forms = set()
    chembl_id_to_cancer_types = {}
    cancer = {}

    for term in search_terms:
        cancer_drug_indications = drug_indication.filter(efo_term__icontains=term)

        for ind in cancer_drug_indications:
            #if 
            #print(ind['molecule_chembl_id'])
            if (ind['max_phase_for_ind'] == '4.0' or ind['max_phase_for_ind'] == '3.0' or ind['max_phase_for_ind'] == '2.0' or ind['max_phase_for_ind'] == '1.0'):# :
                if ind['molecule_chembl_id'] == "CHEMBL92":
                    print(ind)
                chembl_id = ind['molecule_chembl_id']
                cancer_type = ind['efo_term']
                chembl_id_parent = ind['parent_molecule_chembl_id']
                
                # add max phase
                max_phase = 0
                if ind['max_phase_for_ind']  == '1.0':
                    max_phase = 1
                if ind['max_phase_for_ind']  == '2.0':
                    max_phase = 2
                if ind['max_phase_for_ind']  == '3.0':
                    max_phase = 3
                if ind['max_phase_for_ind']  == '4.0':
                    max_phase = 4

                category_number = 30
                if term == "LYMPHOMA":
                    category_number = 11
                elif term == "MELANOMA":
                    category_number = 18
                elif term == "SARCOMA":
                    category_number = 17
                elif term == "LEUKEMIA":
                    category_number = 9
                else:
                    counter = 0
                    stops = False
                    if "|" in cancer_types:
                        print("cancer_types: ", cancer_types)
                    for c in cancer_types:
                        if c[0] == cancer_type:
                            category_number = counter
                            break
                        for c2 in c[1]:
                            if c2 == cancer_type:
                                category_number = counter
                                stops = True
                                break
                        if stops:
                            break
                        counter += 1

                             

                if any(chembl_id == drug[1].split(",")[0] for drug in all_drugs):
                    unique_cancer_forms.add(cancer_type)
                    if chembl_id not in chembl_id_to_cancer_types:
                        chembl_id_to_cancer_types[chembl_id] = [set(),set(),set(),set()]
                    
                    for i in range(0, max_phase):
                        chembl_id_to_cancer_types[chembl_id][i].add(category_number)
                    if cancer_type not in cancer:
                        cancer[cancer_type] = 0
                    cancer[cancer_type] = cancer[cancer_type] + 1
                else:
                    if any(chembl_id_parent == drug[1].split(",")[0] for drug in all_drugs):
                        unique_cancer_forms.add(cancer_type)
                        if chembl_id_parent not in chembl_id_to_cancer_types:
                            chembl_id_to_cancer_types[chembl_id_parent] = [set(),set(),set(),set()]
                        
                        for i in range(0, max_phase):
                            chembl_id_to_cancer_types[chembl_id_parent][i].add(category_number)
                        if cancer_type not in cancer:
                            cancer[cancer_type] = 0
                        cancer[cancer_type] = cancer[cancer_type] + 1

    for c3 in chembl_id_to_cancer_types:
        chembl_id_to_cancer_types[c3] = [list(chembl_id_to_cancer_types[c3][0]), list(chembl_id_to_cancer_types[c3][1]), list(chembl_id_to_cancer_types[c3][2]), list(chembl_id_to_cancer_types[c3][3])]
    
    print(chembl_id_to_cancer_types)
    if True:
        for d3 in all_drugs:
            drug_id = d3[0]
            drug_chembl = d3[1]
            if "," in drug_chembl:
                drug_chembl = drug_chembl.split(",")[0]
            for c4 in chembl_id_to_cancer_types:
                if drug_chembl == c4:
                    save_t = json.dumps(chembl_id_to_cancer_types[c4])
                    query3 = f"""
                        MATCH (d:Drug)
                        WHERE d.drug_id = "{drug_id}"
                        SET d.indicator = "{save_t}"
                        """
                    print(query3)
                    tx.run(query3)
                    break
    


    
    print("Unique cancer forms found in the database:")
    for cancer_form in unique_cancer_forms:
        print(cancer_form)
    print(len(chembl_id_to_cancer_types))
    
    
    length_counts = {}
    for i in chembl_id_to_cancer_types:
        leng = len(chembl_id_to_cancer_types[i])
        if leng not in length_counts:
            length_counts[leng] = 1
        else:
            length_counts[leng] += 1
    for leng, count in length_counts.items():
        print(f"Length {leng} occurs {count} times in chembl_id_to_cancer_types")


    sorted_cancer = sorted(cancer.items(), key=lambda item: item[1], reverse=True)
    for cancer_type, count in sorted_cancer:
        print(f"{cancer_type}: {count}")

    
    for chembl_id in all_drugs_chembls:
        if chembl_id in chembl_id_to_cancer_types:
            unique_cancer_types = list(set(chembl_id_to_cancer_types[chembl_id]))
            print(f"ChEMBL ID: {chembl_id} is used for the following cancer treatments: {', '.join(unique_cancer_types)}")
        else:
            print(f"ChEMBL ID: {chembl_id} is not used for cancer treatment or not found in the database.")
    
           
unique_types = set()


def addDrugType(tx):
    query = """
        MATCH (d:Drug)
        WHERE d.CHEMBL IS NOT NULL
        RETURN d.drug_id AS drug_id, d.CHEMBL AS CHEMBL
    """
    result = tx.run(query)
    all_drugs = [[record["drug_id"],record["CHEMBL"]]  for record in result]
    for i in all_drugs:
        drug_id = i[0]
        chembl_id = i[1]
        if "," in chembl_id:
            chembl_id = chembl_id.split(",")[0]
        #print(chembl_id, i, type(chembl_id))
        print(chembl_id)
        type_of_drug_list = molecule.filter(chembl_id=chembl_id).only('molecule_type')
        if type_of_drug_list and len(type_of_drug_list):
            type_of_drug = type_of_drug_list[0]['molecule_type']
            if type_of_drug and type_of_drug != 'Unknown':
                unique_types.add(type_of_drug)
                #'Small molecule' = 0, 'Protein' = 1, 'Antibody' = 2}
                assigned_number = 0
                if type_of_drug == 'Protein':
                    assigned_number = 1
                if type_of_drug == 'Antibody':
                    assigned_number = 2
                assigned_number = str(assigned_number)
                query2 = f"""
                    MATCH (d:Drug)
                    WHERE d.drug_id = "{drug_id}"
                    SET d.drug_type = "{type_of_drug}"
                    SET d.drug_type_number = {assigned_number}
                """
                result = tx.run(query2)
    print(unique_types)

def update_database():   
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            session.write_transaction(addTypes)
            #session.write_transaction(addDrugType)

update_database()