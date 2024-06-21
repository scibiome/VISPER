import pandas as pd
import numpy as np
import math
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize
from sklearn.manifold import TSNE
from sklearn.manifold import Isomap
import community
from community import community_louvain
import matplotlib.pyplot as plt
from neo4j import GraphDatabase
import networkx as nx
import random
import get_intersection_of_two_drugs
import umap #WARNING only working for 3.11
###########################################
# Create and save Drug-Drug similarity #
###########################################


# this is calculating the community centers for a louvain group
def calculate_community_centers(number):
    number_of_columns = 0
    distance_between_communities = 14
    start_positions = []
    if number > 0:
        number_of_columns = 1
    if number > 1:
        number_of_columns = 2
    if number > 4:
        number_of_columns = 3
    if number > 9:
        number_of_columns = 4
    if number > 16:
        number_of_columns = 5
    print("number_of_columns", number_of_columns, number)
    for x in range(number):
        community = x
        start_positions.append([(community % number_of_columns)*distance_between_communities +1 ,math.floor(community / number_of_columns) * distance_between_communities + 1]) # x and y start coordinate
    return start_positions


def calculate_figsize(all_positions, base_size=5):
    # Extract all x and y coordinates
    x_coords = [pos[1] for pos in all_positions]
    y_coords = [pos[2] for pos in all_positions]

    # Calculate ranges
    x_range = max(x_coords) - min(x_coords)
    y_range = max(y_coords) - min(y_coords)

    # Avoid division by zero
    if x_range == 0 or y_range == 0:
        return (base_size, base_size)

    # Calculate aspect ratio
    aspect_ratio = y_range / x_range

    # Adjust figure size based on aspect ratio
    if aspect_ratio > 1:
        figsize = (base_size / aspect_ratio, base_size)
    else:
        figsize = (base_size, base_size * aspect_ratio)

    return figsize


def plot_communities(all_positions):
    # Initialize plot
    figsize = calculate_figsize(all_positions)
    plt.figure(figsize=figsize)

    # Loop through all positions and plot each point
    for node_info in all_positions:
        node, x, y = node_info
        plt.scatter(x, y, label=f"Node {node}")
        plt.text(x, y, str(node), fontsize=9)

    # Set plot features
    plt.xlabel('X Coordinate')
    plt.ylabel('Y Coordinate')
    plt.title('Community Positions')
    #plt.legend()
    plt.grid(True)

    # Show plot
    plt.show()


# this is calculating the position of all louvain nodes
def calculate_community_positions(start_positions, num_communities, partition):
    all_positions = []
    ring_distance = 1
    ring_radius_spacing = 1
    print("start_positions", start_positions)
    for community in range(num_communities):
        community_nodes = [node for node in partition if partition[node] == community]
        center = start_positions[community]
        all_positions.append([community_nodes[0], center[0], center[1]])
        number_of_rings = 0
        ring_is_full = True
        number_of_used_ring_positions = 0
        number_of_ring_positions = 0
        circumference = 0
        counter = 0
        for node in range(1, len(community_nodes)):
            if ring_is_full:
                ring_is_full = False
                number_of_rings += 1
                circumference = 2*number_of_rings * math.pi * ring_distance
                number_of_ring_positions = math.floor(circumference / ring_radius_spacing)
                if number_of_ring_positions > (len(community_nodes) - node):
                    number_of_ring_positions = len(community_nodes) - node
                number_of_used_ring_positions = 0
                print("number_of_ring_positions", number_of_ring_positions)
            angle = 2 * math.pi * number_of_used_ring_positions / number_of_ring_positions
            x = center[0] + ring_distance * number_of_rings * math.cos(angle)
            y = center[1] + ring_distance * number_of_rings * math.sin(angle)
            if number_of_rings < 100:
                #counter += 1
                #print("counter", counter, number_of_ring_positions, number_of_used_ring_positions)
                all_positions.append([community_nodes[node], x ,y])
            number_of_used_ring_positions += 1
            
            # all positions are used in the ring
            if number_of_used_ring_positions == number_of_ring_positions:
                ring_is_full = True
        #break
    
    #plot_communities(all_positions)
    return np.array(all_positions)

