import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from scipy.stats import ttest_ind
from sklearn.metrics import r2_score
from scipy.stats import pearsonr, spearmanr
import plotly.express as px
import plotly.graph_objects as go
import matplotlib.patches as mpatches
from scipy.stats import ttest_ind, ttest_1samp, ttest_rel
import matplotlib as mpl
import umap
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from joblib import Parallel, delayed
from tqdm.notebook import tqdm
import pickle
import matplotlib.ticker as mtick
import math
from itertools import combinations
import random
from sklearn.linear_model import LinearRegression
from qgrid import show_grid
from adjustText import adjust_text
# from crispy.Utils import Utils
plt.rcParams['font.family'] = 'Arial'
# plt.rcParams["axes.labelweight"] = "bold"
plt.rcParams['font.size'] = 18
# plt.rcParams['axes.linewidth'] = 2
plt.rcParams['figure.figsize'] = (10.0, 7.0)
plt.rcParams['pdf.fonttype'] = 42
plt.rcParams['ps.fonttype'] = 42
sns.set_palette("Dark2")
plt.rcParams['figure.dpi'] = 200


####################################################################
cancer_colours = {
    'Non-Small Cell Lung Carcinoma': '#007fff',
    'Prostate Carcinoma': '#665d1e',
    'Gastric Carcinoma': '#ffbf00',
    'Glioblastoma': '#fbceb1',
    'Melanoma': '#ff033e',
    'Bladder Carcinoma': '#ab274f',
    'B-Lymphoblastic Leukemia': '#d5e6f7',
    'Kidney Carcinoma': '#7cb9e8',
    'Thyroid Gland Carcinoma': '#efdecd',
    'Rhabdomyosarcoma': '#8db600',
    'Head and Neck Carcinoma': '#e9d66b',
    'Ovarian Carcinoma': '#b284be',
    "B-Cell Non-Hodgkin's Lymphoma": '#b2beb5',
    'Other Solid Carcinomas': '#10b36f',
    "Ewing's Sarcoma": '#6e7f80',
    'T-Lymphoblastic Leukemia': '#ff7e00',
    'Plasma Cell Myeloma': '#87a96b',
    'Endometrial Carcinoma': '#c9ffe5',
    'Non-Cancerous': '#9f2b68',
    'Breast Carcinoma': '#00ffff',
    'Pancreatic Carcinoma': '#008000',
    'Neuroblastoma': '#cd9575',
    "Burkitt's Lymphoma": '#72a0c1',
    'Hairy Cell Leukemia': '#a32638',
    'Chronic Myelogenous Leukemia': '#9966cc',
    'Glioma': '#f19cbb',
    'Cervical Carcinoma': '#e32636',
    'Colorectal Carcinoma': '#3b7a57',
    'Hepatocellular Carcinoma': '#faebd7',
    'Vulvar carcinoma': '#fdee00',
    'Osteosarcoma': '#00308f',
    'Chondrosarcoma': '#7fffd4',
    'Small Cell Lung Carcinoma': '#c46210',
    'Esophageal Carcinoma': '#a8bb19',
    'Uncertain': '#ff9966',
    "T-Cell Non-Hodgkin's Lymphoma": '#a52a2a',
    'Non-small Cell Lung Carcinoma': '#568203',
    'Other Sarcomas': '#4b5320',
    'Biliary Tract Carcinoma': '#5d8aa8',
    'Acute Myeloid Leukemia': '#8f9779',
    "Hodgkin's Lymphoma": '#915c83',
    'Mesothelioma': '#841b2d',
    'B-Lymphoblastic leukemia': '#a4c639',
    'Other Blood Cancers': '#3b444b',
    'Carcinoid Tumour': '#006600',
    'Leiomyosarcoma': '#0000ff',
    "T-cell Non-Hodgkin's Lymphoma": '#666699',
    'T-Lymphoblastic Lymphoma': '#996666'
}

