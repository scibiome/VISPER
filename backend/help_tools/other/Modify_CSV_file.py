import csv
###################
# Modify csv file #
###################

# Define input and output file paths
input_file_path = 'example/mmc6.csv'
output_file_path = 'example/new_mmc6.csv'

# Function to process and modify a row
def process_row(row):
    # Remove the first two double quotes
    row = row.replace('"', '', 2)
    
    # Split the row into parts using double quotes
    parts = row.split('"')
    
    # Check if there are at least four parts (three double quotes)
    if len(parts) >= 3:
        # Replace semicolons with spaces between the third and fourth double quotes
        modified_row = f'{parts[0]}"{parts[1].replace(";", ",")}"{parts[2]}'
        return modified_row
    else:
        return row

# Process the input CSV file and write to the output CSV file
with open(input_file_path, 'r', newline='', encoding='utf-8') as input_file, \
     open(output_file_path, 'w', newline='', encoding='utf-8') as output_file:
    
    # Read the entire input file as text
    input_data = input_file.read()
    
    # Split the input data into lines
    lines = input_data.splitlines()
    
    # Process each line (row) and write to the output file
    for line in lines:
        modified_row = process_row(line)
        output_file.write(modified_row + '\n')

print("CSV file has been processed and saved to", output_file_path)