def analyze_beta_values(dataset):
    # Step 1: Calculate median and average beta values
    median_beta = dataset['beta'].median()
    average_beta = dataset['beta'].mean()

    # Step 2: Prepare data for Box and Whisker plot
    box_plot_data = dataset['beta']

    # Step 3: Prepare data for the bar plot with rounded beta values
    rounded_betas = dataset['beta'].round(1)
    beta_counts = rounded_betas.value_counts().sort_index()

    # Create Box and Whisker plot
    plt.figure(figsize=(8, 6))
    plt.boxplot(box_plot_data, vert=False)
    plt.xlabel('Beta Values')
    plt.title('Box and Whisker Plot of Beta Values')
    plt.show()

    # Create data for the bar plot
    bar_plot_data = beta_counts.reset_index()
    bar_plot_data.columns = ['Beta Value', 'Count']

    return median_beta, average_beta, box_plot_data, bar_plot_data


def calculate_cosine_similarity(matrix):
    
    similarity_matrix = cosine_similarity(matrix)
    return similarity_matrix

def calculate_jaccard(matrix, node_names):
    collect_all_proteins = []
    for index, row in matrix.iterrows():
        protein_name = row['x_id']
        drug_name = row['y_id'].split(";")[0]
        b = False
        for c in collect_all_proteins:
            if c[0] == drug_name:
                c[1].add(protein_name)
                break
        else:
            collect_all_proteins.append([drug_name, set([protein_name])])
    #print(collect_all_proteins)
    node_names = [item.split(";")[0] for item in node_names]
    print(node_names)
    node_count = len(node_names)
    jaccard_matrix = [[0] * node_count for _ in range(node_count)]
    #print(jaccard_matrix)
    for x in range(node_count):
        for y in range(1):
            node_name1 = node_names[x]
            node_name2 = node_names[y]
            node_proteins1 = set()
            node_proteins2 = set()
            found1 = False
            found2 = False
            for pair in collect_all_proteins:
                if pair[0] == node_name1:
                    found1 = True
                    node_proteins1 = pair[1]
                if pair[0] == node_name2:
                    found2 = True
                    node_proteins2 = pair[1]
                if found1 and found2:
                    print("Great success")
                    break


            # calculate jaccard
            intersection_size = len(node_proteins1.intersection(node_proteins2))
            union_size = len(node_proteins1.union(node_proteins2))
            #print(node_proteins1, node_proteins2)
            if union_size == 0:
                jaccard_value = 0.0 
            else:
                jaccard_value = intersection_size / union_size
            jaccard_matrix[x][y] = jaccard_value
            jaccard_matrix[y][x] = jaccard_value
    print("###################################################################################################################################################################################")
    print(jaccard_matrix[0])



