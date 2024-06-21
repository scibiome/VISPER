from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.responses import FileResponse
from neo4j import GraphDatabase
import warnings
import xml.etree.ElementTree as ET
import networkx as nx
import random
import os
import string
import pandas as pd
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
import json
import io
import csv
import pickle
import threading
import file_converter

#############################
# FastAPI Server for VISPER #
#############################

app = FastAPI()

uri = os.getenv("NEO4J_URI")
username = os.getenv("NEO4J_USER")
password = os.getenv("NEO4J_PASSWORD")

class LoginCredentials(BaseModel):
    username: str
    password: str


# active admin cookies
cookies = []

# generate a random string with a defined length
def generate_random_string(length):
    letters_and_digits = string.ascii_letters + string.digits
    return ''.join(random.choice(letters_and_digits) for _ in range(length))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# checks admin login credentials
@app.post("/login")
async def login(credentials: LoginCredentials):
    if credentials.username == "admin" and credentials.password == "admin":
        generate_string = generate_random_string(20)
        cookies.append(generate_string)
        return {"message": "Login successful!", "cookie": generate_string}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

# save uploaded file and return extracted column information 
@app.post("/uploadfile/")
async def upload_file(file: UploadFile = File(...), worksheetName: str = Form(...), uploadedFileName: str = Form(...)):
    file_extension = file.filename.split(".")[-1]

    # set folder where file should be stored
    if file_extension in {"csv", "tsv", "graphml", "xlsx"}:
        folder = "data"
    elif file_extension == "md":
        folder = "data_info"
    else:
        return JSONResponse(content={"error": "Unsupported file type"}, status_code=400)

    # Generate a random filename
    new_filename = str(random.randint(10**9, 10**10 - 1)) + \
        "." + file_extension
    if file_extension == "md":
        new_filename = uploadedFileName.split(".")[0]+"." + file_extension
    # Create the folder if it doesn't exist
    if not os.path.exists(folder):
        os.makedirs(folder)

    # Build the complete file path
    file_path = os.path.join(folder, new_filename)
    # Save the file in the folder
    with open(file_path, "wb") as f:
        f.write(file.file.read())
        column_names = []

    # csv and tsv

    if file_extension == "csv":
        separators = [',', ';']
        for separator in separators:
            try:
                csv_file = pd.read_csv(file_path, sep=separator)
                column_names = csv_file.columns.tolist()
                if not ";" in column_names[0]:
                    break  # Break the loop if successful
            except pd.errors.ParserError:
                continue  # Try the next separator

    if file_extension == "tsv":
        separator = '\t'
        try:
            csv_file = pd.read_csv(file_path, sep=separator)
            column_names = csv_file.columns.tolist()
        except Exception as e:
            return JSONResponse(content={"error": "Error reading file or getting column names"}, status_code=500)

    # graphml
    warnings.filterwarnings("ignore", category=UserWarning)
    if file_extension in {"graphml"}:
        graph = nx.read_graphml(file_path)

        # Extract node attributes
        node_labels = []
        node_attributes = []
        for node_id, attributes in graph.nodes(data=True):
            if node_labels == [] or not attributes['label'] in node_labels:
                node_labels.append(attributes['label'])
                node_attributes.append(
                    [attributes['label'], list(attributes.keys())])
            else:
                for i in node_attributes:
                    if i[0] == attributes['label']:
                        i[1] = list(set(list(attributes.keys()) + i[1]))
                        break

        for j in node_attributes:
            j[1] = [x for x in j[1] if x != 'label']

        edge_labels = []
        edge_attributes = []
        for source, target, attributes in graph.edges(data=True):
            if edge_labels == [] or not attributes['label'] in edge_labels:
                source_label = ""
                target_label = ""
                for node_id, attributes_n in graph.nodes(data=True):
                    if node_id == source:
                        source_label = attributes_n['label']
                    if node_id == target:
                        target_label = attributes_n['label']
                    if source_label != "" and target_label != "":
                        break
                edge_labels.append(attributes['label'])
                edge_attributes.append(
                    [attributes['label'], [source_label, target_label], list(attributes.keys())])
            else:
                for i in edge_attributes:
                    if i[0] == attributes['label']:
                        i[2] = list(set(list(attributes.keys()) + i[2]))
                        break

        for j in edge_attributes:
            j[2] = [x for x in j[2] if x != 'label']
        column_names = [node_attributes, edge_attributes]
        column_sring = str(column_names).replace(":", "")
        column_names = eval(column_sring)

    if file_extension == "xlsx":
        excel_file = pd.read_excel(file_path, sheet_name=worksheetName)
        column_names = excel_file.columns.tolist()

    return {"message": new_filename, "column_names": column_names}


