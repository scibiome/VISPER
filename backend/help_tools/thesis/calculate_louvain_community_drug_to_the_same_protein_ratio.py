import statistics
######################################################################################################################################ä
# Help tool: Helps to calculate for louvain communities with many or few communities, how many drugs are associated with one protein. #
# data-format: community, number of drugs, number of drugs how are associated with the same protein                                   #
#######################################################################################################################################


data2 = [
    [0, 33, 22],
    [1, 10, 9],
    [2, 9, 9],
    [3, 36, 23],
    [4, 44, 18],
    [5, 5, 5],
    [6, 7, 4],
    [7, 3, 3],
    [8, 7, 3],
    [9, 30, 18],
    [10, 22, 11],
    [11, 25, 10],
    [12, 5, 5],
    [13, 19, 10],
    [14, 13, 10],
    [15, 23, 14],
    [16, 1, 1],
    [17, 6, 6]
]
data3 = [
    [0, 31, 23],
    [1, 4, 3],
    [2, 1, 1],
    [3, 4, 2],
    [4, 3, 3],
    [5, 2, 2],
    [6, 28, 16],
    [7, 40, 26],
    [8, 3, 3],
    [9, 9, 8],
    [10, 4, 3],
    [11, 7, 6],
    [12, 12, 10],
    [13, 46, 27],
    [14, 14, 13],
    [15, 41, 25],
    [16, 1, 1],
    [17, 34, 19],
    [18, 13, 12]
]

data = [
    [0, 56, 28],
    [1, 75, 37],
    [2, 133, 74],
    [3, 2, 2],
    [4, 1, 1],
    [5, 26, 14],
    [6, 2, 2],
    [7, 2, 2]
]
positions = [[] for _ in range(len(data[0]) - 1)]
ratios = []

# Collect values for each position and calculate ratios
for line in data:
    for i, value in enumerate(line[1:-1]): 
        positions[i].append(value)
    ratio = line[-1] / line[1]  
    ratios.append(ratio)
print("ratios: ", ratios)

# Calculate median and average for each position
for i, position_values in enumerate(positions):
    if position_values:
        median = statistics.median(position_values)
        average = sum(position_values) / len(position_values)
        print(f"Position {i+1}: Median = {median}, Average = {average}")
    else:
        print(f"Position {i+1}: No data available")

# Calculate median and average for ratios
if ratios:
    median_ratios = statistics.median(ratios)
    average_ratios = sum(ratios) / len(ratios)
    print(f"Ratios: Median = {median_ratios}, Average = {average_ratios}")
else:
    print("Ratios: No data available")

positions = [[] for _ in range(len(data[0]) - 1)]

# Collect values for each position
for line in data:
    for i, value in enumerate(line[1:]):
        positions[i].append(value)

# Calculate median and average for each position
for i, position_values in enumerate(positions):
    median = statistics.median(position_values)
    average = sum(position_values) / len(position_values)
    print(f"Position {i+1}: Median = {median}, Average = {average}")