def calculate_avg_median_and_plot(similarity_matrix, names, targets, GDSC_name):
    # Round all values in the NumPy array to the nearest integer
    similarity_matrix = similarity_matrix * 100
    rounded_matrix = np.round(similarity_matrix).astype(int)
    count_zeros = np.count_nonzero(rounded_matrix == 0)
    
    # Count the number of values that are 100
    count_hundreds = np.count_nonzero(rounded_matrix == 100)

    #min2 = 0
    #max2 = min2 + 10
    #indices_hundreds = np.where((max2 > similarity_matrix) & (similarity_matrix >= min2))
    indices_hundreds_2 = np.where(similarity_matrix >= 80)
    for x, y in zip(indices_hundreds_2[0], indices_hundreds_2[1]):
        if x != y:
            if int(names[x]) > int(names[y]):
                similarity_value = similarity_matrix[x][y]  # Access the similarity value
                #print(f"Names: {names[x]}, {names[y]}, Similarity: {similarity_value}")
                result = get_intersection_of_two_drugs.getallValues(names[x], names[y], GDSC_name)
                drug_name1, drug_name2, num_proteins_drug1, num_proteins_drug2, num_intersection_proteins, drug_target1, drug_target2 = result
                print(names[x], names[y], similarity_value, drug_name1, drug_name2, num_proteins_drug1, num_proteins_drug2, num_intersection_proteins, drug_target1, drug_target2)


    # Create a list to store the x, y coordinates where x != y
    different_coordinates = []
    for i in range(0,10):
        min2 = i * 10
        max2 = min2 + 10
        if(max2 == 100):
            max2 = 101
        indices_hundreds = np.where((max2 > similarity_matrix) & (similarity_matrix >= min2))
    # Iterate through the indices and check if x != y in the original similarity matrix
        if len(indices_hundreds[0]) > 10:
            print("random")
            # Randomly select 5 different indices
            selected_indices = random.sample(range(len(indices_hundreds[0])), 5)

            # Create a list to store the x, y coordinates for the selected indices
            different_coordinates = []

            for index in selected_indices:
                x, y = indices_hundreds[0][index], indices_hundreds[1][index]

                similarity_value = similarity_matrix[x][y]  # Access the similarity value
                #print(f"Names: {names[x]}, {names[y]}, Similarity: {similarity_value}")
                result = get_intersection_of_two_drugs.getallValues(names[x], names[y], "GDSC2")
                drug_name1, drug_name2, num_proteins_drug1, num_proteins_drug2, num_intersection_proteins, drug_target1, drug_target2 = result
                print(names[x], names[y], similarity_value, drug_name1, drug_name2, num_proteins_drug1, num_proteins_drug2, num_intersection_proteins, drug_target1, drug_target2)

        else:   
            for x, y in zip(indices_hundreds[0], indices_hundreds[1]):
                if x != y:
                    if int(names[x]) > int(names[y]):
                        similarity_value = similarity_matrix[x][y]  # Access the similarity value
                        print(f"Names: {names[x]}, {names[y]}, Similarity: {similarity_value}")
        
    print(different_coordinates)
    # Flatten the rounded matrix into a 1D array
    flattened_values = rounded_matrix.flatten()
    flattened_values2 = similarity_matrix.flatten()
    
    # Calculate the average of all values
    avg = np.mean(flattened_values2)
    
    # Calculate the median of all values
    median = np.median(flattened_values2)

    print("avg", avg)
    print("median", median)
    print("1", count_zeros)
    print("100", count_hundreds)
    # Count the number of occurrences of each integer value
    value_counts = np.bincount(flattened_values)
    print()
    # Create a bar chart of the value counts
    plt.figure(figsize=(10, 6))
    plt.bar(range(len(value_counts)), value_counts, width=0.8)
    x_ticks = np.arange(0, len(value_counts), 10)
    x_labels = [str(x) for x in x_ticks]
    
    plt.xlabel('Integer Values')
    plt.ylabel('Count')
    plt.title('Value Counts')
    plt.xticks(x_ticks, x_labels)
    plt.ylim(0, 6000)

    plt.show()
    

    # Same targets
    data2 = []
    for i in range(0,10):
        print(i)
        min3 = i * 10
        max3 = min3 + 10
        if(max3 == 100):
            max3 = 101
        indices_all = np.where((max3 > similarity_matrix) & (similarity_matrix >= min3))
        counter2 = 0
        counter_has_no_targets = 0
        counter_has_targets = 0
        common_targets = 0
        for x, y in zip(indices_all[0], indices_all[1]):
            if x != y:
                if int(names[x]) > int(names[y]):
                    target1 = []
                    target2 = []
                    found_t1 = False
                    found_t2 = False
                    for t in targets:
                        if names[x] == t[0]:
                            target1 = t[1]
                            found_t1 = True
                        if names[y] == t[0]:
                            target2 = t[1]
                            found_t2 = True
                        if found_t2 and found_t1:
                            break
                    counter2 += 1
                    if len(target1)>0 and len(target2) > 0:
                        counter_has_targets += 1
                        intersection = list(set(target1) & set(target2))
                        if len(intersection) > 0:
                            common_targets += 1
                    else:
                        counter_has_no_targets += 1 
        print("counter2: ", counter2, " counter_has_no_targets: ", counter_has_no_targets, "   counter_has_targets :", counter_has_targets, "   common_targets: ", common_targets, "    results: ", round((common_targets / counter_has_targets) * 100, 2))
        data2.append(round((common_targets / counter_has_targets) * 100, 2))
    # Calculate the mean (middle line)
    mean_value = np.mean(data2)

    # Create a plot
    plt.figure(figsize=(8, 6))
    plt.plot(data2, label='Data')
    plt.axhline(mean_value, color='red', linestyle='--', label='Mean')
    plt.xlabel('X-Axis')
    plt.ylabel('Y-Axis')
    plt.title('Plot with Middle Line')
    plt.legend()
    plt.grid(True)

    # Show the plot
    plt.show()

