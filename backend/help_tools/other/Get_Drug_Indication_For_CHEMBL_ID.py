from chembl_webresource_client.new_client import new_client

###########################################
# Check Drug Indications for a CHEMBL ID #
##########################################

drug_indication = new_client.drug_indication
molecule = new_client.molecule
m1 = molecule.filter(chembl_id='CHEMBL428647')
search_terms = ["CANCER", "CARCINOMA", "TUMOR"]
your_chembl_ids = ['CHEMBL1024']  # Example ID

unique_cancer_forms = set()
chembl_id_to_cancer_types = {}

for term in search_terms:
    cancer_drug_indications = drug_indication.filter(efo_term__icontains=term)
    print(cancer_drug_indications)
    for ind in cancer_drug_indications:
        chembl_id = ind['molecule_chembl_id']
        cancer_type = ind['efo_term']
        unique_cancer_forms.add(cancer_type)
        if chembl_id in your_chembl_ids:
            if chembl_id not in chembl_id_to_cancer_types:
                chembl_id_to_cancer_types[chembl_id] = []
            chembl_id_to_cancer_types[chembl_id].append(cancer_type)

print("Unique cancer forms found in the database:")
for cancer_form in unique_cancer_forms:
    print(cancer_form)

for chembl_id in your_chembl_ids:
    if chembl_id in chembl_id_to_cancer_types:
        unique_cancer_types = list(set(chembl_id_to_cancer_types[chembl_id]))
        print(f"ChEMBL ID: {chembl_id} is used for the following cancer treatments: {', '.join(unique_cancer_types)}")
    else:
        print(f"ChEMBL ID: {chembl_id} is not used for cancer treatment or not found in the database.")

cancer_drug_indications = drug_indication.filter(efo_term__icontains="CANCER")
cancer_treatments = {}
counter = 0
unique_cancer_forms = set()
for ind in cancer_drug_indications:
    counter += 1
    print(counter, len(cancer_drug_indications))
    chembl_id = ind['molecule_chembl_id']
    cancer_type = ind['efo_term']
    if chembl_id not in cancer_treatments:
        cancer_treatments[chembl_id] = []
    cancer_treatments[chembl_id].append(cancer_type)
    unique_cancer_forms.add(cancer_type) 

print(unique_cancer_forms)

for chembl_id in your_chembl_ids:
    if chembl_id in cancer_treatments:
        print(f"ChEMBL ID: {chembl_id} is used for the following cancer treatments: {', '.join(cancer_treatments[chembl_id])}")
    else:
        print(f"ChEMBL ID: {chembl_id} is not used for cancer treatment or not found in the database.")
