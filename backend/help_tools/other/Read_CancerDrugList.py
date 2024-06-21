################################################
# Reads CancerDrugList and give back all drugs #
################################################

def read_file_and_process(file_path):
    result = []
    with open(file_path, 'r') as file:
        for line in file:
            line = line.strip()
            if len(line) > 1:
                first_part = line.split(' ')[0]
                result.append(first_part)
    return result

result = read_file_and_process('CancerDrugList.txt')
print(result)