class DataItem(BaseModel):
    data: list
    name: str

#save seetings file
@app.post("/uploadSettings/")
async def upload_data(data_item: DataItem):
    get_file_name = data_item.name
    # if(data_item.name[-5:] == ".xlsx"):
    #    get_file_name = data_item.name[:-5]+".csv"
    file_path = 'settings/'+get_file_name+".json"
    with open(file_path, 'w') as file:
        json.dump(data_item.data, file)
    return {"message": "Data received successfully"}


class DataItem2(BaseModel):
    projectID: str
    projectName: str
    projectNodeInformation: list
    projectEdge: list
    projectWorksheet: str
    projectcookie: str

# starts integration of uploaded file to the database
@app.post("/startAnalysis/")
async def upload_data(data_item: DataItem2):
    if data_item.projectcookie in cookies:
        file_path = 'database.json'
        file_path2 = 'datasets.json'
        md_content = ""
        print(data_item.projectID)
        print(data_item.projectName)
        print(data_item.projectNodeInformation)
        print(data_item.projectEdge)
        projectEdges = data_item.projectEdge
        projectNodeInformations = data_item.projectNodeInformation
        if len(data_item.projectEdge) == 0 and len(data_item.projectNodeInformation) == 0:
            with open("settings/"+data_item.projectID+".json", 'r') as file:
                settings_list = json.load(file)
                for i in settings_list:
                    print(i['selectedType'])
                    if "information" in i['selectedType']:
                        print(i['selectedType'][0:-12])
                        projectNodeInformations.append(
                            i['selectedType'][0:-12])
                    if "association" in i['selectedType']:
                        print(i['selectedType'][0:-12])
                        projectEdges.append(i['selectedType'][0:-12])

        loaded_list = []
        with open(file_path, 'r') as file:
            loaded_list = json.load(file)
        status = 0
        if os.path.exists('data_info/'+data_item.projectID.split(".")[0]+'.md'):
            with open('data_info/'+data_item.projectID.split(".")[0]+'.md', 'r') as file:
                md_content = file.read()
        loaded_list.append([data_item.projectName, data_item.projectID, data_item.projectNodeInformation, list(
            set(data_item.projectEdge)), status, md_content])
        with open(file_path, 'w') as file:
            json.dump(loaded_list, file)

        # Advanced search list
        loaded_list = []
        with open(file_path2, 'r') as file2:
            loaded_list = json.load(file2)
        loaded_list.append(
            [data_item.projectName, "project_id_"+data_item.projectID.split(".")[0], 'true'])
        with open(file_path2, 'w') as file2:
            json.dump(loaded_list, file2)

        background_thread = threading.Thread(target=file_converter.getFile, args=(
            data_item.projectID, data_item.projectWorksheet, data_item.projectName))
        background_thread.start()
        return {"message": "Data received successfully"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

# check for uploaded xlsx file included workheets
@app.post("/getWorksheets/")
async def get_Worksheets(file: UploadFile):
    # Read the XLSX file into a pandas ExcelFile object
    xlsx_data = await file.read()
    xls = pd.ExcelFile(io.BytesIO(xlsx_data))

    # Get the names of all worksheets in the XLSX file
    worksheet_names = xls.sheet_names

    return {"worksheets": worksheet_names}

# get example file for download process
@app.get("/download/{filename}")
def download_file(filename: str):
    file_path = "example/"+filename
    return FileResponse(file_path, headers={"Content-Disposition": "attachment; filename={filename}"})

# give back a list of datasets information and md info
@app.get("/database/")
async def get_database():
    file_path = 'database.json'
    loaded_list = []
    with open(file_path, 'r') as file:
        loaded_list = json.load(file)
        return {"data": loaded_list}

# give back a list of datasets e.g. BioGRID, ProCan
@app.get("/datasets/")
async def get_database():
    file_path = 'datasets.json'
    loaded_list = []
    with open(file_path, 'r') as file:
        loaded_list = json.load(file)
        return {"data": loaded_list}

# get data for Protein-Drug Plot
@app.get("/biomarkers/")
async def get_biomarkers():
    # global biomarker_data
    # if biomarker_data is not None:
    #    return biomarker_data
    biomarker_data = [{'name': [], 'putative_target': [], 'ppi': [], 'beta': [], 'pval': [], 'uids': []}, {'name': [], 'putative_target': [], 'ppi': [], 'beta': [], 'pval': [], 'uids': []}, {'name': [], 'putative_target': [], 'ppi': [], 'beta': [], 'pval': [], 'uids': []}, {'name': [], 'putative_target': [], 'ppi': [], 'beta': [], 'pval': [], 'uids': []}, {
        'name': [], 'putative_target': [], 'ppi': [], 'beta': [], 'pval': [], 'uids': []}, {'name': [], 'putative_target': [], 'ppi': [], 'beta': [], 'pval': [], 'uids': []}, {'name': [], 'putative_target': [], 'ppi': [], 'beta': [], 'pval': [], 'uids': []}, {'name': [], 'putative_target': [], 'ppi': [], 'beta': [], 'pval': [], 'uids': []}]

    file_path = 'help_tools/neo4j/output.csv'
    with open(file_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            biomarker_info = {
                'drug_name': row['drug_name'],
                'protein_name': row['protein_name'],
                'putative_target': row['putative_target'],
                'ppi': row['ppi'],
                'beta': row['beta'],
                'pval': row['pval']
            }
            i = 0
            if row['ppi'] == "-":
                i = 0
            elif row['ppi'] == "1":
                i = 1
            elif row['ppi'] == "2":
                i = 2
            elif row['ppi'] == "3":
                i = 3
            elif row['ppi'] == "4":
                i = 4
            elif row['ppi'] == "T":
                i = 6
            else:
                i = 5
            biomarker_data[i]['name'].append(
                row['drug_name']+" : "+row['protein_name'])
            biomarker_data[i]['putative_target'].append(row['putative_target'])
            biomarker_data[i]['ppi'].append(row['ppi'])
            biomarker_data[i]['beta'].append(row['beta'])
            biomarker_data[i]['pval'].append(row['pval'])
            biomarker_data[i]['uids'].append(
                [row['drug_uid'], row['protein_uid']])
    return biomarker_data


# get list of filter options e.g. max-min--Values of a attribute
@app.get("/getAllInformation/")
async def get_allInformation():
    with open('allgemeine_info.json', 'r') as json_file:
        coordinate_data = json.load(json_file)
    return coordinate_data

# get cell line tissue data for the plot
@app.get("/getCelllinetissue/")
async def get_tissueData():
    with open('plot_data/tissue_cell_line.json', 'r') as json_file:
        tissue_data = json.load(json_file)
    return tissue_data

# get protein tissue data for the plot
@app.get("/getProteintissue/")
async def get_tissueProteinData():
    with open('plot_data/tissue_protein.json', 'r') as json_file:
        tissueProtein_data = json.load(json_file)
    return tissueProtein_data

# get drug pathway data for the plot
@app.get("/getDrugPathway/")
async def get_drugPathwayData():
    with open('plot_data/pathway_drug.json', 'r') as json_file:
        drugPathway_data = json.load(json_file)
    return drugPathway_data
@app.get("/")
async def get_test():
    test_string = "Test success"
    return test_string


def integrate_table_data2(tx):
    print(uri, password, username)
    query = "MATCH (d:Drug) RETURN count(d) AS drug_count"
    result = tx.run(query)
    print("LOL")
    print("LOL2: ", result.single())
    #print(result.single()["drug_count"])

@app.get("/test2")
def get_test():
    test_string = "Test success2"
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session2:
            session2.write_transaction(integrate_table_data2)
    return test_string