def get_targets_of_drugs(node_names, df):
    list_of_targets = []
    for node_id in node_names:
        # Find the first row where 'y_id' matches 'node_id'
        target_row = df[df['y_id'].str.split(';').str[0] == node_id].iloc[0]
        target_value = []
        # Get the target value from the row
        if not pd.isna(target_row['target']): 
            #print(type(target_row['target']), target_row['target'])
            target_value = target_row['target'].split(";")  # Replace 'target_column_name' with the actual column name
        #print("Target",target_value)
        list_of_targets.append([node_id,target_value])
    return list_of_targets








# Step 1: Read the CSV file
file_path = '2.csv'  # Replace with your CSV file path
df = pd.read_csv(file_path)
uri = "bolt://localhost:7687"  # Replace with your Neo4j server's URI
username = "neo4j"             # Replace with your Neo4j username
password = "workwork"          # Replace with your Neo4j password
# Step 2: Extract a list of all unique x_id values
unique_x_id_values = df['x_id'].unique()

# Step 3: Create two datasets based on the third y_id value (GDSC1 or GDSC2)
dataset_gdsc1 = df[df['y_id'].str.split(';').str[-1] == 'GDSC1'].copy()
dataset_gdsc2 = df[df['y_id'].str.split(';').str[-1] == 'GDSC2'].copy()

chembl_ids =[]
#dataset_gdsc1_backup = df[df['y_id'].str.split(';').str[-1] == 'GDSC1'].copy()
#dataset_gdsc2_backup = df[df['y_id'].str.split(';').str[-1] == 'GDSC2'].copy()
# Calculate min beta value for both datasets and adjust beta values
min_beta_gdsc1 = dataset_gdsc1['beta'].min()
min_beta_gdsc2 = dataset_gdsc2['beta'].min()
print(min_beta_gdsc1)
print(min_beta_gdsc2)
data = np.random.randn(100)  # Random data for demonstration


dataset_gdsc1['beta'] = dataset_gdsc1['beta'] - min_beta_gdsc2
dataset_gdsc2['beta'] = dataset_gdsc2['beta'] - min_beta_gdsc2
dataset_gdsc2['y_id'] = dataset_gdsc2['y_id'].str.split(';').str[0]
dataset_gdsc1['y_id'] = dataset_gdsc1['y_id'].str.split(';').str[0]
#median_gdsc1, average_gdsc1, box_plot_data_gdsc1, bar_plot_data_gdsc1 = analyze_beta_values(dataset_gdsc1)
#print(f"Median Beta Value for GDSC1: {median_gdsc1}")
#print(f"Average Beta Value for GDSC1: {average_gdsc1}")
#print(bar_plot_data_gdsc1)
# Step 4: Create matrices for both datasets
def create_matrix(dataset):
    matrix = dataset.pivot(index='y_id', columns='x_id', values='beta').fillna(0)
    """
    one_value_mask = dataset.groupby('y_id')['beta'].transform('nunique') == 1

    # Create a mask for rows with only one value that is positive
    positive_one_value_mask = (one_value_mask) & (dataset['beta'] > 0)

    # Create a mask for rows with only one value that is negative
    negative_one_value_mask = (one_value_mask) & (dataset['beta'] < 0)

    # Count the number of rows that meet the conditions
    num_rows_one_value = one_value_mask.sum()
    num_rows_positive_one_value = positive_one_value_mask.sum()
    num_rows_negative_one_value = negative_one_value_mask.sum()

    print(f"Number of rows with only one value: {num_rows_one_value}")
    print(f"Number of rows with only one positive value: {num_rows_positive_one_value}")
    print(f"Number of rows with only one negative value: {num_rows_negative_one_value}")
    print("Beta values for rows with only one value:")
    print(dataset.loc[one_value_mask, 'beta'].unique())


    x_ids_positive = set(dataset.loc[positive_one_value_mask, 'x_id'].unique())
    print("x_id values for rows with only one positive value:")
    print(x_ids_positive)

    # Extract unique x_id values for rows with only one negative value
    x_ids_negative = set(dataset.loc[negative_one_value_mask, 'x_id'].unique())
    print("x_id values for rows with only one negative value:")
    print(x_ids_negative)

    # Find the intersection between x_id values for positive and negative rows
    intersection_x_ids = x_ids_positive.intersection(x_ids_negative)
    print("Intersection of x_id values between positive and negative rows:")
    print(intersection_x_ids)
    """
    return matrix

