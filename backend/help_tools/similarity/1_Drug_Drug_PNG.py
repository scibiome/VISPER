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
#import umap #WARNING only working for 3.11

##################################################################
# Modified variant of 1_Drug_Drug to create plots for the thesis #
##################################################################

# this is calculating the community centers for a louvain group
"""
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
"""

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
    #count_zeros = np.count_nonzero(rounded_matrix == 0)
    
    # Count the number of values that are 100
    #count_hundreds = np.count_nonzero(rounded_matrix == 100)

    # Flatten the rounded matrix into a 1D array
    lower_triangular_matrix = np.tril(similarity_matrix, k=-1)
    lower_triangular_matrix2 = np.tril(similarity_matrix, k=-1)
    count_zeros = np.count_nonzero(lower_triangular_matrix == 0)
    count_100 = 0
    count_0 = 0
    total_values = []
    median_values = []
    print("length", len(similarity_matrix))
    for i in range(lower_triangular_matrix.shape[0]):
        for j in range(i):
            value = lower_triangular_matrix[i, j]
            total_values.append(value)  # Collect values for average calculation
            if value == 100:
                count_100 += 1
            elif value == 0:
                count_0 += 1

# Calculate average value and median
    average_value = np.mean(total_values)
    median_value = np.median(total_values)
    count_hundreds = np.count_nonzero(lower_triangular_matrix == 100)
    flattened_values = lower_triangular_matrix.flatten()
    flattened_values2 = lower_triangular_matrix.flatten()
    
    # Calculate the average of all values
    avg = np.mean(flattened_values2)
    
    # Calculate the median of all values
    median = np.median(flattened_values2)

    print("avg", average_value)
    print("median", median_value)
    print("1", count_0)
    print("100", count_100)
    print("length", len(similarity_matrix))
    """
    # Count the number of occurrences of each integer value
    value_counts = np.bincount(flattened_values)
    print()
    # Create a bar chart of the value counts
    plt.figure(figsize=(10, 6))
    plt.bar(range(len(value_counts)), value_counts, width=0.8)
    x_ticks = np.arange(0, len(value_counts), 10)
    x_labels = [str(x) for x in x_ticks]
    
    plt.xlabel('gerundete Kosinusähnlichkeit in Prozent')
    plt.ylabel('Anzahl')
    #plt.title('Value Counts')
    plt.xticks(x_ticks, x_labels)
    plt.ylim(0, 3000)

    plt.show()
    """

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
dataset_gdsc12 = df[df['y_id'].str.split(';').str[-1] == 'GDSC2'].copy()
dataset_gdsc2 = df[df['y_id'].str.split(';').str[-1] == 'GDSC1'].copy()

chembl_ids =[]
#dataset_gdsc1_backup = df[df['y_id'].str.split(';').str[-1] == 'GDSC1'].copy()
#dataset_gdsc2_backup = df[df['y_id'].str.split(';').str[-1] == 'GDSC2'].copy()
# Calculate min beta value for both datasets and adjust beta values
min_beta_gdsc1 = dataset_gdsc1['beta'].min()
min_beta_gdsc2 = dataset_gdsc12['beta'].min()
print(min_beta_gdsc1)
print(min_beta_gdsc2)


dataset_gdsc1['beta'] = dataset_gdsc1['beta'] - min_beta_gdsc1
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
node_targets_gdsc1 = get_targets_of_drugs(node_names_gdsc1, df)
node_targets_gdsc2 = get_targets_of_drugs(node_names_gdsc2, df)
similarity_matrix_gdsc1 = calculate_cosine_similarity(matrix_gdsc1)
similarity_matrix_gdsc2 = calculate_cosine_similarity(matrix_gdsc2)

#similarity_matrix_gdsc1 = calculate_jaccard(dataset_gdsc1_backup, node_names_gdsc1)
#similarity_matrix_gdsc2 = calculate_jaccard(dataset_gdsc2_backup)
new_s = np.abs(similarity_matrix_gdsc1 - similarity_matrix_gdsc2)
print(similarity_matrix_gdsc1[0])
print(type(similarity_matrix_gdsc1))
print(new_s[0])

calculate_avg_median_and_plot(similarity_matrix_gdsc1, node_names_gdsc1, node_targets_gdsc1, "GDSC1")
calculate_avg_median_and_plot(similarity_matrix_gdsc2, node_names_gdsc2, node_targets_gdsc2, "GDSC2")
calculate_avg_median_and_plot(new_s, node_names_gdsc1, node_targets_gdsc1, "GDSC1")



def visualize_tsne(similarity_matrix, title):
    tsne = TSNE(n_components=2, random_state=0, n_iter=500, n_iter_without_progress=150, perplexity=50)
    tsne_result = tsne.fit_transform(similarity_matrix)
    
    plt.figure(figsize=(8, 6))
    plt.scatter(tsne_result[:, 0], tsne_result[:, 1], alpha=0.5)
    plt.title(title)
    plt.xlabel('t-SNE Dimension 1')
    plt.ylabel('t-SNE Dimension 2')
    plt.show()

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


#print("communities1")
#print(communities1)
#print("")
#print("communities2")
#print(communities2)
# Visualize t-SNE for both datasets
#visualize_tsne(similarity_matrix_gdsc1, 't-SNE Visualization for GDSC1')
#plt.figure(figsize=(10, 8))
#plt.show()