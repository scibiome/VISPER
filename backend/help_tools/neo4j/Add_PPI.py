import csv

def read_csv(file_path, delimiter=','):
    data = []
    with open(file_path, 'r') as file:
        csv_reader = csv.reader(file, delimiter=delimiter)
        column_names = next(csv_reader)
        for row in csv_reader:
            data.append(row)
    return data
def write_csv(file_path, data, delimiter=','):
    with open(file_path, 'w', newline='') as file:
        csv_writer = csv.writer(file, delimiter=delimiter)
        csv_writer.writerows(data)
def main():
    file1_path = 'output.csv'
    file2_path = 'C:/Users/pc/Desktop/mmc6.csv'
    data_from_file1 = read_csv(file1_path)
    data_from_file2 = read_csv(file2_path, delimiter=';')
    counter = 0
    counter2 = 0
    print("Data from file 1:")
    for row in data_from_file1:
        get_drug = row[0]
        get_nc_beta = round(float(row[4]),7)
        get_protein = row[1]
        get_ppi = row[3]
        #print(get_drug, get_nc_beta,get_protein,get_ppi)
        counter2 += 1
        if get_ppi == "-":
            for row2 in data_from_file2:
                
                get_drug2 = row2[1]
                get_nc_beta2 = round(float(row2[10].replace(',', '.')), 7)
                get_protein2 = row2[3]
                get_ppi2 = row2[16]
                if get_drug == get_drug2 and get_protein2 == get_protein and get_nc_beta == get_nc_beta2:
                    if get_ppi2 == "5+":
                        row[3] = 5
                        counter += 1
                        
                    break
                
        print(counter, counter2)
    write_csv('output_modified.csv', data_from_file1)
main()