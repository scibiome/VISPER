import pandas as pd
import shutil
import json
from neo4j import GraphDatabase
from updateDBInfo import updateDB
import networkx as nx
import warnings
import random
import string
import os
###########################################
# Write new uploaded file to the neo4j db #
###########################################


generated_strings = set()

#uri = os.getenv("NEO4J_URI")
#username = os.getenv("NEO4J_USER")
#password = os.getenv("NEO4J_PASSWORD")

uri = "bolt://localhost:7687"
username = "neo4j"      
password = "workwork"  

# integrate all file types that are not graphml in to the neo4j db
def integrate_table_data(tx, projectName, worksheet_name, realProjectName):
    print("Begin Analyse")
    file_path = "data/"
    file_extension = projectName.split(".")[-1]
    original_project_name = projectName
    if file_extension == "xlsx":
        read_xlsx = pd.read_excel(file_path+projectName, sheet_name=worksheet_name)
        read_xlsx.to_csv(file_path+projectName.split(".")[0]+".csv", index = None, header=True)
        projectName = projectName.split(".")[0]+".csv"
        file_extension = projectName.split(".")[-1]
    if file_extension in ["csv","xlsx","tsv"]:

        #################
        # Get Seperator #
        #################
        seperator = ""
        if file_extension == "tsv":
            seperator = "\t"
        if file_extension == "csv":
            with open(file_path+projectName, 'r') as file:
                first_row = file.readline()
                number_of_semicolons = first_row.count(";")
                number_of_commas = first_row.count(",")
                if number_of_semicolons > number_of_commas:
                    seperator = ";"
                else:
                    seperator = ","
        shutil.copy(file_path+projectName, "D:/neo4j/import")

        # Get settings
        settings_list = []
        file_path_settings = "settings/"
        with open(file_path_settings+original_project_name+".json", 'r') as file:
            settings_list = json.load(file)

        
        # identify nodes
        load_part = """LOAD CSV WITH HEADERS FROM 'file:///"""+projectName+"""' AS row\n"""
        
        seperator_part = """FIELDTERMINATOR '"""+seperator+"""'"""
        query = load_part+seperator_part
        first_node_type = ""
        first_node_type_id = ""
        second_node_type = ""
        second_node_type_id = ""
        first_node = ""
        second_node = ""
        association_exists = False
        for set_element in settings_list:
            print(set_element)
            if set_element['selectedType'] == "Drug name":
                if first_node_type == "":
                    first_node_type = "Drug"
                    first_node_type_id = set_element['originalName']
                else:
                    second_node_type = "Drug"
                    second_node_type_id = set_element['originalName']
            if set_element['selectedType'] == "Gen name":
                if first_node_type == "":
                    first_node_type = "Protein"
                    first_node_type_id = set_element['originalName']
                else:
                    second_node_type = "Protein"
                    second_node_type_id = set_element['originalName']
            if set_element['selectedType'] == "Cell_Line name":
                if first_node_type == "":
                    first_node_type_id = set_element['originalName']
                    first_node_type = "Cell_Line"
                else:
                    second_node_type = "Cell_Line"
                    second_node_type_id = set_element['originalName']
            if "ID" in set_element['selectedType']:
                if first_node_type == "":
                    first_node_type = set_element['selectedType'][:-3]
                    first_node_type_id = set_element['originalName']
                else:
                    second_node_type = set_element['selectedType'][:-3]
                    second_node_type_id = set_element['originalName']
            if "association" in set_element['selectedType']:
                print("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
                association_exists = True
        info1 = False
        info2 = False
        with_add3 = ""
        with_add4 = ""
        with_add1 = ""
        with_add2 = ""
        print(first_node_type, 101)
        if first_node_type != "":
            print(first_node_type, 103)
            with_add3 = " a,"
            first_node = """\nMERGE (a:"""+first_node_type+""" {name: row."""+first_node_type_id+"""})"""
            query = query + first_node
            for set_element in settings_list:
                print(first_node_type+' information', set_element['selectedType'])
                if set_element['selectedType'] == first_node_type+' information':
                    info1 = True
                    break
        df = pd.read_csv(file_path+projectName)        
        column_info = []
        for column_name, dtype in zip(df.columns, df.dtypes):
            column_info.append({'column_name': column_name, 'data_type': dtype.name})           
        
        association_part = ""
        if info1:
            print("info1 is in house 117")
            for set_element in settings_list:
                if first_node_type+" information" in set_element['selectedType']:
                    is_float = False
                    is_int = False
                    is_string = True
                    for i in column_info:
                        if i['column_name'] == set_element['originalName']:
                            if i['data_type'] == 'float64':
                                is_float = True
                                is_string = False
                            if i['data_type'] == 'int64':
                                is_int = True
                                is_string = False
                            break
                    if is_float:
                        association_part = association_part + """, a."""+set_element['changedName']+"""_"""+projectName.split(".")[0]+""" = toFloat(row."""+set_element['originalName']+""")"""
                    if is_int:
                        association_part = association_part + """, a."""+set_element['changedName']+"""_"""+projectName.split(".")[0]+""" = toInteger(row."""+set_element['originalName']+""")"""                        
                    if is_string:
                        association_part = association_part + """, a."""+set_element['changedName']+"""_"""+projectName.split(".")[0]+""" = row."""+set_element['originalName']+""""""
            a2 ="""\nON CREATE SET a.project_id_"""+projectName.split(".")[0]+""" = 1, a.uid = apoc.create.uuid()"""+association_part
            a3 = """\nON MATCH SET a.project_id_"""+projectName.split(".")[0]+""" = 1 """ +association_part
            association_part = a2 + a3

        query = query + association_part
        print("QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ", association_part)
        if second_node_type != "":
            with_add4 = " b,"
            second_node = """\nMERGE (b:"""+second_node_type+""" {name: row."""+second_node_type_id+"""})"""
            query = query + second_node
            for set_element in settings_list:
                if set_element['selectedType'] == second_node_type+' information':
                    info2 = True
                    break


        association_part = ""
        if info2:
            for set_element in settings_list:
                print(160, second_node_type+"information", set_element['selectedType'])
                if second_node_type+" information" in set_element['selectedType']:
                    is_float = False
                    is_int = False
                    is_string = True
                    for i in column_info:
                        if i['column_name'] == set_element['originalName']:
                            if i['data_type'] == 'float64':
                                is_float = True
                                is_string = False
                            if i['data_type'] == 'int64':
                                is_int = True
                                is_string = False
                            break
                    if is_float:
                        association_part = association_part + """, b."""+set_element['changedName']+"""_"""+projectName.split(".")[0]+""" = toFloat(row."""+set_element['originalName']+""")"""
                    if is_int:
                        association_part = association_part + """, b."""+set_element['changedName']+"""_"""+projectName.split(".")[0]+""" = toInteger(row."""+set_element['originalName']+""")"""                        
                    if is_string:
                        association_part = association_part + """, b."""+set_element['changedName']+"""_"""+projectName.split(".")[0]+""" = row."""+set_element['originalName']+""""""
            a2 = """\nON CREATE SET b.project_id_"""+projectName.split(".")[0]+""" = 1, b.uid = apoc.create.uuid()"""+association_part
            a3 = """\nON MATCH SET b.project_id_"""+projectName.split(".")[0]+""" = 1 """ +association_part
            association_part = a2 + a3

        query = query + association_part
        association_part = """"""
        if association_exists or info1 or info2:
            association_part = """\nWITH"""+with_add3+with_add4+with_add1+with_add2+""" row"""
     
        print("Punkt2")
        if association_exists:
            association_part = association_part + """\nCREATE (a)-[r:"""+first_node_type+"""_"""+second_node_type+"""_"""+realProjectName+"""]->(b)"""
            first_ass = True
            for set_element in settings_list:
                if "association" in set_element['selectedType']:
                    if first_ass:
                        first_ass = False
                        is_float = False
                        is_int = False
                        is_string = True
                        for i in column_info:
                            if i['column_name'] == set_element['originalName']:
                                if i['data_type'] == 'float64':
                                    is_float = True
                                    is_string = False
                                if i['data_type'] == 'int64':
                                    is_int = True
                                    is_string = False
                                break
                        if is_float:
                            association_part = association_part + """\nSET r."""+set_element['changedName']+""" = toFloat(row."""+set_element['originalName']+""")"""
                        if is_int:
                            association_part = association_part + """\nSET r."""+set_element['changedName']+""" = toInteger(row."""+set_element['originalName']+""")"""                        
                        if is_string:
                            association_part = association_part + """\nSET r."""+set_element['changedName']+""" = row."""+set_element['originalName']+""""""
                        association_part = association_part+""",\nr.uid = apoc.create.uuid(),\nr.project_id_"""+projectName.split(".")[0]+""" = 1"""
                    else:
                        first_ass = False
                        is_float = False
                        is_int = False
                        is_string = True
                        for i in column_info:
                            if i['column_name'] == set_element['originalName']:
                                if i['data_type'] == 'float64':
                                    is_float = True
                                    is_string = False
                                if i['data_type'] == 'int64':
                                    is_int = True
                                    is_string = False
                                break
                        if is_float:
                            association_part = association_part + """,\nr."""+set_element['changedName']+""" = toFloat(row."""+set_element['originalName']+""")"""
                        if is_int:
                            association_part = association_part + """,\nr."""+set_element['changedName']+""" = toInteger(row."""+set_element['originalName']+""")"""                        
                        if is_string:
                            association_part = association_part + """,\nr."""+set_element['changedName']+""" = row."""+set_element['originalName']+""""""

        #query = load_part+seperator_part+first_node+second_node+association_part
        query = query + association_part
        print(query)
        tx.run(query)
        loaded_list = []
        with open('database.json', 'r') as file:
            loaded_list = json.load(file)
        for i in loaded_list:
            if i[1] == projectName:
                i[4] =1
                break
        with open('database.json', 'w') as file:
            json.dump(loaded_list, file)



# creates a random string with the length ten
def random_string():
    letters = string.ascii_lowercase  # Contains only lowercase letters

    while True:
        random_str = ''.join(random.choice(letters) for _ in range(10))
        if random_str not in generated_strings:
            generated_strings.add(random_str)
            return random_str


# integrate graphml file in to the neo4j db
def graphml_worker(tx, projectName):
    warnings.filterwarnings("ignore", category=UserWarning)
    G = nx.read_graphml("data/"+projectName)
    mega_query = """"""
    for node, attributes in G.nodes(data=True):
        name = ""
        node_type = ""
        node_attributes = ""
        all_random_strings = []
        found_random_string = True
        #random_str = random_string()
        random_str2 = random_string()
        print(f"Node ID: {node}")
        for key, value in attributes.items():
            if  key != "label" and not value.replace('.','',1).isdigit():
                if not ("[" in value and "]" in value):
                    value = "'"+value+"'"
                    print("Values:", value)
            if key == "label":
                node_type = value
                mega_query = mega_query + """"""
                print(f"  {key}: {value}")
            elif key == "name":
                name = value
            else:
                node_attributes =  node_attributes+""", """+node+"""."""+key+"""_"""+ projectName.split(".")[0] + """ = """+value
        if mega_query != "":
            mega_query = mega_query + "\n"
        mega_query = mega_query + """MERGE ("""+node+""":"""+node_type+""" {name: """+name+"""})"""
        #create node info
        if node_attributes != "":
            mega_query = mega_query + """\nON CREATE SET """+node+""".project_id_"""+projectName.split(".")[0]+""" = 1"""+node_attributes + """, """+node+""".uid = apoc.create.uuid()"""
            mega_query = mega_query + """\nON MATCH SET """+node+""".project_id_"""+projectName.split(".")[0]+""" = 1"""+node_attributes
            #mega_query = mega_query + """\nCREATE ("""+random_str2+""":"""+node_type+"""_information {name: """+projectName.split(".")[0]+node_attributes+"""})"""
            #mega_query = mega_query + """\nCREATE ("""+node+""")-[:info"""+projectName.split(".")[0]+"""]->("""+random_str2+""")"""
        
    for source, target, attributes in G.edges(data=True):
        attribute_list = """"""
        get_key = """dataset_"""+projectName.split(".")[0]
        for key, value in attributes.items():
            if not value.replace('.','',1).isdigit():
                if not ("[" in value and "]" in value):
                    value = "'"+value+"'"
                    print("Values:", value)
            if key != "id" and key != "label":
                if attribute_list != """""":
                    attribute_list = attribute_list + """, """
                else:
                    attribute_list = attribute_list + """ {"""
                    attribute_list = attribute_list + """uid: apoc.create.uuid(), project_id_"""+projectName.split(".")[0]+""": 1, """
                attribute_list = attribute_list + key + """: """+ value
            if key == "label":
                get_key = value[1:-1]
        #if len(attribute_list) > 0:
        attribute_list = attribute_list +"""}"""
        #mega_query = mega_query + """\nCREATE ("""+source+""")-[:dataset_"""+projectName.split(".")[0]+attribute_list+"""]->("""+target+""")"""
        print(attribute_list)
        mega_query = mega_query + """\nCREATE ("""+source+""")-[:"""+get_key+attribute_list+"""]->("""+target+""")"""
    print(mega_query)

    tx.run(mega_query)
    loaded_list = []
    with open('database.json', 'r') as file:
        loaded_list = json.load(file)
    for i in loaded_list:
        if i[1] == projectName:
            i[4] =1
            break
    with open('database.json', 'w') as file:
        json.dump(loaded_list, file)


# get file information and starts integartion process based on file extension
def getFile(projectName, worksheet_name, realProjectName):
    print("getFile")
    file_extension = projectName.split(".")[-1]
    print(projectName)
    if file_extension in ['xlsx', 'csv', 'tsv']:       
        with GraphDatabase.driver(uri, auth=(username, password)) as driver:
            with driver.session() as session2:
                session2.write_transaction(integrate_table_data, projectName=projectName, worksheet_name=worksheet_name, realProjectName=realProjectName)
    else:
        with GraphDatabase.driver(uri, auth=(username, password)) as driver:
            with driver.session() as session3:
                session3.write_transaction(graphml_worker, projectName=projectName)
    updateDB()

#getFile("2.csv","")