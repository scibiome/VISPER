import networkx as nx
import warnings
import random
import string
######################################
# Test for graphml integration in db #
######################################


generated_strings = set()

def random_string():
    letters = string.ascii_lowercase  # Contains only lowercase letters

    while True:
        random_str = ''.join(random.choice(letters) for _ in range(10))
        if random_str not in generated_strings:
            generated_strings.add(random_str)
            return random_str

def graphml_worker(projectName):
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
            if key == "label":
                node_type = value
                mega_query = mega_query + """"""
                print(f"  {key}: {value}")
            elif key == "name":
                name = value
            else:
                node_attributes =  node_attributes+", "+ key + """: '"""+value+"""'"""
        if mega_query != "":
            mega_query = mega_query + "\n"
        mega_query = mega_query + """MERGE ("""+node+""":"""+node_type+""" {name: '"""+name+"""'})"""
        #create node info
        if node_attributes != "":
            mega_query = mega_query + """\nCREATE ("""+random_str2+""":"""+node_type+"""_information {name: """+projectName.split(".")[0]+node_attributes+"""})"""
            mega_query = mega_query + """\nCREATE ("""+node+""")-[:info"""+projectName.split(".")[0]+"""]->("""+random_str2+""")"""
        
    for source, target, attributes in G.edges(data=True):
        attribute_list = """"""
        for key, value in attributes.items():
            if key != "id":
                if attribute_list != """""":
                    attribute_list = attribute_list + """, """
                else:
                    attribute_list = attribute_list + """ {"""
                attribute_list = attribute_list + key + """: '"""+ value+"""'"""
        if len(attribute_list) > 0:
            attribute_list = attribute_list + """}"""
        mega_query = mega_query + """\nCREATE ("""+source+""")-[:dataset"""+projectName.split(".")[0]+attribute_list+"""]->("""+target+""")"""
    print(mega_query)
        


graphml_worker("5.graphml")






