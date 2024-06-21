from neo4j import GraphDatabase
from chembl_webresource_client.new_client import new_client
import json

#######################################
# Add ChEMBL and DrugBank ID to drugs #
#######################################

with open('ChemblDrugBankID.json', 'r') as file:
    drugbank_chembl_pairs = json.load(file)

with open('allInfoDrugBank.json', 'r') as file:
    drug_info = json.load(file)

chembl_drugbank_mapping = {pair[1]: pair[0] for pair in drugbank_chembl_pairs if len(pair) == 2}

uri = "bolt://localhost:7687"  
username = "neo4j"             
password = "workwork"          
all_drugs = []


def integrate_drugbank_data(tx):
    chembl_ids_query = """
    MATCH (d:Drug)
    WHERE d.CHEMBL IS NOT NULL and not d.CHEMBL = 'None' and not d.CHEMBL = 'none' and not d.CHEMBL = 'several'
    RETURN DISTINCT d.name
    """
    chembl_ids_result = tx.run(chembl_ids_query)
    chembl_ids = [record["CHEMBLID"] for record in chembl_ids_result]
    counter = 0
    set_drugbank_ids = set()
    print(len(chembl_ids))

    for chembl_id in chembl_ids:
        drugbank_id = chembl_drugbank_mapping.get(chembl_id)
        counter = counter + 1
        if drugbank_id == None:
            all_drugs.append(drugbank_id)


    return set_drugbank_ids



def add_drugbank_and_chemblid(tx):
    # get drugs ohne chembl
    chembl_ids_query = """
    MATCH (d:Drug)
    WHERE d.CHEMBL IS NULL or d.CHEMBL = 'None' or d.CHEMBL = 'none' or d.CHEMBL = 'several'
    RETURN d.name AS name, d.uid AS uid
    """
    chembl_ids_result = tx.run(chembl_ids_query)
    chembl_ids = [[record["name"],record["uid"]]  for record in chembl_ids_result]
    counter = 0

    set_drugbank_ids = set()
    print(len(chembl_ids))
    found_drugs = 0
    not_found_drugs = 0
    
    for chembl_id in chembl_ids:
        found_match = False
        for drug_info_element in drug_info:
            if drug_info_element['name'].lower() == chembl_id[0].lower():
                found_match = True
                break
        if not found_match:
            for drug_info_element in drug_info:
                for synonym in drug_info_element['synonyms']:
                    if synonym.lower() == chembl_id[0].lower():
                        found_match = True
                        break
        if found_match:
            found_drugs = found_drugs + 1
            chembl_ids_query2 = """
            MATCH (d:Drug)
            WHERE d.uid = $uid
            SET d.CHEMBL = $chembl_id, d.DrugBank = $drugbank_id
            """
            tx.run(chembl_ids_query2, uid=chembl_id[1], chembl_id=drug_info_element['chembl_id'], drugbank_id=drug_info_element['drugbank_id'])
            
        else:
            not_found_drugs = not_found_drugs +1



def add_drugbank_and_chemblid2(tx):
    chembl_ids_query = """
    MATCH (d:Drug)
    WHERE d.CHEMBL IS NULL or d.CHEMBL = 'None' or d.CHEMBL = 'none' or d.CHEMBL = 'several'
    RETURN d.name AS name, d.uid AS uid, d.CHEMBL AS c
    """
    chembl_ids_result = tx.run(chembl_ids_query)
    chembl_ids = [[record["name"],record["uid"], record["c"]]  for record in chembl_ids_result]
    counter = 0

    set_drugbank_ids = set()
    found_drugs = 0
    not_found_drugs = 0
    molecule = new_client.molecule
    for chembl_id in chembl_ids:
        
        mols = molecule.filter(molecule_synonyms__molecule_synonym__iexact=chembl_id[0]).only('molecule_chembl_id')
        if len(mols) >= 1:
            if chembl_id[2] == 'several' or len(mols) == 1:
                #a_chembls = mols.join(', ')
                found_drugs = found_drugs + 1
                print(found_drugs, mols, chembl_id[0])
                chembl_ids_query2 = """
                MATCH (d:Drug)
                WHERE d.uid = $uid
                SET d.CHEMBL = $chembl_id
                """
                tx.run(chembl_ids_query2, uid=chembl_id[1], chembl_id=mols[0]['molecule_chembl_id'])
        
schebml_to_chembl = [["SCHEMBL19472011", "CHEMBL4297482"],["SCHEMBL16220740","CHEMBL4542380"],["SCHEMBL17702017","CHEMBL4076837"],["SCHEMBL4699731","CHEMBL3752910"],["SCHEMBL10321469","CHEMBL2204495"],["SCHEMBL17189791","CHEMBL4303453"],["SCHEMBL4051419","CHEMBL1235786"],["SCHEMBL15412407","CHEMBL4068896"],["SCHEMBL12254622","CHEMBL4303309"],["SCHEMBL15667328","CHEMBL4206836"],["SCHEMBL18205034","CHEMBL4168754"],["SCHEMBL16279460","CHEMBL4297584"],["SCHEMBL18631972","CHEMBL4594429"],["SCHEMBL17244048","CHEMBL4125960"],["SCHEMBL1492164","CHEMBL4303470"],["SCHEMBL2359661","CHEMBL4303384"],["SCHEMBL13599879","CHEMBL3990456"]]
# not foun SCHEMBL14211774, SCHEMBL15443888, [SCHEMBL2284510, SCHEMBL2284518], SCHEMBL16402486

