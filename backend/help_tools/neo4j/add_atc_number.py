import json
from neo4j import GraphDatabase

##############################################################################################################################
# For internal purposes we add ATC_number.                                                                                   #
# ATC_number is a number that represents the 1st level of the ATC Code and is used for color coding.                         #
# So when the user would like to only see drugs from the category L only nodes will be shown that have a specific ATC_number.#
##############################################################################################################################

uri = "bolt://localhost:7687"  
username = "neo4j"            
password = "workwork"  

def addATCCode(tx):
    query = """
    MATCH (d:Drug)
    WHERE d.ATC IS NOT NULL
    RETURN d.uid AS uid, d.ATC AS ATC
    """
    results = tx.run(query)
    data = ['Many']
    for record in results:
        all_atcs = record['ATC']
        #print(type(record['ATC']))
        multiple = False
        old_position = -1
        position = -1
        for a in all_atcs:
            if a[0] in data:
                position = data.index(a[0])
            else:
                data.append(a[0])
                position = data.index(a[0])
            if old_position > -1 and position > -1 and old_position != position:
                multiple = True
            old_position = position
        if multiple:
            position = 0
        query2 = """
        MATCH (d:Drug)
        WHERE d.uid = $uid
        SET d.ATC_number = $atc_num
        """
        tx.run(query2, atc_num = position, uid= record['uid'])
        print(record['ATC'], data)

# data: ['Many', 'C', 'L', 'A', 'S', 'J', 'D', 'P', 'R']


def updateDB():
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            session.write_transaction(addATCCode)
updateDB()
