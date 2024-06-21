import xml.etree.ElementTree as etree
import os
import pandas as pd
from tqdm import tqdm

# change the root folder
PATH_DRUG_BANK_XML = "C:/Users/pc/Desktop/Masterarbeit/code-masterarbeit/backend/helper/drugbank/"
FILENAME_DB = "full_database.xml"
ENCODING = "utf-8"


def strip_tag_name(t):
    t = elem.tag
    idx = t.rfind("}")
    if idx != -1:
        t = t[idx + 1 :]
    return t


pathDbXML = os.path.join(PATH_DRUG_BANK_XML, FILENAME_DB)
inside_drug = False
drug_list = []
drug = {}
drugs_parsed = 0
n = 37069583 # change it by getting the total number of lines in XML file

for event, elem in tqdm(etree.iterparse(pathDbXML, events=("start", "end")), total = n):
    tname = strip_tag_name(elem.tag)
    text = None

    if elem.text:
        text = elem.text.strip()

    if event == "start" and tname == "drug":
        inside_drug = True
        drugs_parsed += 1
        for k, v in elem.attrib.items():
            drug[k.strip()] = v
    elif event == "end" and tname == "drug":
        inside_drug = False
        drug_list.append(drug)
        drug = {}

    if inside_drug and text not in [None, '', '\n']:
        drug[tname] = text

    # clear elements from memory as soon as we don't need them anymore
    elem.clear()

df = pd.DataFrame(drug_list)
data = df.drop(df.columns[df.isna().sum() >= 0.9 * df.shape[0]], axis=1)
data.drop(data[data['name'].isna()].index, axis = 0, inplace = True)
data.drop_duplicates(inplace = True)
data.to_csv("C:/Users/pc/Desktop/Masterarbeit/code-masterarbeit/backend/helper/drugbank/drugbank.csv", encoding=ENCODING, index=False)
print(data.shape[0], "drugs parsed from drugbank.xml")