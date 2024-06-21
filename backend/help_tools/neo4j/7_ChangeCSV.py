import csv
import math
# Read CSV file
input_file = 'export.csv'
output_file = 'output.csv'

data = []

with open(input_file, newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    count = 0
    for row in reader:
        # Modify values as needed
        # For example, changing 'r.nc_beta' values
        row['nc_beta'] = float(row['nc_beta'])
        #print(row['ï»¿drug_name'][1:-1])
        split_putative_target = row['putative_target'].split(';')
        split_putative_target[0] = split_putative_target[0][1:]
        split_putative_target[-1] = split_putative_target[-1][:-1]
        #for i in range(1, len(split_putative_target)):  # Starting from the second element
        #    split_putative_target[i] = split_putative_target[i][1:]

        ppi_value = row['ppi']
        result_pval = -math.log10(float(row['nc_pval']))
        if ppi_value == 'null':
            ppi_value = '-'
        #if len(split_putative_target) > 1:
        #    print(split_putative_target, row['protein_name'])
        if row['protein_name'][1:-1] in split_putative_target:
            ppi_value = "T"
            print('success')
            count = count + 1

        new_row = {'drug_name': row['ï»¿drug_name'][1:-1], 'protein_name': row['protein_name'][1:-1], 'putative_target': row['putative_target'][1:-1], 'ppi': ppi_value, 'beta': row['nc_beta'], 'pval': result_pval, 'drug_uid': row['drug_uid'][1:-1], 'protein_uid': row['protein_uid'][1:-1]}
        data.append(new_row)
        #print(new_row)
    print(count)
# Write modified data to a new CSV file
with open(output_file, 'w', newline='') as csvfile:
    fieldnames = ['drug_name', 'protein_name', 'putative_target', 'ppi', 'beta', 'pval', 'drug_uid','protein_uid']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)


    writer.writeheader()
    for row in data:
        writer.writerow(row)

#print("CSV file has been modified and written to", output_file)