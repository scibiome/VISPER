import requests
###############################################################
# Get DrugBank-ID for a ChEMBL ID - we dont use this function #
###############################################################
def get_drugbank_id_from_chembl(chembl_id):
    base_url = "https://www.ebi.ac.uk/chembl/api/data/molecule/"
    url = f"{base_url}{chembl_id}.json"

    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        print(data)
        cross_references = data.get('molecule_structures', {}).get('cross_references', [])
        for ref in cross_references:
            print(cross_references)
            if ref['xref_src_db'] == 'DrugBank':
                return ref['xref_id']
        return "DrugBank ID not found"
    else:
        return "Error fetching data"

chembl_id = "CHEMBL428647"  # Replace with your ChEMBL ID
drugbank_id = get_drugbank_id_from_chembl(chembl_id)
print(drugbank_id)