matrix_gdsc1 = create_matrix(dataset_gdsc1)
matrix_gdsc2 = create_matrix(dataset_gdsc2)
#matrix_gdsc2_list = matrix_gdsc2.values.tolist()
#matrix_gdsc2.to_csv('matrix_gdsc2.csv', index=True)

#print(matrix_gdsc1)
node_names_gdsc1 = matrix_gdsc1.index
positions = random.sample(range(len(node_names_gdsc1)), 10)

# Print the selected positions
# Access the values at the selected positions
selected_values = [node_names_gdsc1[i] for i in positions]
print("Values at selected positions:", selected_values)
node_names_gdsc2 = matrix_gdsc2.index
# Step 5: Calculate cosine similarity for both datasets
#node_targets_gdsc1 = get_targets_of_drugs(node_names_gdsc1, df)
#node_targets_gdsc2 = get_targets_of_drugs(node_names_gdsc2, df)
similarity_matrix_gdsc1 = calculate_cosine_similarity(matrix_gdsc1)
similarity_matrix_gdsc2 = calculate_cosine_similarity(matrix_gdsc2)

#similarity_matrix_gdsc1 = calculate_jaccard(dataset_gdsc1_backup, node_names_gdsc1)
#similarity_matrix_gdsc2 = calculate_jaccard(dataset_gdsc2_backup)

#calculate_avg_median_and_plot(similarity_matrix_gdsc1, node_names_gdsc1, node_targets_gdsc1, "GDSC1")
#calculate_avg_median_and_plot(similarity_matrix_gdsc2, node_names_gdsc2, node_targets_gdsc2, "GDSC2")
similarity_matrix_gdsc1 = np.array(similarity_matrix_gdsc1)
similarity_matrix_gdsc2 = np.array(similarity_matrix_gdsc2)
# Convert the NumPy array to a DataFrame
df_similarity_matrix_gdsc1 = pd.DataFrame(similarity_matrix_gdsc1, index=matrix_gdsc1.index.str.split(';').str[0], columns=matrix_gdsc1.index.str.split(';').str[0])
df_similarity_matrix_gdsc2 = pd.DataFrame(similarity_matrix_gdsc2, index=matrix_gdsc2.index.str.split(';').str[0], columns=matrix_gdsc2.index.str.split(';').str[0])
# Save the DataFrame to a CSV file
df_similarity_matrix_gdsc1.to_csv('cosine_similarity/similarity_matrix_gdsc11.csv')
df_similarity_matrix_gdsc2.to_csv('cosine_similarity/similarity_matrix_gdsc21.csv')



