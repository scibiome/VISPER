import pandas as pd

##############################################
# Research to Association in GDSC1 and GDSC2 #
##############################################

file_path = '2.csv'

df = pd.read_csv(file_path, sep=',')

number_of_gdsc1 = 0
number_of_gdsc2 = 0
y_id_values = df['y_id']

number_of_drug_ids_all = set()
number_of_drug_ids_gdsc1 = set()
number_of_drug_ids_gdsc2 = set()

number_of_drug_names_all = set()
number_of_drug_names_gdsc1 = set()
number_of_drug_names_gdsc2 = set()

drug_ids_per_name_gdsc1 = {}
drug_ids_per_name_gdsc2 = {}


drug_count_per_name_gdsc1 = {}
drug_count_per_name_gdsc2 = {}


x_ids_per_drug_id_gdsc1 = {}
x_ids_per_drug_id_gdsc2 = {}

for index, row in df.iterrows():
    y_id = row['y_id']
    split_name = y_id.split(";")
    drug_id = split_name[0]
    drug_name = split_name[1]
    dataset = split_name[2]
    x_id = row['x_id']

    if dataset == "GDSC1":
        number_of_gdsc1 += 1
        number_of_drug_ids_gdsc1.add(drug_id)
        number_of_drug_names_gdsc1.add(drug_name)

        if drug_name in drug_ids_per_name_gdsc1:
            drug_ids_per_name_gdsc1[drug_name].add(drug_id)
        else:
            drug_ids_per_name_gdsc1[drug_name] = {drug_id}

        if drug_id in x_ids_per_drug_id_gdsc1:
            x_ids_per_drug_id_gdsc1[drug_id].add(x_id)
        else:
            x_ids_per_drug_id_gdsc1[drug_id] = {x_id}

    elif dataset == "GDSC2":
        number_of_gdsc2 += 1
        number_of_drug_ids_gdsc2.add(drug_id)
        number_of_drug_names_gdsc2.add(drug_name)

        if drug_name in drug_ids_per_name_gdsc2:
            drug_ids_per_name_gdsc2[drug_name].add(drug_id)
        else:
            drug_ids_per_name_gdsc2[drug_name] = {drug_id}

        if drug_id in x_ids_per_drug_id_gdsc2:
            x_ids_per_drug_id_gdsc2[drug_id].add(x_id)
        else:
            x_ids_per_drug_id_gdsc2[drug_id] = {x_id}

    number_of_drug_ids_all.add(drug_id)
    number_of_drug_names_all.add(drug_name)

print("The dataset has", number_of_gdsc1, "GDSC1 rows")
print("The dataset has", number_of_gdsc2, "GDSC2 rows")
print("Equal", number_of_gdsc1 + number_of_gdsc2)
print("Drug ID count all", len(number_of_drug_ids_all), ", in GDSC1:", len(number_of_drug_ids_gdsc1),
      ", in GDSC2:", len(number_of_drug_ids_gdsc2),
      ", Intersection between GDSC1 and GDSC2:", len(number_of_drug_ids_gdsc1.intersection(number_of_drug_ids_gdsc2)))
print("Drug Names count all", len(number_of_drug_names_all), ", in GDSC1:", len(number_of_drug_names_gdsc1),
      ", in GDSC2:", len(number_of_drug_names_gdsc2),
      ", Intersection between GDSC1 and GDSC2:", len(number_of_drug_names_gdsc1.intersection(number_of_drug_names_gdsc2)))


drug_counts_gdsc1 = {}
for drug_name, drug_ids in drug_ids_per_name_gdsc1.items():
    num_drug_ids = len(drug_ids)
    if num_drug_ids in drug_counts_gdsc1:
        drug_counts_gdsc1[num_drug_ids] += 1
    else:
        drug_counts_gdsc1[num_drug_ids] = 1

print("\nGDSC1 Drug Name Statistics:")
for count, num_drug_names in drug_counts_gdsc1.items():
    print(f"{num_drug_names} drug_names in GDSC1 have {count} drug_ids")


drug_counts_gdsc2 = {}
for drug_name, drug_ids in drug_ids_per_name_gdsc2.items():
    num_drug_ids = len(drug_ids)
    if num_drug_ids in drug_counts_gdsc2:
        drug_counts_gdsc2[num_drug_ids] += 1
    else:
        drug_counts_gdsc2[num_drug_ids] = 1

print("\nGDSC2 Drug Name Statistics:")
for count, num_drug_names in drug_counts_gdsc2.items():
    print(f"{num_drug_names} drug_names in GDSC2 have {count} drug_ids")

