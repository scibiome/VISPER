from neo4j import GraphDatabase
import numpy as np
import pandas as pd
uri = "bolt://localhost:7687"  
username = "neo4j"             
password = "workwork"

###################################################################################################
# Calculate distance between a node and the next 10 nodes with the highest simialrity ina cluster #
###################################################################################################

def calculate_distance(d1, d2, width, height):
    # Implement your distance calculation logic here
    # Example: Euclidean distance calculation if d1 and d2 have x and y coordinates
    x1, y1 = d1["drug_drug_GDSC1_cosine_tsne_x"], d1["drug_drug_GDSC1_cosine_tsne_y"]
    x2, y2 = d2["drug_drug_GDSC1_cosine_tsne_x"], d2["drug_drug_GDSC1_cosine_tsne_y"]
    print(width, height)
    normalized_x_distance1 = abs(x2 - x1) / width
    normalized_y_distance1 = abs(y2 - y1) / height
    distance = np.sqrt((normalized_x_distance1) ** 2 + (normalized_y_distance1) ** 2)
    #distance = np.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
    return distance
def addSimilarity(tx, GDSC, drug_id_list):
    s1 = []
    s2 = []
    s3 = []
    s4 = []
    query = (
        "MATCH (d1)-[s:DRUG_SIMILARITY {dataset:  '"+GDSC+"'}]-(d2) \n RETURN d1.drug_drug_GDSC1_cosine_tsne_x  AS x \n ORDER BY x DESC LIMIT 1"
    )
    result_x_max = tx.run(query)
    x_max = result_x_max.single()[0]
    query = (
        "MATCH (d1)-[s:DRUG_SIMILARITY {dataset:  '"+GDSC+"'}]-(d2) \n RETURN d1.drug_drug_GDSC1_cosine_tsne_x  AS x \n ORDER BY x ASC LIMIT 1"
    )
    result_x_max = tx.run(query)
    x_min = result_x_max.single()[0]
    query = (
        "MATCH (d1)-[s:DRUG_SIMILARITY {dataset:  '"+GDSC+"'}]-(d2) \n RETURN d1.drug_drug_GDSC1_cosine_tsne_y  AS x \n ORDER BY x DESC LIMIT 1"
    )
    result_x_max = tx.run(query)
    y_max = result_x_max.single()[0]
    query = (
        "MATCH (d1)-[s:DRUG_SIMILARITY {dataset:  '"+GDSC+"'}]-(d2) \n RETURN d1.drug_drug_GDSC1_cosine_tsne_y  AS x \n ORDER BY x ASC LIMIT 1"
    )
    result_x_max = tx.run(query)
    y_min = result_x_max.single()[0]
    width = x_max - x_min
    height = y_max - y_min



    print("drug_id | lowest distance | highest distance | average distance | median distance | Gesamtentfernung mit gesamten Graph für den höchsten Wert")
    for drug in drug_id_list:
        distances = []
        query = (
            "MATCH (d1:Drug {drug_id:'"+drug+ "'}) \n MATCH (d1)-[s:DRUG_SIMILARITY {dataset:  '"+GDSC+"'}]-(d2) \n RETURN d1, d2, s.value AS similarity_value \n ORDER BY similarity_value DESC LIMIT 5"
        )
        #print(query)
        results = tx.run(query)
        for record in results:
            d1 = record["d1"]
            d2 = record["d2"]
            # Calculate the distance between d1 and d2 (you need to define your distance calculation logic)
            # For example, you can calculate Euclidean distance if the coordinates are provided.
            distance = calculate_distance(d1, d2, width, height)  # Implement this function

            distances.append(distance)
        #print(drug)
        # Im Fall 52 existieren keine drug similarities, da alle Werte 0 sind
        if len(distances) > 0:
            lowest_distance = round(min(distances), 3)
            highest_distance = round(max(distances), 3)
            average_distance = round(np.mean(distances), 3)
            median_distance = round(np.median(distances), 3)
            overall_distance_in_our_graph = round((highest_distance / 60)*100, 3)
            
            #print(drug, lowest_distance, highest_distance, average_distance, median_distance)
            s1.append(lowest_distance)
            s2.append(highest_distance)
            s3.append(average_distance)
            s4.append(median_distance)
                
    #print(counter)
    print(round((np.median(s1)),3), round((np.average(s1)),3),round((np.median(s2)),3), round((np.average(s2)),3),round((np.median(s3)),3), round((np.average(s3)),3),round((np.median(s4)),3), round((np.average(s4)),3))



all_drugs = ['1001', '1004', '1005', '1006', '1007', '1010', '1011', '1012', '1013', '1014', '1015', '1016', '1017', '1018', '1019', '1021', '1022', '1024', '1026', '1029', '1030', '1031', '1032', '1033', '1036', '1037', '1038', '1039', '104', '1043', '1046', '1047', '1048', '1049', '1050', '1052', '1053', '1054', '1057', '1058', '1059', '106', '1060', '1061', '1062', '1066', '1069', '1091', '11', '1114', '1133', '1135', '1136', '1142', '1149', '1166', '1170', '1175', '1184', '1185', '119', '1192', '1194', '1219', '1230', '1236', '1239', '1241', '1242', '1243', '1248', '1259', '1261', '1262', '1266', '1268', '127', '133', '134', '135', '136', '1371', '1372', '1373', '1374', '1375', '1376', '1377', '1378', '1382', '1386', '1392', '1393', '1394', '1401', '1402', '1403', '1407', '1409', '1413', '1414', '1416', '1419', '1421', '1422', '1425', '1426', '1427', '1428', '1429', '1430', '1432', '1434', '1436', '1441', '1444', '1445', '1446', '1451', '1453', '1458', '1459', '1460', '1461', '1463', '1464', '1494', '1495', '1496', '1497', '1498', '1502', '1515', '1516', '1518', '1520', '1525', '1526', '1527', '153', '1535', '154', '1543', '1544', '1546', '1547', '155', '156', '159', '163', '165', '166', '167', '17', '170', '171', '172', '173', '176', '177', '179', '180', '182', '186', '190', '192', '194', '196', '199', '200', '201', '204', '205', '207', '211', '219', '221', '222', '223', '224', '225', '226', '228', '229', '230', '235', '236', '245', '249', '252', '254', '255', '256', '257', '261', '262', '263', '264', '265', '268', '269', '275', '276', '277', '279', '281', '282', '284', '285', '286', '288', '29', '290', '292', '293', '294', '295', '3', '300', '301', '302', '304', '306', '308', '309', '310', '312', '317', '32', '326', '329', '330', '331', '34', '341', '342', '344', '345', '346', '35', '356', '362', '363', '366', '37', '371', '372', '374', '376', '38', '380', '381', '406', '407', '408', '409', '412', '416', '427', '428', '431', '432', '435', '436', '437', '438', '439', '442', '446', '447', '449', '45', '461', '474', '476', '477', '478', '5', '51', '52', '53', '54', '546', '55', '552', '56', '562', '563', '574', '576', '59', '62', '63', '71', '83', '86', '9', '94']   
def update_database():   
    with GraphDatabase.driver(uri, auth=(username, password)) as driver:
        with driver.session() as session:
            session.write_transaction(addSimilarity, GDSC='GDSC1', drug_id_list = all_drugs)

#update_database()
#['1422', '3', '1012','194','329','165','1502','275','249','276']
#['180','1377','1392','1460','1498']