################################
# Create GDSC1 + GDSC2 Dataset #
################################
"""
unique_drugs = list(set(df_similarity_matrix_gdsc1.columns).union(set(df_similarity_matrix_gdsc2.columns)))
new_df = pd.DataFrame(0.0, index=unique_drugs, columns=unique_drugs)
save_all_differences = []
# Iterate through all elements of the new DataFrame
for drug1 in new_df.index:
    for drug2 in new_df.columns:
        if drug1 == drug2:
            # When the drugs are the same, set the value to 1
            new_df.at[drug1, drug2] = 1
        else:
            # Check if the combination exists in df_similarity_matrix_gdsc1
            if drug1 in df_similarity_matrix_gdsc1.index and drug2 in df_similarity_matrix_gdsc1.columns:
                value1 = df_similarity_matrix_gdsc1.at[drug1, drug2]
            else:
                value1 = 0

            # Check if the combination exists in df_similarity_matrix_gdsc2
            if drug1 in df_similarity_matrix_gdsc2.index and drug2 in df_similarity_matrix_gdsc2.columns:
                value2 = df_similarity_matrix_gdsc2.at[drug1, drug2]
            else:
                value2 = 0

            # Calculate the average value if both values are non-zero
            if value1 != 0 and value2 != 0:
                #print(drug1, drug2, value1, value2)
                new_df.at[drug1, drug2] = (value1 + value2) / 2
                value11 = float(value1)
                value21 = float(value2)
                absolute_difference = abs(value11 - value21)
                average = (value11 + value21) / 2
                relative_difference = absolute_difference / average
                save_all_differences.append(absolute_difference * 100)
            else:
                # Set the value to the non-zero value if only one dataset has the combination
                new_df.at[drug1, drug2] = max(value1, value2)
# Save the resulting DataFrame to a CSV file
#new_df.to_csv('cosine_similarity/similarity_matrix_all.csv')

sorted_values = sorted(save_all_differences)

# Calculate median
n = len(sorted_values)
if n % 2 == 0:
    median = (sorted_values[n//2 - 1] + sorted_values[n//2]) / 2
else:
    median = sorted_values[n//2]

# Calculate average
average = sum(sorted_values) / n
print("This are the differences between the GDSC1 and GDSC2 simiarities Median: ", median, "   , Average: ", average)
"""




# Use the combine method with the custom function
#all_result = pd.concat([df_similarity_matrix_gdsc1, df_similarity_matrix_gdsc2], axis=1).fillna(0)

# Fill remaining missing values with 0 if needed
#all_result = all_result.fillna(0)
#all_result.to_csv('cosine_similarity/similarity_matrix_all.csv')


#common_dataset = df_similarity_matrix_gdsc1.combine_first(df_similarity_matrix_gdsc2).fillna(0)

# Print or use the similarity matrices as needed
#print("Cosine Similarity Matrix for GDSC1:")
#print(len(similarity_matrix_gdsc1[0]))

#print("\nCosine Similarity Matrix for GDSC2:")
#print(similarity_matrix_gdsc2)


#########################################################################
# Create Graphs G1 and G2 for Louvain                                   #
#########################################################################

# create undirected graph
G1 = nx.Graph() #GDSC1
G2 = nx.Graph() #GDSC2

# add nodes to graph
for node_id in df_similarity_matrix_gdsc1.columns:
    #print("G1", node_id)
    G1.add_node(node_id)
    if node_id == "1001":
        print("success 1")
for node_id in df_similarity_matrix_gdsc2.columns:
    #print("G1", node_id)
    G2.add_node(node_id)

# add edges to graph
for i in range(len(similarity_matrix_gdsc1)):
    for j in range(i+1, len(similarity_matrix_gdsc1)):
        drug1 = df_similarity_matrix_gdsc1.index[i]
        drug2 = df_similarity_matrix_gdsc1.columns[j]
        weight = similarity_matrix_gdsc1[i][j]
        #if drug1 == "1001" or drug2 == "1001":
        #    print("success")
        G1.add_edge(drug1, drug2, weight=weight)

for i in range(len(similarity_matrix_gdsc2)):
    for j in range(i+1, len(similarity_matrix_gdsc2)):
        drug1 = df_similarity_matrix_gdsc2.index[i]
        drug2 = df_similarity_matrix_gdsc2.columns[j]
        weight = similarity_matrix_gdsc2[i][j]
        G2.add_edge(drug1, drug2, weight=weight)


########################
# Calculate values     #
########################
#tsne_result_gdsc1 = TSNE(n_components=2, random_state=0, n_iter=1000, n_iter_without_progress=300, perplexity=30).fit_transform(similarity_matrix_gdsc1)
#tsne_result_gdsc2 = TSNE(n_components=2, random_state=0, n_iter=1000, n_iter_without_progress=300, perplexity=30).fit_transform(similarity_matrix_gdsc2)
#isomap_result_gdsc1 = Isomap(n_components=2, n_neighbors=30).fit_transform(similarity_matrix_gdsc1)
#isomap_result_gdsc2 = Isomap(n_components=2, n_neighbors=30).fit_transform(similarity_matrix_gdsc2)
umap_result_gdsc1 = umap.UMAP(n_components=2, random_state=0, n_neighbors=30, min_dist=0.1).fit_transform(similarity_matrix_gdsc1)
umap_result_gdsc2 = umap.UMAP(n_components=2, random_state=0, n_neighbors=30, min_dist=0.1).fit_transform(similarity_matrix_gdsc2)
#communities1 = community_louvain.best_partition(G1)
#communities2 = community_louvain.best_partition(G2)

