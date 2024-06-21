import csv
from neo4j import GraphDatabase
##########################################################
# Checks if a Protein with a specififc entry name exists #
##########################################################

uri = "bolt://localhost:7687" 
username = "neo4j"    
password = "workwork"

with open('mmc411.csv', newline='') as csvfile:
    csv_reader = csv.reader(csvfile)
    
    categories = {}
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            # Read each row in the CSV file
            for row in csv_reader:
                # Split the string on the first ';'
                split_string = row[0].split(';', 1)
                category = split_string[0]
                name = split_string[1][1:-1]  # Removing quotes around the name
                entry = name.split(';', 1)[1]
                print(entry)
                
                #print("synonyms_lower", synonyms_lower)
                result = session.run("""
                MATCH (p:Protein)
                WHERE p.entry_name = $entry OR p.entry_name2 = $entry
                RETURN p.uid AS uid
                """, entry=entry)
                print(entry)
                existing_protein = [record['uid'] for record in result]
                print(existing_protein)
                
                # Check if the category exists in the dictionary
                if category in categories:
                    # Append the name to the existing category
                    categories[category]['names'].append([name,existing_protein[0]])
                    categories[category]['count'] += 1
                else:
                    # Create a new category with the name and count
                    categories[category] = {'names': [[name,existing_protein[0]]], 'count': 1}

        # Convert the dictionary to a list of objects
        category_list = [{'category_name': key, 'names': value['names'], 'count': value['count']} for key, value in categories.items()]

        # Print the resulting list of category objects
        for category in category_list:
            print(category)