import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

########################################################################################################################################
# This function is used to research the differences between the calculated drug similarity, for drug pairs that are in GDSC1 and GDSC2 #
########################################################################################################################################

similarity_all = pd.read_csv("similarity_matrix_all.csv", index_col=0, dtype=str)
similarity_gdsc1 = pd.read_csv("similarity_matrix_gdsc1.csv", index_col=0, dtype=str)
similarity_gdsc2 = pd.read_csv("similarity_matrix_gdsc2.csv", index_col=0, dtype=str)
counter = 0
all_differences = []
f = False
for drug1, row in similarity_all.iterrows():
    for drug2, similarity_value in row.items():
        similarity_value_num = float(similarity_value)
        if similarity_value_num == 1.0:
            break
        for sim in [similarity_gdsc1, similarity_gdsc2]:
            drug1 = np.int64(drug1)
            drug2 = np.int64(drug2)
            if drug1 in similarity_gdsc1.index and drug2 in similarity_gdsc1.index and drug1 in similarity_gdsc2.index and drug2 in similarity_gdsc2.index:
                position1 = similarity_gdsc1.index.get_loc(drug1)
                position2 = similarity_gdsc1.index.get_loc(drug2)
                similarity_value2 = similarity_gdsc1.iloc[position1, position2]
                similarity_value2_num = float(similarity_value2)

                position12 = similarity_gdsc2.index.get_loc(drug1)
                position22 = similarity_gdsc2.index.get_loc(drug2)
                similarity_value22 = similarity_gdsc1.iloc[position12, position22]
                similarity_value22_num = float(similarity_value22)
                print(similarity_value2_num)
                if similarity_value2_num != 0.0 and similarity_value_num != 0.0 and similarity_value22_num != 0.0:
                    counter += 1
                    print(counter)
                    all_differences.append(abs(similarity_value2_num - similarity_value_num))
                    all_differences.append(abs(similarity_value22_num - similarity_value_num))
                    start_break = True

 

print("all_differences")
print(all_differences)
multiplied_counters = [int(counter * 100) for counter in all_differences]

median_value = np.median(multiplied_counters)

plt.hist(multiplied_counters, bins=range(101), edgecolor='k', alpha=0.7)


plt.xlabel('Values (0 to 100)')
plt.ylabel('Frequency')
plt.title('Histogram of Multiplied Counters')
plt.grid(True)
plt.axvline(median_value, color='red', linestyle='dashed', linewidth=2, label=f'Median: {median_value}')

plt.legend()
plt.show()