seed = 123
max_communities = 30
min_communities = 10
communities1_1 = None
communities2_2 = None
resolution = 1.5

while (communities1_1 is None or len(communities1_1) > max_communities) or (communities2_2 is None or len(communities2_2) > max_communities):
    # Generate Louvain communities for G1
    louvain_communities1_1 = list(nx.community.louvain_communities(G1, seed=seed, resolution=resolution))
    
    # Generate Louvain communities for G2
    louvain_communities2_2 = list(nx.community.louvain_communities(G2, seed=seed, resolution=resolution))
    
    # Update the seed for the next iteration
    seed += 1
    print("Turns: ", seed)
    if len(louvain_communities1_1) <= max_communities and len(louvain_communities1_1) >= min_communities:
        communities1_1 = louvain_communities1_1
    if len(louvain_communities2_2) <= max_communities and len(louvain_communities2_2) >= min_communities :
        communities2_2 = louvain_communities2_2
print("seed", seed)

communities1 = {}
communities2 = {}

for community_id, community in enumerate(communities1_1):
    for node_id in community:
        communities1[node_id] = community_id

for community_id, community in enumerate(communities2_2):
    for node_id in community:
        communities2[node_id] = community_id


#print("communities1", communities1)

###############################################
# Position Louvain comunities                 #
###############################################

# set communities middle point
num_communities1 = max(communities1.values()) + 1
community_centers1 = calculate_community_centers(num_communities1)
community_node_positions1 = calculate_community_positions(community_centers1, num_communities1, communities1)


num_communities2= max(communities2.values()) + 1
community_centers2 = calculate_community_centers(num_communities2)
community_node_positions2 = calculate_community_positions(community_centers2, num_communities2, communities2)







def visualize_tsne(similarity_matrix, title):
    tsne = TSNE(n_components=2, random_state=0, n_iter=500, n_iter_without_progress=150, perplexity=50)
    tsne_result = tsne.fit_transform(similarity_matrix)
    
    plt.figure(figsize=(8, 6))
    plt.scatter(tsne_result[:, 0], tsne_result[:, 1], alpha=0.5)
    plt.title(title)
    plt.xlabel('t-SNE Dimension 1')
    plt.ylabel('t-SNE Dimension 2')
    plt.show()








#print(len(tsne_result_gdsc1))

def writeDB(tx, node_names, tsne_x, tsne_y, gdsc, methode):
    counter = 0
    for node_name, x, y in zip(node_names, tsne_x, tsne_y):
        # Extract the drug_id from the node_name
        drug_id = node_name.split(';')[0]
        query = f"""
        MATCH (n:Drug {{drug_id: "{drug_id}"}})
        SET n.drug_drug_{gdsc}_{methode} = 1
        SET n.drug_drug_{gdsc}_{methode}_x = {x}
        SET n.drug_drug_{gdsc}_{methode}_y = {y}
        """
        #print(query)
        tx.run(query)
        counter += 1
        print(drug_id, counter)


def writeDB2(tx, node_names, tsne_x, tsne_y, chembl_ids):
    counter = 0
    for node_name, x, y in zip(node_names, tsne_x, tsne_y):
        # Extract the drug_id from the node_name
        drug_id = node_name.split(';')[0]
        color = 'grey'  # Default color for drugs without CD/NCD values

        # Find the corresponding chembl_id based on drug_id
        matching_chembl_id = None
        for chembl_id in chembl_ids:
            if chembl_id[0] == drug_id:
                matching_chembl_id = chembl_id
                break

        if matching_chembl_id:
            if matching_chembl_id[2] == 1:  # Check if it has CD value
                color = 'red'
            elif matching_chembl_id[1] == 1:  # Check if it has NCD value
                color = 'blue'

        plt.scatter(x, y, color=color)  # Scatter plot with specified color
        plt.annotate(drug_id, (x, y), textcoords="offset points", xytext=(0, 10), ha='center')  # Add drug_id as annotation
        counter += 1
        print(counter)