def add_drugbank(tx):
    chembl_ids_query = """
    MATCH (d:Drug)
    WHERE d.CHEMBL IS not NULL and not d.CHEMBL = 'None' and not d.CHEMBL = 'none' and not d.CHEMBL = 'several'
    RETURN d.CHEMBL AS CHEMBL, d.uid AS uid
    """
    chembl_ids_result = tx.run(chembl_ids_query)
    chembl_ids = [[record["CHEMBL"],record["uid"]]  for record in chembl_ids_result]

    molecule = new_client.molecule

    found_drugs = 0
    not_found_drugs = 0
    for chembl_id in chembl_ids:
        all_chembls = chembl_id[0].split(", ")
        addChembl = ""
        addSure = ""
        addDrugBank = ""
        addSmiles = ""
        addATC =[]
        for all_element in all_chembls:
            SureChEMBL = ""
            DrugBank = ""
            smile = ""
            atc = []
            if all_element.startswith('S'):
                new_chembl = ""
                for s_to_c in schebml_to_chembl:
                    if s_to_c[0] == all_element:
                        new_chembl = s_to_c[1]
                        break
                if new_chembl != "":
                    SureChEMBL = all_element
                    all_element = new_chembl
            
            m1 = molecule.filter(chembl_id=all_element)
            if m1 :
                element = m1[0]

                if element is not None:
                    if 'molecule_structures' in element:
                        if element.get('molecule_structures', None) != None:
                            if'canonical_smiles' in element['molecule_structures']:
                                smile = element.get('molecule_structures', {}).get('canonical_smiles', "")

                    if 'atc_classifications' in element:
                        atc = element.get('atc_classifications', [])
                else:
                    smile = ""
                    atc = []

                
            for drug_info_element in drug_info:
                if drug_info_element['chembl_id'] == all_element:
                    DrugBank = drug_info_element['drugbank_id']
                    if smile == "":
                        smile = drug_info_element['smiles']
                    if atc == []:
                        atc = drug_info_element["atc_codes"]
                    found_drugs = found_drugs +1
                    break
            if addChembl != "":
                addChembl = addChembl + ", "
            addChembl = addChembl + all_element
            if SureChEMBL != "":
                if addSure != "":
                    addSure = addSure + ", "
                addSure = addSure + SureChEMBL
            if DrugBank != "":
                if addDrugBank != "":
                    addDrugBank = addDrugBank + ", "
                addDrugBank = addDrugBank + DrugBank
            if smile != "" and smile != None:
                if addSmiles != "":
                    addSmiles = addSmiles + ", "
                addSmiles = addSmiles + smile
            addATC.extend(atc)
        if addChembl != "":
            query1 = "MATCH (d:Drug) WHERE d.uid = '"+chembl_id[1]+"'\n"
            query2 = "SET d.CHEMBL = '"+addChembl+"'"
            query3 = ""
            query4 = ""
            query5 = ""
            query6 = ""
            if addSure != "":
                query3 = ", d.SureChEMBL = '"+addSure+"'"
            if addDrugBank != "":
                query4 = ", d.DrugBank = '"+addDrugBank+"'"
            if addSmiles != "":
                query5 = ", d.SMILES = '"+addSmiles+"'"
            if addATC != []:
                query6 = ", d.ATC = "+str(addATC)
            query = query1 + query2 + query3 + query4 + query5 + query6
            tx.run(query)
            found_drugs = found_drugs + 1
            not_found_drugs = not_found_drugs +1



def change_schembl(tx):
    chembl_ids_query = """
    MATCH (d:Drug)
    WHERE d.CHEMBL IS not NULL and not d.CHEMBL = 'None' and not d.CHEMBL = 'none' and not d.CHEMBL = 'several' AND d.CHEMBL STARTS WITH 'S'  
    RETURN d.CHEMBL AS CHEMBL, d.uid AS uid, d.name AS name
    """
    chembl_ids_result = tx.run(chembl_ids_query)
    chembl_ids = [[record["CHEMBL"],record["uid"], record["name"]]  for record in chembl_ids_result]
    for chem in chembl_ids:
        print(chem[0], chem[2])

def update_database_with_drugbank():
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            # Check Drugbank for names and synonyms equals
            #session.write_transaction(add_drugbank_and_chemblid)

            # Check chembl for names equals
            #session.write_transaction(add_drugbank_and_chemblid2)
            
            # not important
            #session.write_transaction(change_schembl)
            
            # Change schembl, add atc and smile
            session.write_transaction(add_drugbank)
            
            #drugbank_ids_set = session.write_transaction(integrate_drugbank_data)
            
            #return drugbank_ids_set

updated_drugbank_ids = update_database_with_drugbank()