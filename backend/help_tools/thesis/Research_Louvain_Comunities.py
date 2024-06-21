import networkx as nx
import numpy as np
from community import community_louvain
import pandas as pd
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt
from backend.help_tools.thesis.addMLtoNeo import updateDB2

#+###############################################
# Create Louvain Communities and give back size #
#################################################

# Step 1: Read the CSV file into a pandas DataFrame
csv_file = 'example/mmc6.csv'  # Replace with the actual CSV file path
df = pd.read_csv(csv_file, sep=';')
df['y_id'] = df['y_id'].str.split(';').str.get(1)
# Step 2: Extract unique 'x_id' and 'y_id' values
unique_nodes = set(df['x_id'].unique()).union(df['y_id'].unique())

# Step 3: Assign unique integer IDs to nodes
node_id_mapping = {node: idx for idx, node in enumerate(unique_nodes)}

# Step 4: Create a graph and add nodes
G = nx.Graph()

for node, node_id in node_id_mapping.items():
    G.add_node(node_id)  # You can add labels for reference

# Step 5: Add edges to the graph
for index, row in df.iterrows():
    source_node_id = node_id_mapping[row['x_id']]
    target_node_id = node_id_mapping[row['y_id']]
    #print(type(row['beta']))
    weight = abs(float(row['beta'].replace(",",".")))
    G.add_edge(source_node_id, target_node_id, weight=weight)

# Step 6: Detect communities using best_partition
communities = community_louvain.best_partition(G)

# Step 7: Calculate the number of communities and their sizes
num_communities = len(set(communities.values()))
community_sizes = {com: 0 for com in set(communities.values())}

for node_id, com in communities.items():
    community_sizes[com] += 1

# Step 8: Print the results
print("Number of communities:", num_communities)
print("Community sizes:")
for com, size in community_sizes.items():
    print(f"Community {com}: {size} nodes")

community_labels = list(communities.values())
num_nodes = G.number_of_nodes() 

node_communities = {node_id: com for node_id, com in communities.items()}

unique_communities = sorted(set(node_communities.values()))

one_hot_matrix = np.zeros((num_nodes, len(unique_communities)))

for node_id, com in node_communities.items():
    one_hot_matrix[node_id][unique_communities.index(com)] = 1

print("one_hot_matrix")
print(one_hot_matrix[0])
print(len(one_hot_matrix))
tsne = TSNE(n_components=2, learning_rate=500, init='random', random_state=42)
tsne_result = tsne.fit_transform(one_hot_matrix)
print(len(tsne_result))
print(tsne_result[0:1000])

node_names = list(node_id_mapping.keys())
node_ids = list(node_id_mapping.values())
tsne_x = tsne_result[:, 0]
tsne_y = tsne_result[:, 1]
community_labels = list(communities.values())
updateDB2(node_names, community_labels, tsne_x, tsne_y)
data = {
    'Node Name': node_names,
    'Community': community_labels,
    't-SNE X': tsne_x,
    't-SNE Y': tsne_y
}

df_result = pd.DataFrame(data)
df_result.to_csv('community_tsne_data.csv', index=False)

print(df_result.head())
plt.figure(figsize=(10, 8))
scatter = plt.scatter(tsne_result[:, 0], tsne_result[:, 1], c=community_labels, cmap='viridis', s=10)
plt.colorbar(scatter, label='Community')
plt.title('t-SNE Visualization of Communities (Based on One-Hot Encoding)')
plt.show()