def getList(tx):
    chembl_ids_query = """
    MATCH (d:Drug)
    RETURN d.drug_id AS id, d.Candidate AS NCD, d.cancer_drug AS CD
    """
    chembl_ids_result = tx.run(chembl_ids_query)
    chembl_ids = [[record["id"],record["NCD"],record["CD"]]  for record in chembl_ids_result]
    return chembl_ids


def writeDBCom(tx, com, gdsc, methode):
    counter = 0
    for key, value in com.items():
        # Extract the drug_id from the node_name
        drug_id = key
        query = f"""
        MATCH (n:Drug {{drug_id: "{drug_id}"}})
        SET n.drug_drug_{gdsc}_{methode} = {value}
        """
        #print(query)
        tx.run(query)
        counter += 1
        print(drug_id, counter)


def updateDB2(node_names, tsne_x, tsne_y, gdsc, methode):
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            #chembl_ids = session.write_transaction(getList)  # Retrieve chembl_ids
            #session.write_transaction(writeDB2, node_names=node_names, tsne_x=tsne_x, tsne_y=tsne_y, chembl_ids=chembl_ids)
            session.write_transaction(writeDB, node_names=node_names, tsne_x=tsne_x, tsne_y=tsne_y, gdsc=gdsc, methode=methode)


def updateDBCommunity( gdsc, methode, com):
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            #chembl_ids = session.write_transaction(getList)  # Retrieve chembl_ids
            #session.write_transaction(writeDB2, node_names=node_names, tsne_x=tsne_x, tsne_y=tsne_y, chembl_ids=chembl_ids)
            session.write_transaction(writeDBCom, com=com, gdsc=gdsc, methode=methode)




#updateDB2(node_names_gdsc1, tsne_result_gdsc1[:, 0], tsne_result_gdsc1[:, 1], "GDSC1", "cosine_tsne_global")
#updateDB2(node_names_gdsc2, tsne_result_gdsc2[:, 0], tsne_result_gdsc2[:, 1], "GDSC2", "cosine_tsne_global")
#print(np.array(node_names_gdsc1).tolist())
#updateDB2(node_names_gdsc1, isomap_result_gdsc1[:, 0]*5, isomap_result_gdsc1[:, 1]*5, "GDSC1", "cosine_isomap_global")
#updateDB2(node_names_gdsc2, isomap_result_gdsc2[:, 0]*5, isomap_result_gdsc2[:, 1]*5, "GDSC2", "cosine_isomap_global")
#print(community_node_positions1[:,0])
#updateDB2(community_node_positions1[:,0], community_node_positions1[:,1], community_node_positions1[:,2], "GDSC1", "cosine_louvain")
#updateDB2(community_node_positions2[:,0], community_node_positions2[:,1], community_node_positions2[:,2], "GDSC2", "cosine_louvain")
#updateDBCommunity("GDSC1",  "cosine_louvains", communities1)
#updateDBCommunity("GDSC2",  "cosine_louvain", communities2)
#updateDB2(community_node_positions1[:,0], community_node_positions1[:,1], community_node_positions1[:,2], "GDSC1", "cosine_louvain_more_communities")
#updateDB2(community_node_positions2[:,0], community_node_positions2[:,1], community_node_positions2[:,2], "GDSC2", "cosine_louvain_more_communities")

updateDB2(node_names_gdsc1, umap_result_gdsc1[:,0]*5, umap_result_gdsc1[:,1]*5, "GDSC1", "cosine_umap_global")
updateDB2(node_names_gdsc2, umap_result_gdsc2[:,0]*5, umap_result_gdsc2[:,1]*5, "GDSC2", "cosine_umap_global")

#updateDBCommunity("GDSC1",  "cosine_louvain_more_communities", communities1)
#updateDBCommunity("GDSC2",  "cosine_louvain_more_communities", communities2)
#print("communities1")
#print(communities1)
#print("")
#print("communities2")
#print(communities2)
# Visualize t-SNE for both datasets
#visualize_tsne(similarity_matrix_gdsc1, 't-SNE Visualization for GDSC1')
#plt.figure(figsize=(10, 8))
#plt.show()