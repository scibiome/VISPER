import pandas as pd
###################################################################################
# Calculates the differences and similarities between GDSC1 and GDSC2 Beta-Values #
###################################################################################
def get_duplicate(GDSC_V, protein, drug_id, all_data2):
    for row in all_data2:
        y_id = row['y_id']
        x_id = row['x_id']
        beta = row['beta']
        drug_id2 = int(y_id.split(";")[0])
        gdsc_value = y_id.split(";")[2]
        if drug_id == drug_id2 and protein == x_id and gdsc_value != GDSC_V:
            return float(beta)
    return -100

# Replace 'your_file.csv' with the actual path to your CSV file
file_path = '2.csv'

# Read the CSV file into a pandas DataFrame
df = pd.read_csv(file_path, delimiter=',')

# Iterate over the rows and print the desired columns
all_drugs = set()
gdsc1_drugs = set()
gdsc2_drugs = set()
all_data = []
find_drugid_name_mismatch = []
differences = [0] * 40
beta_differences = [0] * 40
all_beta = 0
get_beta_median2 = []
for index, row in df.iterrows():
    y_id = row['y_id']
    x_id = row['x_id']
    beta = row['beta']
    all_beta = all_beta+  abs(beta)
    get_beta_median2.append( abs(beta))
    beta_round = round(abs(beta))
    beta_differences[beta_round] = beta_differences[beta_round] + 1
    drug_id = int(y_id.split(";")[0])
    drug_name = y_id.split(";")[1]
    gdsc_value = y_id.split(";")[2]
    all_drugs.add(drug_id)
    if not isinstance(drug_id, int):
        print(drug_id)
        break
    if gdsc_value == "GDSC1":
        gdsc1_drugs.add(drug_id)
    else:
        gdsc2_drugs.add(drug_id)
    all_data.append({'y_id': y_id, 'x_id': x_id, 'beta': beta})
    add_drug = True
    for f in find_drugid_name_mismatch:
        if f[0] == drug_id:
            if f[1] == drug_name:
                add_drug = False
                break
            else:
                print("Problem", drug_id, drug_name, f[0], f[1])
    if add_drug:
        find_drugid_name_mismatch.append([drug_id, drug_name])
    
    #print(f"y_id: {y_id}, x_id: {x_id}, beta: {beta}", drug_id)
    #break
sorted_values = sorted(get_beta_median2)

# Calculate median
n = len(sorted_values)
if n % 2 == 0:
    median = (sorted_values[n//2 - 1] + sorted_values[n//2]) / 2
else:
    median = sorted_values[n//2]

# Calculate average
average = sum(sorted_values) / n
print("average all", average, median)
double_values = gdsc1_drugs.intersection(gdsc2_drugs)
print(len(double_values))
print("beta_differences", beta_differences)
print("all_beta", (all_beta/103371)* 100)
counter_rows = 0
counter_no_value = 0
county = 0
all_beta_values = 0
get_beta_median = []
all_results = 0
min_gdsc = 1000.0
max_gdsc = -1000.0
good_sign = 0
bad_sign = 0
for row in all_data:
    y_id = row['y_id']
    x_id = row['x_id']
    beta = float(row['beta'])
    if beta > max_gdsc:
        max_gdsc = beta
    if min_gdsc > beta:
        min_gdsc = beta
    drug_id = int(y_id.split(";")[0])
    gdsc_value = y_id.split(";")[2]
    county = county +1
    if drug_id in double_values:
        counter_rows = counter_rows + 1
        get_other_beta = get_duplicate(gdsc_value, x_id, drug_id, all_data)
        if get_other_beta == -100:
            counter_no_value = counter_no_value + 1
            all_beta_values = all_beta_values + abs(beta)
        else:
            result  = abs(beta - get_other_beta)
            if (beta >= 0 and get_other_beta >= 0) or (beta < 0 and get_other_beta < 0):
                good_sign = good_sign + 1
            else:
                bad_sign = bad_sign +1
            all_results = all_results + result
            rounded_result = round(result, 1)
            get_position = int(rounded_result*10)
            differences[get_position] = differences[get_position] +1 
            get_beta_median.append(abs(beta))
            
            if get_position > 5:
                print(y_id, x_id, beta, get_other_beta, rounded_result, get_position)
            
print("min max all", min_gdsc, max_gdsc)        
sorted_values = sorted(get_beta_median)
print("good_bad", good_sign, bad_sign)
# Calculate median
n = len(sorted_values)
if n % 2 == 0:
    median = (sorted_values[n//2 - 1] + sorted_values[n//2]) / 2
else:
    median = sorted_values[n//2]

# Calculate average
average = sum(sorted_values) / n
print("average", average, median)
print("beta average difference", all_results/16050)
print(counter_rows, (counter_rows/ 103371) * 100)
print("counter_no_value", counter_no_value)
print("all_beta_values", all_beta_values, all_beta_values/counter_no_value)
print("differences", differences)

print(len(all_drugs), len(gdsc1_drugs), len(gdsc2_drugs), len(gdsc1_drugs)+len(gdsc2_drugs)-len(all_drugs))