import csv
import json
###########################################################
# Create the Data for the drug ProCan Plot on our website #
###########################################################

pathway_dict = {}

with open('exportDrugPlot.csv', mode='r', encoding='utf-8-sig') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    for row in csv_reader:
        drug_name = row['DrugName'].strip('""')
        drug_uid = row['DrugUID'].strip('""')
        pathway = row['pathway'].strip('""')
        has_association = row['HasAssociationWithGDSC1'].lower() == 'true'
        
        if pathway not in pathway_dict:
            pathway_dict[pathway] = {'pathway': pathway, 'drugNames': [], 'count': 0}
        
        pathway_dict[pathway]['drugNames'].append([drug_name, drug_uid, has_association])
        
        pathway_dict[pathway]['count'] += 1

resulting_array = list(pathway_dict.values())

resulting_array.sort(key=lambda x: x['count'], reverse=True)

with open('result.json', 'w') as json_file:
    json.dump(resulting_array, json_file, indent=2)

print("Resulting array saved to 'result.json'")
