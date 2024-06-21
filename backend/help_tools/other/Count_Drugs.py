import csv
################
# Count Drugs #
###############


def count_unique_elements(file_path):
    unique_elements = set()
    first_part_dict = {}

    with open(file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile, delimiter=',')
        i = 0
        for row in reader:
            y_id = row['y_id']
            parts = y_id.split(';')
            first_part = parts[1].split(';', 1)[0]  # Assuming the first_part is at index 1
            second_part = parts[0]  # Assuming the second_part is at index 0
            
            unique_elements.add(first_part)
            
            if first_part in first_part_dict:
                if first_part_dict[first_part] != second_part:
                    print(f"For first_part {first_part}, found different second_part: {first_part_dict[first_part]} and {second_part}")
            else:
                first_part_dict[first_part] = second_part
            
            i += 1
            if i % 10000 == 0:  # Corrected the condition for printing
                print(f"Processed {i} rows")

    return len(unique_elements)


def count_unique_elements2(file_path):
    unique_elements = set()
    unique_proteins = set()
    with open(file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile,  delimiter=',')
        i = 0
        for row in reader:
            y_id = row['y_id']
            secoud_part = y_id.split(';', 1)[0]
            first_part2 = y_id.split(';', 1)[1]
            first_part = first_part2.split(';', 1)[0]
            unique_elements.add(first_part)
            unique_proteins.add(row['x_id'])
            if i % 10000:
                print(i)

    print("protein ",len(unique_proteins))
    file_name = "/ProCan-DepMapSanger_protein_matrix_8498_averaged.txt"
    column_names = True
    column_name_list = []
    unique_proteins_matrix = set()
    p = 0
    file_path = "C:/Users/PC/Downloads/data/data/dropbox/19345397" + file_name

    with open(file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile, delimiter='\t')
        column_names = reader.fieldnames
        for c in column_names:
            if c != 'Project_Identifier':
                no_swiss = c.split(";")[1]
                no_human = no_swiss[:-6]
                #print(no_human)
                unique_proteins_matrix.add(no_human)
                
    csv_file_path = 'C:/Users/PC/Downloads/uniprot_human_idmap.tab/uniprot_human_idmap.tab'

    data_list = []
    entry_values = {}  # Dictionary to store the count of each Entry
    unique_proteins_matrix = set()
    with open(csv_file_path, 'r') as file:
        csv_reader = csv.DictReader(file, delimiter='\t')
        for row in csv_reader:
            entry_name = row['Entry name'][:-6]
            gene_name = row['Gene names  (primary )']
            if "; " in gene_name:
                gene_name_list = gene_name.split("; ")
                for g in gene_name_list:
                    unique_proteins_matrix.add(g)
            else:
                if gene_name != "":
                    unique_proteins_matrix.add(gene_name)       


            #unique_proteins_matrix.add(entry_name)
    
    proteins_not_in_matrix = unique_proteins.difference(unique_proteins_matrix)
    print("proteins_not_in_matrix",len(proteins_not_in_matrix))
    #print(list(proteins_not_in_matrix))
    return len(unique_elements)


# Replace 'file_path.csv' with the path to your large CSV file
csv_file_path = 'file_path.csv'
#unique_count = count_unique_elements("C:/Users/PC/Downloads/mmc63.txt")
unique_count = count_unique_elements2("C:/Users/PC/Downloads/data/data/dropbox/19345397/lm_associations_drug_protein_matrix_6692_averaged.csv/lm_sklearn_degr_drug_annotated_diann_051021.csv")
print(f"Number of unique elements before first ';' in 'y_id' column: {unique_count}")
