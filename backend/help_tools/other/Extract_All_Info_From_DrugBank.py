from lxml import etree
import json

def extract_drugbank_info_and_save_to_json(xml_file, json_file_path):
    tree = etree.parse(xml_file)
    namespace = {'db': 'http://www.drugbank.ca'}

    drugs = tree.xpath('//db:drug', namespaces=namespace)
    drug_info = []

    for drug in drugs:
        drugbank_id = drug.find('.//db:drugbank-id[@primary="true"]', namespace)
        if drugbank_id is not None:
            drugbank_id = drugbank_id.text

            chembl_id_element = drug.find('.//db:external-identifier[db:resource="ChEMBL"]', namespace)
            chembl_id = None
            if chembl_id_element is not None:
                chembl_id = chembl_id_element.find('.//db:identifier', namespace).text

            name = drug.find('.//db:name', namespace).text if drug.find('.//db:name', namespace) is not None else None

            synonyms_elements = drug.findall('.//db:synonyms/db:synonym', namespace)
            synonyms = [syn.text for syn in synonyms_elements] if synonyms_elements else []

            # Extract ATC codes
            atc_codes_elements = drug.findall('.//db:atc-codes/db:atc-code', namespace)
            atc_codes = [atc.get('code') for atc in atc_codes_elements] if atc_codes_elements else []

            # Extract SMILES
            smiles_element = drug.find('.//db:calculated-properties/db:property[db:kind="SMILES"]/db:value', namespace)
            smiles = smiles_element.text if smiles_element is not None else None

            drug_info.append({
                'drugbank_id': drugbank_id, 
                'chembl_id': chembl_id, 
                'name': name, 
                'synonyms': synonyms,
                'atc_codes': atc_codes,
                'smiles': smiles
            })

    with open(json_file_path, 'w') as file:
        json.dump(drug_info, file, indent=4)

    return json_file_path

# Usage example
drugbank_xml_file = 'C:/Users/pc/Desktop/Masterarbeit/code-masterarbeit/backend/helper/drugbank/full_database.xml'
json_file_path = 'allInfoDrugBank.json'
saved_file = extract_drugbank_info_and_save_to_json(drugbank_xml_file, json_file_path)
print(f"Drug information saved to JSON file: {saved_file}")