tissue_colours = {
    'Lung': '#007fff',
    'Prostate': '#665d1e',
    'Stomach': '#ffbf00',
    'Central Nervous System': '#fbceb1',
    'Skin': '#ff033e',
    'Bladder': '#ab274f',
    'Haematopoietic and Lymphoid': '#d5e6f7',
    'Kidney': '#7cb9e8',
    'Thyroid': '#efdecd',
    'Soft Tissue': '#8db600',
    'Head and Neck': '#e9d66b',
    'Ovary': '#b284be',
    'Bone': '#b2beb5',
    'Endometrium': '#10b36f',
    'Breast': '#6e7f80',
    'Pancreas': '#ff7e00',
    'Peripheral Nervous System': '#87a96b',
    'Cervix': '#c9ffe5',
    'Large Intestine': '#9f2b68',
    'Liver': '#00ffff',
    'Vulva': '#008000',
    'Esophagus': '#cd9575',
    'Biliary Tract': '#72a0c1',
    'Other tissue': '#a32638',
    'Small Intestine': '#9966cc',
    'Placenta': '#f19cbb',
    'Testis': '#e32636',
    'Adrenal Gland': '#3b7a57'
}

instrument_colours = {
    'M01': '#66c2a5',
    'M02': '#fc8d62',
    'M03': '#8da0cb',
    'M04': '#e78ac3',
    'M05': '#a6d854',
    'M06': '#ffd92f'
}

batch_colours = {
    'P02': '#beaed4',
    'P03': '#fdc086',
    'P04': '#386cb0',
    'P05': '#f0027f',
    'P06': '#bf5b17'
}

tissue_colours['Other'] = 'white'
cancer_colours['Other'] = 'white'





































# from crispy.CrispyPlot import CrispyPlot

sns.set(style="ticks", context="paper", font_scale=1, font="Arial")
sns.set_context("paper",
                rc={
                    "axes.linewidth": 0.5,
                    'xtick.major.size': 2,
                    'xtick.major.width': 0.25,
                    'ytick.major.size': 2,
                    'ytick.major.width': 0.25,
                    'xtick.labelsize': 6,
                    'ytick.labelsize': 6,
                    'axes.labelsize': 7
                })
seed = 42
name_map_df = pd.read_csv(f"../../data/misc/uniprot_human_idmap.tab.gz",
                       sep='\t')
name_map_dict = name_map_df.set_index("Entry name").to_dict()['Gene names  (primary )']
protein2rna_map = name_map_dict
rna2protein_map = name_map_df.set_index("Gene names  (primary )").to_dict()['Entry name']















tissue_type_map = meta.set_index('Cell_line')[['Tissue_type']].to_dict()['Tissue_type']


#######################################################################################
pca = PCA(n_components=50, random_state=seed)
reducer = umap.UMAP(random_state=seed)

pca_prot = pca.fit_transform(protein_working.fillna(-2.743351))

embedding_prot = reducer.fit_transform(pca_prot)

df_umap = pd.DataFrame({
    'UMAP_1': embedding_prot[:, 0],
    'UMAP_2': embedding_prot[:, 1]
}, index=protein_working.index)

df_umap['Tissue'] = df_umap.index.map(tissue_type_map)
#df_umap['Cancer'] = df_umap.index.map(cancer_type_map)
#df_umap['Batch'] = df_umap.index.map(batch_map)
#df_umap['Instrument'] = df_umap.index.map(instrument_map)


##################################################################################
fig = plt.figure(figsize=(3.5, 2.7))
sns.scatterplot(x='UMAP_1',
                y='UMAP_2',
                hue='Tissue',
                hue_order=sorted(list(df_umap['Tissue'].unique())),
                data=df_umap,
                palette=tissue_colours,
                legend='full',
                edgecolor='black',
                s=5,
                linewidth=0.2)
plt.legend(bbox_to_anchor=(1.02, 1),
           loc=2,
           borderaxespad=0.,
           prop={'size': 4},
           markerscale=0.6)
plt.title("UMAP by tissue types")
plt.gcf().subplots_adjust(right=0.7)
plt.tight_layout()

plt.savefig("umap_pca_umap_all.pdf", dpi=500)