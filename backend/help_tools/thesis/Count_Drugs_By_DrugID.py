import csv
#################################################
# Count nu,bner of unique drugs basd on drug_id #
#################################################
def count_unique_y_ids(csv_file_path):
    unique_y_ids = set()

    with open(csv_file_path, 'r') as file:
        reader = csv.DictReader(file, delimiter=',')
        for row in reader:
            y_id = row['drug_id']
            unique_y_ids.add(y_id)
    return len(unique_y_ids)

csv_file_path = 'C:/Users/pc/Downloads/data/data/dropbox/19345397/DrugResponse_PANCANCER_GDSC1_GDSC2_20200602.csv/DrugResponse_PANCANCER_GDSC1_GDSC2_20200602.csv'
result = count_unique_y_ids(csv_file_path)
print(f"Number of unique values in the 'y_id' column: {result}")
